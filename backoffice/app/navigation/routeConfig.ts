import { ROUTES } from "../../utils/constants";
import type { ModulePermissionKey } from "../../utils/roles";

export type NavLeafItem = {
  path: string;
  label: string;
  moduleKey: ModulePermissionKey;
};

export type NavSection = {
  id: string;
  label: string;
  moduleKey: ModulePermissionKey;
  children: NavLeafItem[];
};

export const dashboardItem: NavLeafItem = {
  path: ROUTES.dashboard,
  label: "Dashboard",
  moduleKey: "dashboard"
};

export const navSections: NavSection[] = [
  {
    id: "approvals",
    label: "Approvals",
    moduleKey: "users",
    children: [
      { path: ROUTES.approvalsSignup, label: "Signup", moduleKey: "users" },
      { path: ROUTES.approvalsLease, label: "Lease", moduleKey: "users" },
      { path: ROUTES.approvalsActivities, label: "Activities", moduleKey: "bookings" },
      { path: ROUTES.approvalsTools, label: "Tools", moduleKey: "users" },
      { path: ROUTES.approvalsMarketPromos, label: "Market Place / Promos", moduleKey: "market" },
      { path: ROUTES.approvalsMarketPosts, label: "Market Place / Posts", moduleKey: "market" }
    ]
  },
  {
    id: "operations",
    label: "Operations",
    moduleKey: "apartments",
    children: [
      { path: ROUTES.operationsTowers, label: "Towers", moduleKey: "apartments" },
      { path: ROUTES.operationsApartments, label: "Apartments", moduleKey: "apartments" },
      { path: ROUTES.operationsUsers, label: "Users", moduleKey: "users" },
      { path: ROUTES.operationsLocks, label: "Locks", moduleKey: "gate" },
      { path: ROUTES.operationsKeyfobs, label: "Keyfobs", moduleKey: "gate" },
      { path: ROUTES.operationsSecurity, label: "Security", moduleKey: "gate" }
    ]
  },
  {
    id: "society",
    label: "Society",
    moduleKey: "societies",
    children: [
      { path: ROUTES.societyUsefulInformation, label: "Useful Information", moduleKey: "societies" },
      { path: ROUTES.societySmartSolutions, label: "Smart Solutions", moduleKey: "societies" },
      { path: ROUTES.societyAmenities, label: "Amenities", moduleKey: "bookings" },
      { path: ROUTES.societyTools, label: "Tools", moduleKey: "societies" },
      { path: ROUTES.societySettings, label: "Settings", moduleKey: "societies" },
      { path: ROUTES.societyLiveCamera, label: "Live Camera", moduleKey: "societies" }
    ]
  },
  {
    id: "communication",
    label: "Communication",
    moduleKey: "notices",
    children: [
      { path: ROUTES.communicationNotices, label: "Notices", moduleKey: "notices" },
      { path: ROUTES.communicationNews, label: "News", moduleKey: "notices" },
      { path: ROUTES.communicationNotifications, label: "Notifications", moduleKey: "notices" },
      { path: ROUTES.communicationDocStorage, label: "Doc Storage", moduleKey: "notices" },
      { path: ROUTES.communicationGroups, label: "Groups", moduleKey: "notices" },
      { path: ROUTES.communicationPollsAndSurvey, label: "Polls and Survey", moduleKey: "notices" },
      { path: ROUTES.communicationPlanetAds, label: "Planet Ads", moduleKey: "notices" },
      { path: ROUTES.communicationNewsFeeds, label: "News Feeds", moduleKey: "notices" }
    ]
  },
  {
    id: "payments",
    label: "Payments",
    moduleKey: "bookings",
    children: [
      { path: ROUTES.paymentsInvoices, label: "Invoices", moduleKey: "bookings" },
      { path: ROUTES.paymentsReceipts, label: "Receipts", moduleKey: "bookings" },
      { path: ROUTES.paymentsReports, label: "Reports", moduleKey: "bookings" }
    ]
  },
  {
    id: "gate",
    label: "Gate",
    moduleKey: "gate",
    children: [
      { path: ROUTES.gateVisitorsLog, label: "Visitor's Log", moduleKey: "gate" },
      { path: ROUTES.gateGuards, label: "Guards", moduleKey: "gate" },
      { path: ROUTES.gateLinkedDevices, label: "Linked Devices", moduleKey: "gate" },
      { path: ROUTES.gateDailyHelp, label: "Daily Help", moduleKey: "gate" }
    ]
  },
  {
    id: "settings",
    label: "Settings",
    moduleKey: "societies",
    children: [
      { path: ROUTES.settingsCities, label: "Cities", moduleKey: "societies" },
      { path: ROUTES.settingsSocieties, label: "Societies", moduleKey: "societies" },
      { path: ROUTES.settingsRoles, label: "Roles", moduleKey: "societies" },
      { path: ROUTES.settingsLogs, label: "Logs", moduleKey: "societies" },
      { path: ROUTES.settingsDeliveryItems, label: "Delivery Items", moduleKey: "societies" },
      { path: ROUTES.settingsCategories, label: "Categories", moduleKey: "societies" }
    ]
  }
];

export const allNavItems: NavLeafItem[] = [dashboardItem, ...navSections.flatMap((section) => section.children)];

