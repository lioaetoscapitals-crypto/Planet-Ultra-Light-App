import { randomUUID } from "node:crypto";
import type {
  AdminMapping,
  Apartment,
  Document,
  DocumentStatus,
  Notification,
  OnboardingRequest,
  Society,
  Tower,
  User,
  UserApartment,
  UserStatus,
} from "./types.js";

type SeedData = {
  societies: Society[];
  towers: Tower[];
  apartments: Apartment[];
  users: User[];
  userApartments: UserApartment[];
  documents: Document[];
  admins: AdminMapping[];
  requests: OnboardingRequest[];
  notifications: Notification[];
};

const societySeed = [
  { name: "Tanishq Society", city: "Pune", country: "India", latitude: 18.478979219715278, longitude: 73.82567710164224 },
  { name: "Life Republic", city: "Pune", country: "India", latitude: 18.6213911, longitude: 73.7129675 },
  { name: "Planet Housing Society", city: "Pune", country: "India", latitude: 18.441709, longitude: 73.883255 },
  { name: "Raj Towers", city: "Nashik", country: "India", latitude: 19.9608986, longitude: 73.771696 },
  { name: "Skyline Towers", city: "Bengaluru", country: "India", latitude: 12.971599, longitude: 77.594566 },
] as const;

const firstNames = ["Aarav", "Isha", "Neha", "Rohit", "Kiran", "Vikram", "Sara", "Anaya", "Kabir", "Lalit", "Meera"];
const lastNames = ["Sharma", "Patil", "Kulkarni", "Mehta", "Gupta", "Reddy", "Nair", "Kapoor"];

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function nowIso(offset = 0) {
  return new Date(Date.now() - offset * 60_000).toISOString();
}

function makeUserName(idx: number) {
  return `${pick(firstNames, idx)} ${pick(lastNames, idx + 2)}`;
}

function makePhone(idx: number) {
  return `98${String(10000000 + idx).slice(0, 8)}`;
}

function unitFilePrefix(unit: string) {
  return unit.replace("-", "");
}

function ownerDocs(unit: string, userId: string): Document[] {
  const prefix = unitFilePrefix(unit);
  return [
    {
      id: randomUUID(),
      userId,
      type: "sale_deed",
      fileUrl: `https://dummy-docs.com/sale_deed_${prefix}.pdf`,
      status: "approved",
      uploadedAt: nowIso(30),
    },
    {
      id: randomUUID(),
      userId,
      type: "index_2",
      fileUrl: `https://dummy-docs.com/index_2_${prefix}.pdf`,
      status: "approved",
      uploadedAt: nowIso(28),
    },
    {
      id: randomUUID(),
      userId,
      type: "govt_id",
      fileUrl: `https://dummy-docs.com/govt_id_${userId}.png`,
      status: "approved",
      uploadedAt: nowIso(27),
    },
  ];
}

function tenantDocs(unit: string, userId: string, status: "pending" | "approved" | "rejected"): Document[] {
  const prefix = unitFilePrefix(unit);
  return [
    {
      id: randomUUID(),
      userId,
      type: "rent_agreement",
      fileUrl: `https://dummy-docs.com/rent_agreement_${prefix}.pdf`,
      status,
      uploadedAt: nowIso(25),
    },
    {
      id: randomUUID(),
      userId,
      type: "police_verification",
      fileUrl: `https://dummy-docs.com/police_verification_${prefix}.pdf`,
      status,
      uploadedAt: nowIso(24),
    },
    {
      id: randomUUID(),
      userId,
      type: "govt_id",
      fileUrl: `https://dummy-docs.com/govt_id_${userId}.png`,
      status,
      uploadedAt: nowIso(23),
    },
    {
      id: randomUUID(),
      userId,
      type: "society_charge_receipt",
      fileUrl: `https://dummy-docs.com/society_charge_receipt_${prefix}.pdf`,
      status,
      uploadedAt: nowIso(22),
    },
  ];
}

function familyDocs(userId: string, ownerId: string, status: "pending" | "approved" | "rejected"): Document[] {
  return [
    {
      id: randomUUID(),
      userId,
      type: "reference_owner_id",
      fileUrl: `https://dummy-docs.com/reference_owner_${ownerId}.pdf`,
      status,
      uploadedAt: nowIso(20),
    },
    {
      id: randomUUID(),
      userId,
      type: "govt_id",
      fileUrl: `https://dummy-docs.com/govt_id_${userId}.png`,
      status,
      uploadedAt: nowIso(19),
    },
  ];
}

