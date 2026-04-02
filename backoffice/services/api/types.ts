export type EntityBase = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type UserEntity = EntityBase & {
  name: string;
  apartment: string;
  societyId: string;
  phone: string;
  role: "Guest" | "Resident" | "Staff" | "Admin";
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  actions?: string;
};

export type ApartmentEntity = EntityBase & {
  societyId: string;
  societyName?: string;
  towerId: string;
  towerName?: string;
  unitNumber: string;
  home?: string;
  ownerDetails?: string;
  tenantDetails?: string;
  actions?: string;
};

export type SocietyEntity = EntityBase & {
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  actions?: string;
};

export type GateLogEntity = EntityBase & {
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  apartmentId: string;
  invitationId?: string;
  entryStatus: "Pending" | "Approved" | "Rejected" | "Entered" | "Exited";
  entryAt?: string;
  exitAt?: string;
  securityUserId?: string;
};

export type InvitationEntity = EntityBase & {
  hostUserId: string;
  apartmentId: string;
  guestName: string;
  guestPhone: string;
  visitDate: string;
  timeSlot: string;
  status: "Pending" | "Approved" | "Rejected" | "Used" | "Expired";
  approvedByUserId?: string;
};

export type BookingEntity = EntityBase & {
  requesterUserId: string;
  apartmentId: string;
  authorName?: string;
  spaceType: "Community Hall" | "Co-Work Space" | "Gym" | "Pool" | "Court";
  eventType: string;
  visibility: "Public" | "Private";
  message?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  paymentLabel?: string;
  paymentStatus?: "Unpaid" | "Paid" | "RefundInitiated" | "Refunded";
  paymentMethod?: "InternalPA" | "Razorpay" | "Cash" | "BankTransfer";
  coverImageUrl?: string;
  rejectedReason?: string;
  status:
    | "Draft"
    | "Pending"
    | "ToCheck"
    | "Approved"
    | "ToPay"
    | "Online"
    | "Rejected"
    | "Refund"
    | "Refunded"
    | "Confirmed"
    | "Completed"
    | "Cancelled"
    | "NoShow";
  approvedByUserId?: string;
};

export type NoticeEntity = EntityBase & {
  title: string;
  body: string;
  audience: "AllResidents" | "Tower" | "Custom";
  towerScope?: string;
  status: "Draft" | "Scheduled" | "Published" | "Archived";
  publishAt?: string;
  authorUserId: string;
};

export type MarketItemEntity = EntityBase & {
  sellerUserId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  status: "Draft" | "PendingApproval" | "Approved" | "Rejected" | "Inactive";
  approvedByUserId?: string;
};

export type ModuleKey =
  | "gate"
  | "invitations"
  | "bookings"
  | "notices"
  | "market"
  | "users"
  | "apartments"
  | "societies";

export type ModuleEntityMap = {
  gate: GateLogEntity;
  invitations: InvitationEntity;
  bookings: BookingEntity;
  notices: NoticeEntity;
  market: MarketItemEntity;
  users: UserEntity;
  apartments: ApartmentEntity;
  societies: SocietyEntity;
};
