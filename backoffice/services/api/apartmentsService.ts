import { apiRequest } from "./client";
import type { ApartmentEntity } from "./types";
import { getSelectedSocietyId } from "../societySelection";

type ApartmentsListResponse = {
  items: Array<{
    id: string;
    societyId: string;
    societyName?: string;
    towerId: string;
    towerName?: string;
    unitNumber: string;
    home?: string;
    ownerDetails?: string;
    tenantDetails?: string;
    actions?: string;
    createdAt: string;
  }>;
};

function mapApartment(item: ApartmentsListResponse["items"][number]): ApartmentEntity {
  return {
    id: item.id,
    societyId: item.societyId,
    societyName: item.societyName,
    towerId: item.towerId,
    towerName: item.towerName,
    unitNumber: item.unitNumber,
    home: item.home ?? item.unitNumber,
    ownerDetails: item.ownerDetails ?? "-",
    tenantDetails: item.tenantDetails ?? "-",
    actions: item.actions ?? "Info",
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
  };
}

export const apartmentsService = {
  async list() {
    const selectedSocietyId = getSelectedSocietyId();
    const path = selectedSocietyId
      ? `/admin/apartments?society_id=${encodeURIComponent(selectedSocietyId)}`
      : "/admin/apartments";
    const response = await apiRequest<ApartmentsListResponse>(path);
    return response.items.map(mapApartment);
  },
  async getById(id: string) {
    const response = await apiRequest<ApartmentsListResponse["items"][number]>(`/admin/apartments/${id}`);
    return mapApartment(response);
  },
  async create(payload: Record<string, unknown>) {
    const body = {
      society_id: String(payload.societyId ?? ""),
      tower_id: String(payload.towerId ?? ""),
      unit_number: String(payload.unitNumber ?? ""),
    };
    const created = await apiRequest<{ id: string; societyId: string; towerId: string; unitNumber: string; createdAt: string }>(
      "/admin/apartments",
      { method: "POST", body },
    );
    return mapApartment(created);
  },
  async update(id: string, payload: Record<string, unknown>) {
    const body: Record<string, string> = {};
    if (payload.towerId) body.tower_id = String(payload.towerId);
    if (payload.unitNumber) body.unit_number = String(payload.unitNumber);

    const updated = await apiRequest<{ id: string; societyId: string; towerId: string; unitNumber: string; createdAt: string }>(
      `/admin/apartments/${id}`,
      { method: "PATCH", body },
    );
    return mapApartment(updated);
  },
  async remove(id: string) {
    await apiRequest<void>(`/admin/apartments/${id}`, { method: "DELETE" });
  },
};
