import type { NextFunction, Request, Response } from "express";
import { z, type ZodError } from "zod";
import { can, type Permission } from "./rbac.js";
import type { Role } from "./types.js";
import { verifyAccessToken } from "../modules/auth/accessToken.js";
import { db } from "./store/db.js";
import { authUserStore } from "../modules/auth/userStore.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        societyId: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.header("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({ message: "Invalid access token" });
      return;
    }
    req.user = {
      id: payload.sub,
      role: payload.role,
      societyId: payload.societyId,
    };
    next();
    return;
  }

  const roleHeader = req.header("x-role") as Role | undefined;
  const userIdHeader = req.header("x-user-id") || "usr-admin-001";
  const explicitSocietyHeader = req.header("x-society-id") || undefined;
  const role: Role = roleHeader ?? "Admin";
  let societyId = explicitSocietyHeader;
  if (!societyId) {
    const dbUser = db.users.find((item) => item.id === userIdHeader);
    societyId = dbUser?.societyId;
  }
  if (!societyId) {
    const authUser = await authUserStore.findByUserId(userIdHeader);
    societyId = authUser?.societyId;
  }
  if (!societyId) {
    res.status(401).json({ message: "society_id context missing for current user" });
    return;
  }
  req.user = { id: userIdHeader, role, societyId };
  next();
};

export const requirePermission =
  (permission: Permission) => (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role ?? "Resident";
    if (!can(role, permission)) {
      res.status(403).json({ message: "Forbidden", permission, role });
      return;
    }
    next();
  };

export const validate =
  <T>(schema: z.ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
      return;
    }
    req.body = parsed.data;
    next();
  };

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    const zodError: ZodError = err;
    res.status(422).json({ message: "Validation failed", issues: zodError.issues });
    return;
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(500).json({ message });
};
