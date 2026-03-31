import { buildSeedData } from "./seed.js";
import type { Apartment, Document, Notification, OnboardingRequest, Society, Tower, User, UserApartment } from "./types.js";

const seed = buildSeedData();

export const onboardingStore: {
  societies: Society[];
  towers: Tower[];
  apartments: Apartment[];
  users: User[];
  userApartments: UserApartment[];
  documents: Document[];
  requests: OnboardingRequest[];
  admins: Array<{ id: string; userId: string; societyId: string; createdAt: string }>;
  notifications: Notification[];
} = {
  societies: seed.societies,
  towers: seed.towers,
  apartments: seed.apartments,
  users: seed.users,
  userApartments: seed.userApartments,
  documents: seed.documents,
  requests: seed.requests,
  admins: seed.admins,
  notifications: seed.notifications,
};
