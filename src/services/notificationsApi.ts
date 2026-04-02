import { Platform } from "react-native";

export type AppNotificationApi = {
  id: string;
  module: string;
  action: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  data: AppNotificationApi[];
  total: number;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Platform.OS === "android" ? "http://10.0.2.2:4000/v1" : "http://localhost:4000/v1");

const API_HEADERS = {
  "Content-Type": "application/json",
  "x-role": "Resident",
  "x-user-id": "usr-res-001"
};

export async function listResidentNotificationsApi(): Promise<AppNotificationApi[]> {
  const response = await fetch(`${API_BASE_URL}/notifications/resident`, {
    method: "GET",
    headers: API_HEADERS
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load notifications (${response.status}): ${text}`);
  }
  const payload = (await response.json()) as NotificationsResponse;
  return payload.data ?? [];
}

export async function markNotificationReadApi(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "POST",
    headers: API_HEADERS
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to mark notification as read (${response.status}): ${text}`);
  }
}

