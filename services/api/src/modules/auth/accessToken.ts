import { createHmac, timingSafeEqual } from "node:crypto";
import type { Role } from "../../shared/types.js";

type AccessTokenPayload = {
  sub: string;
  role: Role;
  societyId: string;
  exp: number;
};

const ACCESS_TOKEN_SECRET = process.env.PA_ACCESS_TOKEN_SECRET ?? "planet-ultra-dev-secret";

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", ACCESS_TOKEN_SECRET).update(payloadB64).digest("base64url");
}

export function issueAccessToken(payload: AccessTokenPayload): string {
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    return null;
  }
  const expectedSignature = sign(payloadB64);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }
  try {
    const parsed = JSON.parse(base64UrlDecode(payloadB64)) as AccessTokenPayload;
    if (!parsed.sub || !parsed.role || !parsed.societyId || !parsed.exp) {
      return null;
    }
    if (Date.now() / 1000 >= parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
