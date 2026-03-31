import { apiRequest } from "./client";
import type { SocietyEntity } from "./types";

type SocietiesResponse = {
  items: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
  }>;
};

function mapSociety(item: SocietiesResponse["items"][number]): SocietyEntity {
  return {
    id: item.id,
    name: item.name,
    city: item.city,
    country: item.country,
    latitude: item.latitude,
    longitude: item.longitude,
    actions: "Edit | Settings | Delete",
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
  };
}

export const societiesService = {
  async list() {
    const response = await apiRequest<SocietiesResponse>("/admin/societies");
    return response.items.map(mapSociety);
  },
  async getById(id: string) {
    const response = await apiRequest<SocietiesResponse["items"][number]>(`/admin/societies/${id}`);
    return mapSociety(response);
  },
  async create(payload: Record<string, unknown>) {
    const created = await apiRequest<SocietiesResponse["items"][number]>("/admin/societies", {
      method: "POST",
      body: {
        name: String(payload.name ?? ""),
        city: String(payload.city ?? ""),
        country: String(payload.country ?? "India"),
        latitude: payload.latitude ? Number(payload.latitude) : undefined,
        longitude: payload.longitude ? Number(payload.longitude) : undefined,
      },
    });
    return mapSociety(created);
  },
  async update(id: string, payload: Record<string, unknown>) {
    const body: Record<string, string | number | undefined> = {};
    if (payload.name) body.name = String(payload.name);
    if (payload.city) body.city = String(payload.city);
    if (payload.country) body.country = String(payload.country);
    if (typeof payload.latitude !== "undefined") body.latitude = Number(payload.latitude);
    if (typeof payload.longitude !== "undefined") body.longitude = Number(payload.longitude);
    const updated = await apiRequest<SocietiesResponse["items"][number]>(`/admin/societies/${id}`, {
      method: "PATCH",
      body,
    });
    return mapSociety(updated);
  },
  async remove(id: string) {
    await apiRequest<void>(`/admin/societies/${id}`, { method: "DELETE" });
  },
};
