import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Role } from "../../shared/types.js";
import { hashPassword } from "./password.js";

export type PaAuthUser = {
  userId: string;
  email: string;
  role: Role;
  societyId: string;
  passwordHash: string;
  status: "active" | "disabled";
  source: "bo_sync" | "pa_seed";
  createdAt: string;
  updatedAt: string;
};

const userStorePath = resolve(process.cwd(), ".data", "pa-auth-users.json");

function normalizeUserId(userId: string): string {
  return userId.includes("@") ? userId.trim().toLowerCase() : userId.trim();
}

const bootstrapUsers: Array<{
  userId: string;
  email: string;
  role: Role;
  societyId: string;
  plainPassword: string;
  source: "bo_sync" | "pa_seed";
}> = [
  {
    userId: "usr-admin-001",
    email: "admin@planet.app",
    role: "Admin",
    societyId: "soc-001",
    plainPassword: "Planet@123",
    source: "bo_sync",
  },
  {
    userId: "pa-resident-tanishq-001",
    email: "resident.tanishq@planet.app",
    role: "Resident",
    societyId: "soc-tanishq",
    plainPassword: "Tanishq@123",
    source: "pa_seed",
  },
  {
    userId: "pa-resident-greenvalley-001",
    email: "resident.greenvalley@planet.app",
    role: "Resident",
    societyId: "soc-green-valley",
    plainPassword: "Green@123",
    source: "pa_seed",
  },
];

async function ensureStoreFile() {
  await mkdir(dirname(userStorePath), { recursive: true });
  try {
    await readFile(userStorePath, "utf8");
  } catch {
    const now = new Date().toISOString();
    const seedUsers = await Promise.all([
      buildSeedUser({
        userId: "pa-resident-tanishq-001",
        email: "resident.tanishq@planet.app",
        role: "Resident",
        societyId: "soc-tanishq",
        plainPassword: "Tanishq@123",
      }, now),
      buildSeedUser({
        userId: "pa-resident-greenvalley-001",
        email: "resident.greenvalley@planet.app",
        role: "Resident",
        societyId: "soc-green-valley",
        plainPassword: "Green@123",
      }, now),
    ]);
    await writeFile(userStorePath, JSON.stringify(seedUsers, null, 2), "utf8");
  }
}

async function buildSeedUser(
  seed: {
    userId: string;
    email: string;
    role: Role;
    societyId: string;
    plainPassword: string;
  },
  now: string,
): Promise<PaAuthUser> {
  const passwordHash = await hashPassword(seed.plainPassword);
  return {
    userId: seed.userId,
    email: seed.email,
    role: seed.role,
    societyId: seed.societyId,
    passwordHash,
    status: "active",
    source: "pa_seed",
    createdAt: now,
    updatedAt: now,
  };
}

async function ensureBootstrapUsers(records: PaAuthUser[]) {
  let changed = false;
  const next = [...records];
  const now = new Date().toISOString();

  for (const bootstrap of bootstrapUsers) {
    const normalizedUserId = normalizeUserId(bootstrap.userId);
    const existing = next.find((item) => normalizeUserId(item.userId) === normalizedUserId);
    if (existing) {
      continue;
    }
    const passwordHash = await hashPassword(bootstrap.plainPassword);
    next.push({
      userId: normalizedUserId,
      email: bootstrap.email.trim().toLowerCase(),
      role: bootstrap.role,
      societyId: bootstrap.societyId,
      passwordHash,
      status: "active",
      source: bootstrap.source,
      createdAt: now,
      updatedAt: now,
    });
    changed = true;
  }

  return { changed, records: next };
}

async function readStore(): Promise<PaAuthUser[]> {
  await ensureStoreFile();
  const raw = await readFile(userStorePath, "utf8");
  const parsed = JSON.parse(raw) as PaAuthUser[];
  const bootstrapResult = await ensureBootstrapUsers(parsed);
  if (bootstrapResult.changed) {
    await writeStore(bootstrapResult.records);
  }
  return bootstrapResult.records;
}

async function writeStore(records: PaAuthUser[]) {
  await writeFile(userStorePath, JSON.stringify(records, null, 2), "utf8");
}

export const authUserStore = {
  async list() {
    return await readStore();
  },

  async findByUserId(userId: string) {
    const records = await readStore();
    const normalized = normalizeUserId(userId);
    return records.find((item) => normalizeUserId(item.userId) === normalized) ?? null;
  },

  async findByEmail(email: string) {
    const records = await readStore();
    return records.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  async upsertMany(users: Array<Omit<PaAuthUser, "createdAt" | "updatedAt">>) {
    const records = await readStore();
    const now = new Date().toISOString();
    for (const user of users) {
      const normalizedUserId = normalizeUserId(user.userId);
      const normalizedEmail = user.email.trim().toLowerCase();
      const existingIndex = records.findIndex((item) => normalizeUserId(item.userId) === normalizedUserId);
      if (existingIndex >= 0) {
        records[existingIndex] = {
          ...records[existingIndex],
          ...user,
          userId: normalizedUserId,
          email: normalizedEmail,
          updatedAt: now,
        };
      } else {
        records.push({
          ...user,
          userId: normalizedUserId,
          email: normalizedEmail,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    await writeStore(records);
  },
};
