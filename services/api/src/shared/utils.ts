import { randomUUID } from "node:crypto";

export const makeId = (): string => randomUUID();
export const nowIso = (): string => new Date().toISOString();

export const toPagination = (query: { page?: string; limit?: string }) => {
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.max(1, Math.min(100, Number.parseInt(query.limit ?? "20", 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
