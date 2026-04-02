export type Role = "Admin" | "Manager" | "Security" | "Resident";

export type UserStatus = "Invited" | "Active" | "Suspended" | "Deactivated";
export type ApartmentOccupancyStatus = "Occupied" | "Vacant" | "Maintenance" | "Inactive";
export type GateStatus = "Pending" | "Approved" | "Rejected" | "Entered" | "Exited";
export type InvitationStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Used" | "Expired" | "Cancelled";
export type BookingStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Confirmed" | "Completed" | "Cancelled" | "NoShow";
export type NoticeStatus = "Draft" | "Scheduled" | "Published" | "Expired" | "Archived";
export type MarketItemStatus = "Draft" | "PendingApproval" | "Approved" | "Rejected" | "Active" | "Inactive" | "Archived";

export type EntityBase = {
  id: string;
  societyId: string;
  createdAt: string;
  updatedAt: string;
};

export type UserEntity = EntityBase & {
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
};

export type ApartmentEntity = EntityBase & {
  tower: string;
  unitNumber: string;
  floor: number;
  occupancyStatus: ApartmentOccupancyStatus;
};

export type GateLogEntity = EntityBase & {
  invitationId?: string;
  apartmentId: string;
  residentUserId?: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  entryStatus: GateStatus;
  securityUserId?: string;
  approvedByUserId?: string;
  entryAt?: string;
  exitAt?: string;
};

export type InvitationEntity = EntityBase & {
  hostUserId: string;
  apartmentId: string;
  guestName: string;
  guestPhone: string;
  visitDate: string;
  timeSlot: string;
  status: InvitationStatus;
  approvedByUserId?: string;
};

export type BookingEntity = EntityBase & {
  requesterUserId: string;
  apartmentId: string;
  spaceType: "Community Hall" | "Co-Work Space" | "Gym" | "Pool" | "Court";
  eventType: string;
  visibility: "Public" | "Private";
  message?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  approvedByUserId?: string;
};

export type NoticeEntity = EntityBase & {
  title: string;
  body: string;
  audience: "AllResidents" | "Tower" | "Custom";
  towerScope?: string;
  status: NoticeStatus;
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
  status: MarketItemStatus;
  approvedByUserId?: string;
};

export type EntityMap = {
  users: UserEntity;
  apartments: ApartmentEntity;
  gateLogs: GateLogEntity;
  invitations: InvitationEntity;
  bookings: BookingEntity;
  notices: NoticeEntity;
  marketItems: MarketItemEntity;
};

export type EntityStore = {
  [K in keyof EntityMap]: EntityMap[K][];
};