export function buildSeedData(): SeedData {
  const societies: Society[] = [];
  const towers: Tower[] = [];
  const apartments: Apartment[] = [];
  const users: User[] = [];
  const userApartments: UserApartment[] = [];
  const documents: Document[] = [];
  const admins: AdminMapping[] = [];
  const requests: OnboardingRequest[] = [];
  const notifications: Notification[] = [];

  let personIdx = 0;

  for (const source of societySeed) {
    const societyId = randomUUID();
    const createdAt = nowIso(300);
    societies.push({
      id: societyId,
      name: source.name,
      city: source.city,
      country: source.country,
      latitude: source.latitude,
      longitude: source.longitude,
      createdAt,
    });

    const towerMap: Record<"A" | "B" | "C", string> = { A: "", B: "", C: "" };
    (["A", "B", "C"] as const).forEach((towerName) => {
      const towerId = randomUUID();
      towerMap[towerName] = towerId;
      towers.push({
        id: towerId,
        societyId,
        name: towerName,
        createdAt,
      });

      for (let unit = 101; unit <= 140; unit += 1) {
        const unitNumber = `${towerName}-${unit}`;
        apartments.push({
          id: randomUUID(),
          societyId,
          towerId,
          unitNumber,
          createdAt,
        });
      }
    });

    const adminUserId = randomUUID();
    users.push({
      id: adminUserId,
      name: `${source.name.split(" ")[0]} Admin`,
      phone: makePhone(personIdx + 999),
      role: "admin",
      societyId,
      status: "approved",
      createdAt: nowIso(200),
    });

    admins.push({
      id: randomUUID(),
      userId: adminUserId,
      societyId,
      createdAt: nowIso(200),
    });

    const gatekeeperUserId = randomUUID();
    users.push({
      id: gatekeeperUserId,
      name: `${source.name.split(" ")[0]} Gatekeeper`,
      phone: makePhone(personIdx + 1999),
      role: "gatekeeper",
      societyId,
      status: "approved",
      createdAt: nowIso(180),
    });

    const societyApartments = apartments.filter((a) => a.societyId === societyId);
    const selectedUnits = societyApartments.slice(0, 12);
    for (let i = 0; i < selectedUnits.length; i += 1) {
      const apartment = selectedUnits[i];
      const residentRole: "owner" | "tenant" | "family" = i % 3 === 0 ? "owner" : i % 3 === 1 ? "tenant" : "family";
      const userId = randomUUID();
      const userStatus: UserStatus = i % 5 === 0 ? "submitted" : i % 7 === 0 ? "rejected" : i % 2 === 0 ? "under_review" : "approved";
      users.push({
        id: userId,
        name: makeUserName(personIdx),
        phone: makePhone(personIdx),
        role: residentRole,
        societyId,
        status: userStatus,
        createdAt: nowIso(120 - i),
        rejectionReason: userStatus === "rejected" ? "Document mismatch: police verification unclear." : undefined,
      });
      personIdx += 1;

      userApartments.push({
        id: randomUUID(),
        userId,
        apartmentId: apartment.id,
        role: residentRole,
        createdAt: nowIso(118 - i),
      });

      const reqId = randomUUID();
      requests.push({
        id: reqId,
        userId,
        societyId,
        apartmentId: apartment.id,
        role: residentRole,
        status: userStatus,
        createdAt: nowIso(117 - i),
        updatedAt: nowIso(90 - i),
        rejectionReason: userStatus === "rejected" ? "Invalid uploaded govt_id image." : undefined,
      });

      if (residentRole === "owner") {
        const status: DocumentStatus = userStatus === "rejected" ? "rejected" : "approved";
        documents.push(...ownerDocs(apartment.unitNumber, userId).map((doc) => ({ ...doc, status })));
      } else if (residentRole === "tenant") {
        const docStatus: DocumentStatus = userStatus === "approved" ? "approved" : userStatus === "rejected" ? "rejected" : "pending";
        documents.push(...tenantDocs(apartment.unitNumber, userId, docStatus));
      } else {
        const sameApartmentOwner = userApartments.find((link) => link.apartmentId === apartment.id && link.role === "owner");
        const ownerId = sameApartmentOwner?.userId ?? adminUserId;
        const docStatus: DocumentStatus = userStatus === "approved" ? "approved" : userStatus === "rejected" ? "rejected" : "pending";
        documents.push(...familyDocs(userId, ownerId, docStatus));
      }

      notifications.push({
        id: randomUUID(),
        userId: adminUserId,
        societyId,
        eventType: "submission",
        message: `New ${residentRole} onboarding submitted for ${apartment.unitNumber}.`,
        createdAt: nowIso(80 - i),
      });
    }
  }

  return {
    societies,
    towers,
    apartments,
    users,
    userApartments,
    documents,
    admins,
    requests,
    notifications,
  };
}
