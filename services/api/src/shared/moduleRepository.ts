import type { EntityBase, EntityMap } from "./types.js";
import { makeId, nowIso } from "./utils.js";

export class ModuleRepository<K extends keyof EntityMap> {
  constructor(private readonly rows: EntityMap[K][]) {}

  list(params: { page: number; limit: number; search?: string; statusField?: string; statusValue?: string }) {
    const { page, limit, search, statusField, statusValue } = params;
    const searchText = search?.toLowerCase();
    const filtered = this.rows.filter((row) => {
      const textMatch =
        !searchText || Object.values(row).some((value) => String(value).toLowerCase().includes(searchText));
      const statusMatch = !statusField || !statusValue || String((row as Record<string, unknown>)[statusField]) === statusValue;
      return textMatch && statusMatch;
    });
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit),
      page,
      limit,
      total: filtered.length,
    };
  }

  getById(id: string): EntityMap[K] | undefined {
    return this.rows.find((row) => row.id === id);
  }

  create(data: Omit<EntityMap[K], keyof EntityBase>): EntityMap[K] {
    const now = nowIso();
    const entity = { ...data, id: makeId(), createdAt: now, updatedAt: now } as EntityMap[K];
    this.rows.unshift(entity);
    return entity;
  }

  update(id: string, patch: Partial<EntityMap[K]>): EntityMap[K] | undefined {
    const idx = this.rows.findIndex((row) => row.id === id);
    if (idx < 0) return undefined;
    const next = { ...this.rows[idx], ...patch, updatedAt: nowIso() };
    this.rows[idx] = next;
    return next;
  }
}
