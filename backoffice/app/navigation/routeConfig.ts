import { ROUTES } from "../../utils/constants";

export type NavItem = {
  path: string;
  label: string;
};

export const navItems: NavItem[] = [
  { path: ROUTES.dashboard, label: "Dashboard" },
  { path: ROUTES.users, label: "Users" },
  { path: ROUTES.analytics, label: "Analytics" },
  { path: ROUTES.settings, label: "Settings" }
];
