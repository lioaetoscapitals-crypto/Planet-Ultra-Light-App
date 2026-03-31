import { apiRequest } from "./client";

export const gateService = {
  async list() {
    const response = await apiRequest<{ items: Record<string, unknown>[] }>("/admin/entries");
    return response.items;
  },
  async getById(id: string) {
    const response = await apiRequest<{
      entry: Record<string, unknown>;
      apartment_list: Array<Record<string, unknown>>;
      gate_log: Record<string, unknown> | null;
      timeline: Array<Record<string, unknown>>;
    }>(`/admin/entries/${id}`);

    return {
      ...response.entry,
      apartmentCount: response.apartment_list.length,
      apartmentList: JSON.stringify(response.apartment_list),
      gateLog: JSON.stringify(response.gate_log ?? {}),
      timeline: JSON.stringify(response.timeline)
    };
  },
  create: (payload: Record<string, unknown>) => {
    const rawApartmentIds = String(payload.apartment_ids ?? "");
    const apartmentIds = rawApartmentIds
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return apiRequest("/entries", {
      method: "POST",
      body: {
        visitor_name: payload.visitorName,
        visitor_phone: payload.visitorPhone,
        visitor_type: payload.visitorType ?? "guest",
        apartment_ids: apartmentIds
      }
    });
  },
  update: (id: string, payload: Record<string, unknown>) =>
    apiRequest(`/admin/entries/${id}`, {
      method: "PATCH",
      body: payload
    }),
  approve: (id: string) =>
    apiRequest(`/admin/entries/${id}`, {
      method: "PATCH",
      body: {
        force_status: "approved"
      }
    }),
  reject: (id: string) =>
    apiRequest(`/admin/entries/${id}`, {
      method: "PATCH",
      body: {
        force_status: "rejected"
      }
    }),
  markEntry: (id: string) =>
    apiRequest(`/entries/${id}/check-in`, {
      method: "POST"
    }),
  markExit: (id: string) =>
    apiRequest(`/entries/${id}/check-out`, {
      method: "POST"
    })
};
