import { apiRequest } from "../../services/apiClient";

export const gateService = {
  checkIn(entryId: string) {
    return apiRequest(`/entries/${entryId}/check-in`, { method: "POST" });
  },
  checkOut(entryId: string) {
    return apiRequest(`/entries/${entryId}/check-out`, { method: "POST" });
  }
};
