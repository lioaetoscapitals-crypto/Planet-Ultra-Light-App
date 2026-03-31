import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type TokenRecord = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  replacedByToken: string | null;
};

const tokenStorePath = resolve(process.cwd(), ".data", "refresh-tokens.json");

async function ensureStoreFile() {
  await mkdir(dirname(tokenStorePath), { recursive: true });
  try {
    await readFile(tokenStorePath, "utf8");
  } catch {
    await writeFile(tokenStorePath, "[]", "utf8");
  }
}

async function readStore(): Promise<TokenRecord[]> {
  await ensureStoreFile();
  const raw = await readFile(tokenStorePath, "utf8");
  return JSON.parse(raw) as TokenRecord[];
}

async function writeStore(records: TokenRecord[]) {
  await writeFile(tokenStorePath, JSON.stringify(records, null, 2), "utf8");
}

function isExpired(record: TokenRecord) {
  return Date.now() >= new Date(record.expiresAt).getTime();
}

export const refreshTokenStore = {
  async save(token: string, userId: string, ttlSeconds: number) {
    const records = await readStore();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    records.push({
      token,
      userId,
      createdAt: now,
      expiresAt,
      revokedAt: null,
      replacedByToken: null,
    });
    await writeStore(records);
  },

  async findActive(token: string) {
    const records = await readStore();
    const record = records.find((item) => item.token === token);
    if (!record) return null;
    if (record.revokedAt) return null;
    if (isExpired(record)) return null;
    return record;
  },

  async rotate(oldToken: string, newToken: string, userId: string, ttlSeconds: number) {
    const records = await readStore();
    const now = new Date().toISOString();
    const oldRecord = records.find((item) => item.token === oldToken);
    if (oldRecord) {
      oldRecord.revokedAt = now;
      oldRecord.replacedByToken = newToken;
    }
    records.push({
      token: newToken,
      userId,
      createdAt: now,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      revokedAt: null,
      replacedByToken: null,
    });
    await writeStore(records);
  },

  async revoke(token: string) {
    const records = await readStore();
    const record = records.find((item) => item.token === token);
    if (!record || record.revokedAt) return false;
    record.revokedAt = new Date().toISOString();
    await writeStore(records);
    return true;
  },

  async revokeAllForUser(userId: string) {
    const records = await readStore();
    const now = new Date().toISOString();
    let changed = false;
    for (const record of records) {
      if (record.userId === userId && !record.revokedAt) {
        record.revokedAt = now;
        changed = true;
      }
    }
    if (changed) {
      await writeStore(records);
    }
    return changed;
  },
};
