import type {
  ApartmentEntity,
  BookingEntity,
  EntityStore,
  GateLogEntity,
  InvitationEntity,
  MarketItemEntity,
  NoticeEntity,
  UserEntity,
} from "../types.js";

const now = new Date().toISOString();
const societyId = "soc-001";

export const db: EntityStore = {
  users: [
    {
      id: "usr-admin-001",
      societyId,
      fullName: "Planet Admin",
      email: "admin@planet.app",
      phone: "9999999999",
      role: "Admin",
      status: "Active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr-sec-001",
      societyId,
      fullName: "Security Desk",
      email: "security@planet.app",
      phone: "9888888888",
      role: "Security",
      status: "Active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr-res-001",
      societyId,
      fullName: "Andrea Resident",
      email: "andrea@planet.app",
      phone: "9777777777",
      role: "Resident",
      status: "Active",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr-res-002",
      societyId,
      fullName: "Karan Resident",
      email: "karan@planet.app",
      phone: "9666666666",
      role: "Resident",
      status: "Active",
      createdAt: now,
      updatedAt: now,
    },
  ] as UserEntity[],
  apartments: [
    {
      id: "apt-a-102",
      societyId,
      tower: "A",
      unitNumber: "102",
      floor: 1,
      occupancyStatus: "Occupied",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "apt-b-203",
      societyId,
      tower: "B",
      unitNumber: "203",
      floor: 2,
      occupancyStatus: "Occupied",
      createdAt: now,
      updatedAt: now,
    },
  ] as ApartmentEntity[],
  gateLogs: [] as GateLogEntity[],
  invitations: [] as InvitationEntity[],
  bookings: [] as BookingEntity[],
  notices: [] as NoticeEntity[],
  marketItems: [] as MarketItemEntity[],
};

export const apartmentUserMap: Array<{
  id: string;
  apartmentId: string;
  userId: string;
  relationshipType: "Owner" | "Tenant" | "FamilyMember" | "Staff";
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "uam-001",
    apartmentId: "apt-a-102",
    userId: "usr-res-001",
    relationshipType: "Owner",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "uam-002",
    apartmentId: "apt-b-203",
    userId: "usr-res-002",
    relationshipType: "Tenant",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  },
];
