export type Society = {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
};

export type Tower = {
  id: string;
  societyId: string;
  name: "A" | "B" | "C";
  createdAt: string;
};

export type Apartment = {
  id: string;
  societyId: string;
  towerId: string;
  unitNumber: string;
  createdAt: string;
};

export type UserRole = "owner" | "family" | "tenant" | "admin" | "gatekeeper";
export type UserStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

export type User = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  societyId: string;
  status: UserStatus;
  createdAt: string;
  rejectionReason?: string;
};

export type UserApartment = {
  id: string;
  userId: string;
  apartmentId: string;
  role: "owner" | "family" | "tenant";
  createdAt: string;
};

export type DocumentType =
  | "sale_deed"
  | "index_2"
  | "govt_id"
  | "rent_agreement"
  | "police_verification"
  | "society_charge_receipt"
  | "reference_owner_id";

export type DocumentStatus = "pending" | "approved" | "rejected";

export type Document = {
  id: string;
  userId: string;
  type: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: string;
};

export type AdminMapping = {
  id: string;
  userId: string;
  societyId: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  societyId: string;
  eventType: "submission" | "approval" | "rejection";
  message: string;
  createdAt: string;
};

export type OnboardingRequest = {
  id: string;
  userId: string;
  societyId: string;
  apartmentId: string;
  role: "owner" | "family" | "tenant";
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
};
