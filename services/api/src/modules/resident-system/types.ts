export type VisitorType = "delivery" | "cab" | "service" | "guest";
export type EntryApartmentStatus = "pending" | "approved" | "rejected" | "expired";
export type OverallStatus =
  | "pending"
  | "partial_approved"
  | "approved"
  | "rejected"
  | "completed"
  | "expired";

export type VisitorEntry = {
  id: string;
  createdBy: string;
  visitorName: string;
  visitorPhone: string;
  visitorType: VisitorType;
  vehicleNumber?: string;
  vehiclePhotoUrl?: string;
  visitorPhotoUrl?: string;
  visitorCount: number;
  overallStatus: OverallStatus;
  createdAt: string;
  expiresAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
};

export type EntryApartment = {
  id: string;
  entryId: string;
  apartmentId: string;
  status: EntryApartmentStatus;
  respondedBy?: string;
  respondedAt?: string;
};

export type GateLog = {
  id: string;
  entryId: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: "checked_in" | "checked_out";
};

export type Notification = {
  id: string;
  userId: string;
  entryId: string;
  type: "approval_request" | "update";
  status: "sent" | "read" | "actioned";
  createdAt: string;
};

export type EntryEvent = {
  id: string;
  entryId: string;
  eventType: "ENTRY_CREATED" | "ENTRY_UPDATED" | "ENTRY_COMPLETED" | "ENTRY_EXPIRED";
  payload: Record<string, unknown>;
  createdAt: string;
};
