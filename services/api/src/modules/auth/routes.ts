import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "../../shared/store/db.js";
import type { Role } from "../../shared/types.js";
import { validate } from "../../shared/http.js";
import { refreshTokenStore } from "./tokenStore.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

const VALID_PASSWORD = "Planet@123";
const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const user = db.users.find((item) => item.email.toLowerCase() === req.body.email.toLowerCase());
  if (!user || req.body.password !== VALID_PASSWORD) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const role = user.role as Role;
  const refreshToken = randomUUID();
  await refreshTokenStore.save(refreshToken, user.id, REFRESH_TTL_SECONDS);

  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TTL_SECONDS * 1000).toISOString();
  const accessToken = `token-${role.toLowerCase()}-${user.id}`;

  res.json({
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    expiresInSeconds: ACCESS_TTL_SECONDS,
    refreshExpiresInSeconds: REFRESH_TTL_SECONDS,
    user,
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

  const role = user.role as Role;
  const nextRefreshToken = randomUUID();
  await refreshTokenStore.rotate(req.body.refreshToken, nextRefreshToken, user.id, REFRESH_TTL_SECONDS);

  const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TTL_SECONDS * 1000).toISOString();
  const accessToken = `token-${role.toLowerCase()}-${user.id}`;
  res.json({
    accessToken,
    refreshToken: nextRefreshToken,
    accessTokenExpiresAt,
    expiresInSeconds: ACCESS_TTL_SECONDS,
    refreshExpiresInSeconds: REFRESH_TTL_SECONDS,
    user,
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
