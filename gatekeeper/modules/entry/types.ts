export type EntryDraft = {
  tower: string;
  apartmentIds: string[];
  visitorName: string;
  visitorPhone: string;
  company: string;
  visitorCount: string;
  vehicleNumber: string;
  vehiclePhotoUrl: string;
  visitorPhotoUrl: string;
  visitorType: "delivery" | "cab" | "service" | "guest";
};

export type EntryApiItem = {
  id: string;
  visitorName: string;
  visitorPhone: string;
  overallStatus: "pending" | "partial_approved" | "approved" | "rejected" | "completed" | "expired";
  createdAt: string;
};
