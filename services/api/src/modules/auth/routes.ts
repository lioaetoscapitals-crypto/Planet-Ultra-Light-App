import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "../../shared/store/db.js";
import type { Role } from "../../shared/types.js";
import { validate } from "../../shared/http.js";
import { refreshTokenStore } from "./tokenStore.js";
import { issueAccessToken } from "./accessToken.js";
import { verifyPassword, hashPassword } from "./password.js";
import { authUserStore } from "./userStore.js";
import { onboardingStore } from "../onboarding/store.js";
import { nowIso } from "../../shared/utils.js";

const loginSchema = z.object({
  user_id: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6),
}).refine((payload) => Boolean(payload.user_id || payload.email), {
  message: "user_id or email is required",
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(10),
});

const logoutAllSchema = z.object({
  userId: z.string().optional(),
});

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;
const BO_DEFAULT_SYNC_PASSWORD = "Planet@123";

function normalizeExternalUserId(userId: string): string {
  return userId.includes("@") ? userId.trim().toLowerCase() : userId.trim();
}

function mapBoRoleToPaRole(role: string): Role {
  const normalized = role.toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "gatekeeper" || normalized === "staff" || normalized === "security") return "Security";
  return "Resident";
}

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const userIdInput = req.body.user_id ? normalizeExternalUserId(req.body.user_id) : undefined;
  const authUser = req.body.user_id
    ? await authUserStore.findByUserId(userIdInput as string)
    : await authUserStore.findByEmail(String(req.body.email));

  if (!authUser || authUser.status !== "active") {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isPasswordValid = await verifyPassword(req.body.password, authUser.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const user = db.users.find((item) => item.id === authUser.userId);
  if (!user || user.status !== "Active" || user.societyId !== authUser.societyId) {
    res.status(401).json({ message: "User is not active in PA" });
    return;
  }

  const role = authUser.role;
  const refreshToken = randomUUID();
  await refreshTokenStore.save(refreshToken, authUser.userId, REFRESH_TTL_SECONDS);

  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TTL_SECONDS * 1000).toISOString();
  const accessToken = issueAccessToken({
    sub: authUser.userId,
    role,
    societyId: authUser.societyId,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS,
  });

  res.json({
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    expiresInSeconds: ACCESS_TTL_SECONDS,
    refreshExpiresInSeconds: REFRESH_TTL_SECONDS,
    user: {
      id: authUser.userId,
      role: authUser.role,
      societyId: authUser.societyId,
      email: authUser.email,
      status: user.status,
      fullName: user.fullName,
    },
  });
});

authRouter.post("/refresh", validate(refreshSchema), async (req, res) => {
  const tokenRecord = await refreshTokenStore.findActive(req.body.refreshToken);
  if (!tokenRecord) {
    res.status(401).json({ message: "Invalid refresh token" });
    return;
  }

  const user = db.users.find((item) => item.id === tokenRecord.userId);
  if (!user || user.status !== "Active") {
    res.status(401).json({ message: "Session is no longer valid" });
    return;
  }

  const authUser = await authUserStore.findByUserId(user.id);
  if (!authUser || authUser.status !== "active") {
    res.status(401).json({ message: "Session is no longer valid" });
    return;
  }
  const role = authUser.role;
  const nextRefreshToken = randomUUID();
  await refreshTokenStore.rotate(req.body.refreshToken, nextRefreshToken, user.id, REFRESH_TTL_SECONDS);

  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TTL_SECONDS * 1000).toISOString();
  const accessToken = issueAccessToken({
    sub: authUser.userId,
    role,
    societyId: authUser.societyId,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS,
  });
  res.json({
    accessToken,
    refreshToken: nextRefreshToken,
    accessTokenExpiresAt,
    expiresInSeconds: ACCESS_TTL_SECONDS,
    refreshExpiresInSeconds: REFRESH_TTL_SECONDS,
    user: {
      id: authUser.userId,
      role: authUser.role,
      societyId: authUser.societyId,
      email: authUser.email,
      status: user.status,
      fullName: user.fullName,
    },
  });
});

authRouter.post("/logout", validate(logoutSchema), async (req, res) => {
  const revoked = await refreshTokenStore.revoke(req.body.refreshToken);
  res.json({ success: revoked });
});

authRouter.post("/logout-all", validate(logoutAllSchema), async (req, res) => {
  const fallbackUserId = req.header("x-user-id");
  const userId = req.body.userId ?? fallbackUserId;
  if (!userId) {
    res.status(422).json({ message: "userId is required" });
    return;
  }
  const revoked = await refreshTokenStore.revokeAllForUser(userId);
  res.json({ success: revoked });
});

authRouter.post("/sync-bo-users", async (_req, res) => {
  const roleHeader = String(_req.header("x-role") ?? "").toLowerCase();
  if (roleHeader !== "admin" && roleHeader !== "manager") {
    res.status(403).json({ message: "Only admin/manager can sync BO users into PA auth store" });
    return;
  }
  const invalidUsers: Array<{ userId: string; reason: string }> = [];
  const dedupe = new Map<string, { id: string; role: Role; societyId: string; email: string; phone: string; name: string }>();

  for (const sourceUser of onboardingStore.users) {
    if (!sourceUser.societyId) {
      invalidUsers.push({ userId: sourceUser.id, reason: "missing society_id" });
      continue;
    }
    const mappedRole = mapBoRoleToPaRole(sourceUser.role);
    const externalUserId = normalizeExternalUserId(sourceUser.id);
    const isEmailUserId = externalUserId.includes("@");
    const derivedEmail = isEmailUserId ? externalUserId : `${externalUserId}@planet.local`;
    const existing = dedupe.get(externalUserId);
    if (!existing) {
      dedupe.set(externalUserId, {
        id: externalUserId,
        role: mappedRole,
        societyId: sourceUser.societyId,
        email: derivedEmail,
        phone: sourceUser.phone,
        name: sourceUser.name,
      });
      continue;
    }
    const rolePriority: Record<Role, number> = { Admin: 3, Security: 2, Manager: 1, Resident: 0 };
    if (rolePriority[mappedRole] > rolePriority[existing.role]) {
      dedupe.set(externalUserId, { ...existing, role: mappedRole, societyId: sourceUser.societyId });
    }
  }

  const now = nowIso();
  for (const mapped of dedupe.values()) {
    const dbUser = db.users.find((item) => item.id === mapped.id);
    if (dbUser) {
      dbUser.role = mapped.role;
      dbUser.societyId = mapped.societyId;
      dbUser.fullName = mapped.name;
      dbUser.phone = mapped.phone;
      dbUser.updatedAt = now;
    } else {
      db.users.push({
        id: mapped.id,
        societyId: mapped.societyId,
        fullName: mapped.name,
        email: mapped.email,
        phone: mapped.phone,
        role: mapped.role,
        status: "Active",
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  const hashedDefault = await hashPassword(BO_DEFAULT_SYNC_PASSWORD);
  await authUserStore.upsertMany(
    [...dedupe.values()].map((mapped) => ({
      userId: mapped.id,
      email: mapped.email,
      role: mapped.role,
      societyId: mapped.societyId,
      passwordHash: hashedDefault,
      status: "active" as const,
      source: "bo_sync" as const,
    })),
  );

  res.json({
    synced_count: dedupe.size,
    invalid_users: invalidUsers,
    default_plain_password_for_synced_users: BO_DEFAULT_SYNC_PASSWORD,
  });
});
