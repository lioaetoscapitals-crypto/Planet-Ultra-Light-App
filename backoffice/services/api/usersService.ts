import { apiRequest } from "./client";
import type { UserEntity } from "./types";
import { getSelectedSocietyId } from "../societySelection";

type UsersResponse = {
  items: Array<{
    id: string;
    name: string;
    apartment: string;
    role: "Guest" | "Resident" | "Staff" | "Admin";
    status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
    actions?: string;
    societyId: string;
    phone: string;
  }>;
};

function mapUser(item: UsersResponse["items"][number]): UserEntity {
  return {
    id: item.id,
    name: item.name,
    apartment: item.apartment,
    role: item.role,
    status: item.status,
    actions: item.actions ?? "View | Edit | Settings",
    societyId: item.societyId,
    phone: item.phone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapUiRoleToDomain(role: string): "owner" | "tenant" | "family" | "admin" | "gatekeeper" {
  const normalized = role.toLowerCase();
  if (normalized === "staff") return "gatekeeper";
  if (normalized === "admin") return "admin";
  if (normalized === "guest") return "family";
  return "tenant";
}

export const usersService = {
  async list() {
    const selectedSocietyId = getSelectedSocietyId();
    const path = selectedSocietyId ? `/admin/users?society_id=${encodeURIComponent(selectedSocietyId)}` : "/admin/users";
    const response = await apiRequest<UsersResponse>(path);
    return response.items.map(mapUser);
  },
  async getById(id: string) {
    const response = await apiRequest<{
      id: string;
      name: string;
      apartment: string;
      role: "owner" | "tenant" | "family" | "admin" | "gatekeeper";
      status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
      societyId: string;
      phone: string;
      createdAt: string;
      requiredDocuments?: Array<{
        type: string;
        uploaded: boolean;
        status: string;
        fileUrl?: string;
      }>;
      documents?: Array<{
        id: string;
        type: string;
        status: string;
        fileUrl: string;
        uploadedAt: string;
      }>;
    }>(`/admin/users/${id}`);

    const mappedRole: UserEntity["role"] =
      response.role === "gatekeeper"
        ? "Staff"
        : response.role === "owner" || response.role === "tenant" || response.role === "family"
          ? "Resident"
          : "Admin";

    return {
      id: response.id,
      name: response.name,
      apartment: response.apartment,
      role: mappedRole,
      status: response.status,
      societyId: response.societyId,
      phone: response.phone,
      actions: "View | Edit | Settings",
      createdAt: response.createdAt,
      updatedAt: response.createdAt,
      requiredDocuments: response.requiredDocuments ?? [],
      documents: response.documents ?? [],
    };
  },
  async create(payload: Record<string, unknown>) {
    const created = await apiRequest<{
      id: string;
      name: string;
      phone: string;
      role: "owner" | "tenant" | "family" | "admin" | "gatekeeper";
      societyId: string;
      status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
      createdAt: string;
    }>("/admin/users", {
      method: "POST",
      body: {
        society_id: String(payload.societyId ?? ""),
        apartment_id: payload.apartment ? String(payload.apartment) : undefined,
        name: String(payload.name ?? ""),
        phone: String(payload.phone ?? ""),
        role: mapUiRoleToDomain(String(payload.role ?? "Resident")),
        status: String(payload.status ?? "submitted").toLowerCase(),
      },
    });

    return {
      id: created.id,
      name: created.name,
      apartment: String(payload.apartment ?? "-"),
      role:
        created.role === "gatekeeper"
          ? "Staff"
          : created.role === "owner" || created.role === "tenant" || created.role === "family"
            ? "Resident"
            : "Admin",
      status: created.status,
      societyId: created.societyId,
      phone: created.phone,
      actions: "View | Edit | Settings",
      createdAt: created.createdAt,
      updatedAt: created.createdAt,
    };
  },
  async update(id: string, payload: Record<string, unknown>) {
    const updated = await apiRequest<{
      id: string;
      name: string;
      phone: string;
      role: "owner" | "tenant" | "family" | "admin" | "gatekeeper";
      societyId: string;
      status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
      createdAt: string;
    }>(`/admin/users/${id}`, {
      method: "PATCH",
      body: {
        society_id: payload.societyId ? String(payload.societyId) : undefined,
        apartment_id: payload.apartment ? String(payload.apartment) : undefined,
        name: payload.name ? String(payload.name) : undefined,
        phone: payload.phone ? String(payload.phone) : undefined,
        role: payload.role ? mapUiRoleToDomain(String(payload.role)) : undefined,
        status: payload.status ? String(payload.status).toLowerCase() : undefined,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      apartment: String(payload.apartment ?? "-"),
      role:
        updated.role === "gatekeeper"
          ? "Staff"
          : updated.role === "owner" || updated.role === "tenant" || updated.role === "family"
            ? "Resident"
            : "Admin",
      status: updated.status,
      societyId: updated.societyId,
      phone: updated.phone,
      actions: "View | Edit | Settings",
      createdAt: updated.createdAt,
      updatedAt: updated.createdAt,
    };
  },
  async remove(id: string) {
    await apiRequest<void>(`/admin/users/${id}`, { method: "DELETE" });
  },
};
