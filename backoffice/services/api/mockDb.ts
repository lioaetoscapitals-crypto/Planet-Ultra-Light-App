import type {
  ApartmentEntity,
  BookingEntity,
  GateLogEntity,
  InvitationEntity,
  MarketItemEntity,
  ModuleEntityMap,
  ModuleKey,
  NoticeEntity,
  UserEntity
} from "./types";

const now = new Date().toISOString();

const users: UserEntity[] = [
  { id: "USR-1", fullName: "Andrea Gomes", email: "andrea@planet.app", phone: "9876543210", role: "Resident", status: "Active", apartmentId: "APT-1", createdAt: now, updatedAt: now },
  { id: "USR-2", fullName: "Rahul Sharma", email: "rahul@planet.app", phone: "9988776655", role: "Manager", status: "Active", createdAt: now, updatedAt: now },
  { id: "USR-3", fullName: "Neha Kulkarni", email: "neha@planet.app", phone: "9123456789", role: "Security", status: "Active", createdAt: now, updatedAt: now }
];

const apartments: ApartmentEntity[] = [
  { id: "APT-1", tower: "A", unitNumber: "102", floor: 1, occupancyStatus: "Occupied", ownerUserId: "USR-1", createdAt: now, updatedAt: now },
  { id: "APT-2", tower: "B", unitNumber: "504", floor: 5, occupancyStatus: "Vacant", createdAt: now, updatedAt: now }
];

const invitations: InvitationEntity[] = [
  { id: "INV-1", hostUserId: "USR-1", apartmentId: "APT-1", guestName: "Aditya Joshi", guestPhone: "9990001111", visitDate: "2026-03-31", timeSlot: "18:00-20:00", status: "Pending", createdAt: now, updatedAt: now }
];

const gate: GateLogEntity[] = [
  { id: "GATE-1", visitorName: "Aditya Joshi", visitorPhone: "9990001111", purpose: "Guest Visit", apartmentId: "APT-1", invitationId: "INV-1", entryStatus: "Pending", securityUserId: "USR-3", createdAt: now, updatedAt: now }
];

const bookings: BookingEntity[] = [
  { id: "BOOK-1", requesterUserId: "USR-1", apartmentId: "APT-1", spaceType: "Co-Work Space", bookingDate: "2026-04-02", startTime: "10:00", endTime: "12:00", status: "Pending", createdAt: now, updatedAt: now }
];

const notices: NoticeEntity[] = [
  { id: "NOT-1", title: "Water Maintenance", body: "Water will be paused from 2 PM to 4 PM.", audience: "AllResidents", status: "Published", authorUserId: "USR-2", createdAt: now, updatedAt: now }
];

const market: MarketItemEntity[] = [
  { id: "MKT-1", sellerUserId: "USR-1", title: "Dining Table", description: "Solid wood dining table, 6 seater", category: "Furniture", price: 18500, quantity: 1, status: "PendingApproval", createdAt: now, updatedAt: now }
];

export const mockDb: { [K in ModuleKey]: ModuleEntityMap[K][] } = {
  gate,
  invitations,
  bookings,
  notices,
  market,
  users,
  apartments
};
