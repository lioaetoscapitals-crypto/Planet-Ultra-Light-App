import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildSeedData } from "../src/modules/onboarding/seed.js";

const data = buildSeedData();

const output = {
  summary: {
    societies: data.societies.length,
    towers: data.towers.length,
    apartments: data.apartments.length,
    users: data.users.length,
    userApartments: data.userApartments.length,
    documents: data.documents.length,
    onboardingRequests: data.requests.length,
    admins: data.admins.length,
    notifications: data.notifications.length,
  },
  sample: {
    societies: data.societies.slice(0, 3),
    apartments: data.apartments.slice(0, 6),
    users: data.users.filter((u) => u.role === "owner" || u.role === "tenant" || u.role === "family").slice(0, 8),
    requests: data.requests.slice(0, 8),
    documents: data.documents.slice(0, 10),
  },
};

const target = resolve(process.cwd(), "scripts", "onboarding-seed-output.json");
writeFileSync(target, JSON.stringify(output, null, 2), "utf8");
// eslint-disable-next-line no-console
console.log(`Onboarding seed output written to ${target}`);
