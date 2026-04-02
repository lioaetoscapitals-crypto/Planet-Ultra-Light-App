import { Platform } from "react-native";

export type BookingApiStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Confirmed" | "Completed" | "Cancelled" | "NoShow";

export type BookingApiEntity = {
  id: string;
  societyId: string;
  requesterUserId: string;
  apartmentId: string;
  eventType: string;
  spaceType: "Community Hall" | "Co-Work Space" | "Gym" | "Pool" | "Court";
  visibility: "Public" | "Private";
  message?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingApiStatus;
  approvedByUserId?: string;
  createdAt: string;
  updatedAt: string;
};

type BookingsResponse = {
  data: BookingApiEntity[];
  page: number;
  limit: number;
  total: number;
};

type CreateBookingPayload = {
  societyId: string;
  requesterUserId: string;
  apartmentId: string;
  eventType: string;
  spaceType: "Community Hall" | "Co-Work Space" | "Gym" | "Pool" | "Court";
  visibility: "Public" | "Private";
  message?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingApiStatus;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Platform.OS === "android" ? "http://10.0.2.2:4000/v1" : "http://localhost:4000/v1");

const API_HEADERS = {
  "Content-Type": "application/json",
  "x-role": "Resident",
  "x-user-id": "usr-res-001"
};

export async function listBookingsApi(): Promise<BookingApiEntity[]> {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "GET",
    headers: API_HEADERS
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load bookings (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as BookingsResponse;
  return payload.data ?? [];
}

export async function createBookingApi(payload: CreateBookingPayload): Promise<BookingApiEntity> {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create booking (${response.status}): ${text}`);
  }

  return (await response.json()) as BookingApiEntity;
}
