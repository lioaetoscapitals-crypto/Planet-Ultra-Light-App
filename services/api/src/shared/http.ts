import type { NextFunction, Request, Response } from "express";
import { z, type ZodError } from "zod";
import { can, type Permission } from "./rbac.js";
import type { Role } from "./types.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const roleHeader = req.header("x-role") as Role | undefined;
  const userIdHeader = req.header("x-user-id") || "usr-admin-001";
  const role: Role = roleHeader ?? "Admin";
  req.user = { id: userIdHeader, role };
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
