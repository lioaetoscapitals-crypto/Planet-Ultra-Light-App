export type MenuItem = {
  id: string;
  label: string;
  iconUri: string;
  hasChevron?: boolean;
  indentDot?: boolean;
};

export type MenuGroup = {
  id: string;
  title: string;
  iconUri: string;
  chevronUri: string;
  rows: MenuItem[];
};

const grid01Icon = "assets/local/icons/grid-01.svg";
const groupIcon = "assets/local/icons/community.svg";
const chevronIcon = "assets/local/icons/chevron-down.svg";
const rowIcon = "assets/local/icons/lock.svg";

export const menuGroups: MenuGroup[] = [
  {
    id: "society",
    title: "Society",
    iconUri: groupIcon,
    chevronUri: chevronIcon,
    rows: [
      { id: "society-useful-information", label: "Useful Information", iconUri: grid01Icon },
      { id: "society-smart-solutions", label: "Smart Solutions", iconUri: grid01Icon },
      { id: "society-amenities", label: "Amenities", iconUri: grid01Icon, hasChevron: true },
      { id: "society-tools", label: "Tools", iconUri: grid01Icon, hasChevron: true },
      { id: "society-settings", label: "Settings", iconUri: grid01Icon, hasChevron: true },
      { id: "society-live-camera", label: "Live Camera", iconUri: grid01Icon, hasChevron: true }
    ]
  },
  {
    id: "communication",
    title: "Communication",
    iconUri: groupIcon,
    chevronUri: chevronIcon,
    rows: [
      { id: "communication-notices", label: "Notices", iconUri: rowIcon },
      { id: "communication-news", label: "News", iconUri: rowIcon },
      { id: "communication-notifications", label: "Notifications", iconUri: rowIcon },
      { id: "communication-doc-storage", label: "Doc Storage", iconUri: rowIcon },
      { id: "communication-groups", label: "Groups", iconUri: rowIcon },
      { id: "communication-polls", label: "Polls and Survey", iconUri: rowIcon },
      { id: "communication-planet-ads", label: "Planet Ads", iconUri: rowIcon },
      { id: "communication-news-feeds", label: "News Feeds", iconUri: rowIcon }
    ]
  },
  {
    id: "approvals",
    title: "Approvals",
    iconUri: groupIcon,
    chevronUri: chevronIcon,
    rows: [
      { id: "approvals-signup", label: "Signup", iconUri: rowIcon },
      { id: "approvals-lease", label: "Lease", iconUri: rowIcon },
      { id: "approvals-activities", label: "Activities", iconUri: rowIcon },
      { id: "approvals-tools", label: "Tools", iconUri: rowIcon },
      { id: "approvals-market-place", label: "Market Place", iconUri: rowIcon, hasChevron: true },
      { id: "approvals-promos", label: "Promos", iconUri: rowIcon, indentDot: true },
      { id: "approvals-posts", label: "Posts", iconUri: rowIcon, indentDot: true }
    ]
  },
  {
    id: "operations",
    title: "Operations",
    iconUri: groupIcon,
    chevronUri: chevronIcon,
    rows: [
      { id: "operations-towers", label: "Towers", iconUri: rowIcon },
      { id: "operations-apartments", label: "Apartments", iconUri: rowIcon },
      { id: "operations-users", label: "Users", iconUri: rowIcon },
      { id: "operations-locks", label: "Locks", iconUri: rowIcon },
      { id: "operations-keyfobs", label: "Keyfobs", iconUri: rowIcon },
      { id: "operations-security", label: "Security", iconUri: rowIcon }
    ]
  },
  {
    id: "payments",
    title: "Payments",
    iconUri: groupIcon,
    chevronUri: chevronIcon,
    rows: [
      { id: "payments-invoices", label: "Invoices", iconUri: rowIcon },
      { id: "payments-receipts", label: "Receipts", iconUri: rowIcon },
      { id: "payments-reports", label: "Reports", iconUri: rowIcon }
    ]
  },
  {
    id: "gate",
    title: "Gate",
    iconUri: groupIcon,
    chevronUri: chevronIcon,
    rows: [
      { id: "gate-visitors-log", label: "Visitor’s Log", iconUri: rowIcon },
      { id: "gate-guards", label: "Guards", iconUri: rowIcon },
      { id: "gate-linked-devices", label: "Linked Devices", iconUri: rowIcon },
      { id: "gate-daily-help", label: "Daily Help", iconUri: rowIcon }
    ]
  },
  {
    id: "settings",
    title: "Settings",
    iconUri: groupIcon,
    chevronUri: chevronIcon,
    rows: [
      { id: "settings-cities", label: "Cities", iconUri: rowIcon },
      { id: "settings-societies", label: "Societies", iconUri: rowIcon },
      { id: "settings-roles", label: "Roles", iconUri: rowIcon },
      { id: "settings-logs", label: "Logs", iconUri: rowIcon },
      { id: "settings-delivery-items", label: "Delivery Items", iconUri: rowIcon },
      { id: "settings-categories", label: "Categories", iconUri: rowIcon }
    ]
  }
];
