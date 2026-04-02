import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const N = 16384;
const R = 8;
const P = 1;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plainTextPassword, salt, KEY_LENGTH, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(plainTextPassword: string, storedHash: string): Promise<boolean> {
  const [algo, nRaw, rRaw, pRaw, salt, keyHex] = storedHash.split("$");
  if (algo !== "scrypt" || !nRaw || !rRaw || !pRaw || !salt || !keyHex) {
    return false;
  }
  const n = Number.parseInt(nRaw, 10);
  const r = Number.parseInt(rRaw, 10);
  const p = Number.parseInt(pRaw, 10);
  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }
  const expected = Buffer.from(keyHex, "hex");
  const derived = scryptSync(plainTextPassword, salt, expected.length, { N: n, r, p });
  if (expected.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(expected, derived);
}
