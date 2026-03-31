export type Role = "Admin" | "Manager" | "Security";

export type ModulePermissionKey =
  | "dashboard"
  | "gate"
  | "invitations"
  | "bookings"
  | "notices"
  | "market"
  | "users"
  | "apartments"
  | "societies";

export const rolePermissions: Record<Role, ModulePermissionKey[]> = {
  Admin: ["dashboard", "gate", "invitations", "bookings", "notices", "market", "users", "apartments", "societies"],
  Manager: ["dashboard", "gate", "invitations", "bookings", "notices", "market", "users", "apartments", "societies"],
  Security: ["dashboard", "gate", "invitations"]
};

export function canAccess(role: Role, moduleKey: ModulePermissionKey) {
  return rolePermissions[role].includes(moduleKey);
}
