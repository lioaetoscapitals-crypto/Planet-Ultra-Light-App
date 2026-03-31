import { ROUTES } from "../../utils/constants";
import type { ModulePermissionKey } from "../../utils/roles";

export type NavItem = {
  path: string;
  label: string;
  moduleKey: ModulePermissionKey;
};

export const navItems: NavItem[] = [
  { path: ROUTES.dashboard, label: "Dashboard", moduleKey: "dashboard" },
  { path: ROUTES.gate, label: "Gate", moduleKey: "gate" },
  { path: ROUTES.invitations, label: "Invitations", moduleKey: "invitations" },
  { path: ROUTES.bookings, label: "Space Bookings", moduleKey: "bookings" },
  { path: ROUTES.notices, label: "Notices", moduleKey: "notices" },
  { path: ROUTES.market, label: "Market", moduleKey: "market" },
  { path: ROUTES.users, label: "Users", moduleKey: "users" },
  { path: ROUTES.societies, label: "Societies", moduleKey: "societies" },
  { path: ROUTES.apartments, label: "Apartments", moduleKey: "apartments" }
];
