import type { Role } from "./types.js";

export type Permission =
  | "users.read"
  | "users.write"
  | "apartments.read"
  | "apartments.write"
  | "gate.read"
  | "gate.write"
  | "invitations.read"
  | "invitations.write"
  | "bookings.read"
  | "bookings.write"
  | "notices.read"
  | "notices.write"
  | "market.read"
  | "market.write";

const allPermissions: Permission[] = [
  "users.read",
  "users.write",
  "apartments.read",
  "apartments.write",
  "gate.read",
  "gate.write",
  "invitations.read",
  "invitations.write",
  "bookings.read",
  "bookings.write",
  "notices.read",
  "notices.write",
  "market.read",
  "market.write",
];

const rolePermissions: Record<Role, Permission[]> = {
  Admin: allPermissions,
  Manager: allPermissions.filter((p) => p !== "users.write"),
  Security: ["gate.read", "gate.write", "invitations.read", "invitations.write"],
  Resident: ["invitations.read", "invitations.write", "bookings.read", "bookings.write", "market.read", "market.write", "notices.read"],
};

export const can = (role: Role, permission: Permission): boolean => rolePermissions[role].includes(permission);
