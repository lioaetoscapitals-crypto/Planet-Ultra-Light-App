import { apiRequest } from "../../services/apiClient";
import type { EntryApiItem, EntryDraft } from "./types";

type CreateEntryResponse = {
  entry: EntryApiItem;
};

type ListEntriesResponse = {
  items: EntryApiItem[];
  total: number;
};

export const entryService = {
  async createEntry(draft: EntryDraft) {
    return apiRequest<CreateEntryResponse>("/entries", {
      method: "POST",
      body: {
        visitor_name: draft.visitorName,
        visitor_phone: draft.visitorPhone,
        visitor_type: draft.visitorType,
        apartment_ids: draft.apartmentIds,
        vehicle_number: draft.vehicleNumber || undefined,
        vehicle_photo_url: draft.vehiclePhotoUrl || undefined,
        visitor_photo_url: draft.visitorPhotoUrl || undefined,
        visitor_count: Number.parseInt(draft.visitorCount || "1", 10)
      }
    });
  },
  async listEntries(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest<ListEntriesResponse>(`/entries${query}`);
  }
};
