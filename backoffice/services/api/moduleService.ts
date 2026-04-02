import { apiRequest } from "./client";
import type { ModuleEntityMap, ModuleKey } from "./types";

const DEFAULT_SOCIETY_ID = "soc-001";

const endpointMap: Record<ModuleKey, string> = {
  gate: "/gate-logs",
  invitations: "/invitations",
  bookings: "/bookings",
  notices: "/notices",
  market: "/market-items",
  users: "/users",
  apartments: "/apartments",
  societies: "/admin/societies"
};

const actionPathMap: Partial<Record<ModuleKey, Record<string, string>>> = {
  gate: {
    Approved: "approve",
    Rejected: "reject",
    Entered: "entry",
    Exited: "exit"
  },
  invitations: {
    Approved: "approve",
    Rejected: "reject"
  },
  bookings: {
    Approved: "approve",
    Rejected: "reject",
    Cancelled: "cancel"
  },
  notices: {
    Published: "publish",
    Scheduled: "schedule"
  },
  market: {
    Approved: "approve",
    Rejected: "reject"
  }
};

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

function normalizePayload<K extends ModuleKey>(moduleKey: K, payload: Partial<ModuleEntityMap[K]>) {
  const basePayload = {
    ...payload,
    societyId: DEFAULT_SOCIETY_ID
  } as Record<string, unknown>;

  if (moduleKey === "users") {
    if (basePayload.status === "Pending") {
      basePayload.status = "Invited";
    }
    basePayload.status = basePayload.status ?? "Active";
    basePayload.role = basePayload.role ?? "Resident";
  }

  if (moduleKey === "apartments") {
    basePayload.unitNumber = basePayload.unitNumber ?? "";
  }

  if (moduleKey === "gate") {
    basePayload.entryStatus = basePayload.entryStatus ?? "Pending";
  }

  if (moduleKey === "invitations") {
    basePayload.status = basePayload.status ?? "Pending";
  }

  if (moduleKey === "bookings") {
    basePayload.status = basePayload.status ?? "Pending";
    basePayload.eventType = basePayload.eventType ?? "General";
    basePayload.visibility = basePayload.visibility ?? "Public";
  }

  if (moduleKey === "notices") {
    basePayload.status = basePayload.status ?? "Draft";
  }

  if (moduleKey === "market") {
    basePayload.status = basePayload.status ?? "PendingApproval";
    if (typeof basePayload.price === "string") {
      basePayload.price = Number(basePayload.price);
    }
    if (typeof basePayload.quantity === "string") {
      basePayload.quantity = Number(basePayload.quantity);
    }
  }

  return basePayload;
}

export async function listEntities<K extends ModuleKey>(moduleKey: K) {
  const path = endpointMap[moduleKey];
  const response = await apiRequest<PaginatedResponse<ModuleEntityMap[K]>>(path);
  return response.data;
}

export async function getEntityById<K extends ModuleKey>(moduleKey: K, id: string) {
  const path = `${endpointMap[moduleKey]}/${id}`;
  return await apiRequest<ModuleEntityMap[K]>(path);
}

export async function createEntity<K extends ModuleKey>(moduleKey: K, payload: Partial<ModuleEntityMap[K]>) {
  const path = endpointMap[moduleKey];
  const normalized = normalizePayload(moduleKey, payload);
  return await apiRequest<ModuleEntityMap[K]>(path, {
    method: "POST",
    body: normalized
  });
}

export async function updateEntity<K extends ModuleKey>(
  moduleKey: K,
  id: string,
  payload: Partial<ModuleEntityMap[K]>
) {
  const path = `${endpointMap[moduleKey]}/${id}`;
  return await apiRequest<ModuleEntityMap[K]>(path, {
    method: "PATCH",
    body: normalizePayload(moduleKey, payload)
  });
}

export async function deleteEntity<K extends ModuleKey>(moduleKey: K, id: string) {
  const path = `${endpointMap[moduleKey]}/${id}`;
  await apiRequest<void>(path, { method: "DELETE" });
}

export async function transitionEntity<K extends ModuleKey>(
  moduleKey: K,
  id: string,
  statusField: keyof ModuleEntityMap[K],
  nextStatus: string
) {
  const transitionPath = actionPathMap[moduleKey]?.[nextStatus];
  if (!transitionPath) {
    return updateEntity(moduleKey, id, { [statusField]: nextStatus } as Partial<ModuleEntityMap[K]>);
  }
  const path = `${endpointMap[moduleKey]}/${id}/${transitionPath}`;
  return await apiRequest<ModuleEntityMap[K]>(path, { method: "POST" });
}
