import type { ModuleKey } from "../../services/api/types";
import {
  apartmentsService,
  bookingsService,
  gateService,
  invitationsService,
  marketService,
  noticesService,
  societiesService,
  usersService
} from "../../services/api";

export type ModuleService = {
  list: () => Promise<Record<string, unknown>[]>;
  getById: (id: string) => Promise<Record<string, unknown> | null>;
  create: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (id: string, payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
  remove?: (id: string) => Promise<void>;
  approve?: (id: string) => Promise<Record<string, unknown>>;
  reject?: (id: string) => Promise<Record<string, unknown>>;
};

export type ModuleField = {
  key: string;
  label: string;
  placeholder?: string;
};

export type ModuleConfig = {
  key: ModuleKey;
  label: string;
  singularLabel: string;
  subtitle?: string;
  createLabel?: string;
  secondaryLabel?: string;
  tertiaryLabel?: string;
  roleFilter?: boolean;
  service: ModuleService;
  columns: { key: string; header: string }[];
  detailFields: string[];
  formFields: ModuleField[];
  statusField?: string;
  workflowActions?: Array<"approve" | "reject">;
};

export const moduleRegistry: Record<ModuleKey, ModuleConfig> = {
  gate: {
    key: "gate",
    label: "Visitor Entries",
    singularLabel: "Visitor Entry",
    service: gateService,
    columns: [
      { key: "id", header: "ID" },
      { key: "visitorName", header: "Visitor" },
      { key: "visitorPhone", header: "Phone" },
      { key: "overallStatus", header: "Status" },
      { key: "apartment_count", header: "Apartments" }
    ],
    detailFields: [
      "visitorName",
      "visitorPhone",
      "visitorType",
      "overallStatus",
      "createdAt",
      "apartmentCount",
      "apartmentList",
      "gateLog",
      "timeline"
    ],
    formFields: [
      { key: "visitorName", label: "Visitor Name" },
      { key: "visitorPhone", label: "Visitor Phone" },
      { key: "visitorType", label: "Visitor Type (delivery/cab/service/guest)" },
      { key: "apartment_ids", label: "Apartment IDs (comma separated)" }
    ],
    statusField: "overallStatus",
    workflowActions: ["approve", "reject"]
  },
  invitations: {
    key: "invitations",
    label: "Invitations",
    singularLabel: "Invitation",
    service: invitationsService,
    columns: [
      { key: "id", header: "ID" },
      { key: "guestName", header: "Guest" },
      { key: "visitDate", header: "Visit Date" },
      { key: "status", header: "Status" }
    ],
    detailFields: ["guestName", "guestPhone", "hostUserId", "apartmentId", "visitDate", "timeSlot", "status"],
    formFields: [
      { key: "hostUserId", label: "Host User ID" },
      { key: "apartmentId", label: "Apartment ID" },
      { key: "guestName", label: "Guest Name" },
      { key: "guestPhone", label: "Guest Phone" },
      { key: "visitDate", label: "Visit Date (YYYY-MM-DD)" },
      { key: "timeSlot", label: "Time Slot" }
    ],
    statusField: "status",
    workflowActions: ["approve", "reject"]
  },
  bookings: {
    key: "bookings",
    label: "Space Bookings",
    singularLabel: "Booking",
    service: bookingsService,
    columns: [
      { key: "id", header: "ID" },
      { key: "spaceType", header: "Space" },
      { key: "bookingDate", header: "Date" },
      { key: "status", header: "Status" }
    ],
    detailFields: ["requesterUserId", "apartmentId", "spaceType", "bookingDate", "startTime", "endTime", "status"],
    formFields: [
      { key: "requesterUserId", label: "Requester User ID" },
      { key: "apartmentId", label: "Apartment ID" },
      { key: "spaceType", label: "Space Type" },
      { key: "bookingDate", label: "Booking Date (YYYY-MM-DD)" },
      { key: "startTime", label: "Start Time" },
      { key: "endTime", label: "End Time" }
    ],
    statusField: "status",
    workflowActions: ["approve", "reject"]
  },
  notices: {
    key: "notices",
    label: "Notices",
    singularLabel: "Notice",
    service: noticesService,
    columns: [
      { key: "id", header: "ID" },
      { key: "title", header: "Title" },
      { key: "audience", header: "Audience" },
      { key: "status", header: "Status" }
    ],
    detailFields: ["title", "body", "audience", "towerScope", "status", "publishAt"],
    formFields: [
      { key: "title", label: "Title" },
      { key: "body", label: "Body" },
      { key: "audience", label: "Audience (AllResidents/Tower/Custom)" },
      { key: "towerScope", label: "Tower Scope" },
      { key: "publishAt", label: "Publish At (ISO datetime)" },
      { key: "authorUserId", label: "Author User ID" }
    ],
    statusField: "status"
  },
  market: {
    key: "market",
    label: "Market Listings",
    singularLabel: "Market Item",
    service: marketService,
    columns: [
      { key: "id", header: "ID" },
      { key: "title", header: "Title" },
      { key: "category", header: "Category" },
      { key: "status", header: "Status" }
    ],
    detailFields: ["title", "description", "sellerUserId", "category", "price", "quantity", "status"],
    formFields: [
      { key: "sellerUserId", label: "Seller User ID" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price" },
      { key: "quantity", label: "Quantity" }
    ],
    statusField: "status",
    workflowActions: ["approve", "reject"]
  },
  users: {
    key: "users",
    label: "Users",
    singularLabel: "User",
    subtitle: "Tanishq Society / Operations / Users",
    createLabel: "Create User",
    tertiaryLabel: "Export",
    roleFilter: true,
    service: usersService,
    columns: [
      { key: "name", header: "Name" },
      { key: "apartment", header: "Apartment" },
      { key: "role", header: "Role" },
      { key: "actions", header: "Actions" }
    ],
    detailFields: ["name", "apartment", "role", "status", "phone", "societyId"],
    formFields: [
      { key: "name", label: "Full Name" },
      { key: "apartment", label: "Apartment Unit Number" },
      { key: "societyId", label: "Society ID" },
      { key: "phone", label: "Phone" },
      { key: "role", label: "Role (Guest/Resident/Staff/Admin)" },
      { key: "status", label: "Status (draft/submitted/under_review/approved/rejected)" }
    ],
    statusField: "status"
  },
  apartments: {
    key: "apartments",
    label: "Apartments",
    singularLabel: "Apartment",
    subtitle: "Tanishq Society / Operations / Apartments",
    createLabel: "Create Apartment",
    secondaryLabel: "Upload Apartments Without Resident",
    tertiaryLabel: "Export",
    service: apartmentsService,
    columns: [
      { key: "home", header: "Home" },
      { key: "towerName", header: "Tower Name" },
      { key: "ownerDetails", header: "Owner Details" },
      { key: "tenantDetails", header: "Tenant Details" },
      { key: "actions", header: "Actions" }
    ],
    detailFields: ["home", "towerName", "ownerDetails", "tenantDetails", "societyName", "createdAt"],
    formFields: [
      { key: "societyId", label: "Society ID" },
      { key: "towerId", label: "Tower ID" },
      { key: "unitNumber", label: "Home (A-101 format)" }
    ],
  },
  societies: {
    key: "societies",
    label: "Societies",
    singularLabel: "Society",
    subtitle: "Tanishq Society / Settings / Societies",
    createLabel: "Create Society",
    service: societiesService,
    columns: [
      { key: "name", header: "Name" },
      { key: "city", header: "City" },
      { key: "country", header: "Country" },
      { key: "latitude", header: "Latitude" },
      { key: "longitude", header: "Longitude" },
      { key: "actions", header: "Actions" }
    ],
    detailFields: ["name", "city", "country", "latitude", "longitude", "createdAt"],
    formFields: [
      { key: "name", label: "Society Name" },
      { key: "city", label: "City" },
      { key: "country", label: "Country" },
      { key: "latitude", label: "Latitude" },
      { key: "longitude", label: "Longitude" }
    ]
  },
};
