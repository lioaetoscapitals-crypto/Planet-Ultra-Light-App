import { apiRequest } from "./client";
import type { BookingEntity } from "./types";
import { createEntity, getEntityById, listEntities, transitionEntity, updateEntity } from "./moduleService";

export type BookingDisplayStatus = "ToCheck" | "Approved" | "ToPay" | "Rejected" | "Refund" | "Refunded" | "Online";

export function toBookingDisplayStatus(status: string): BookingDisplayStatus {
  if (status === "Approved") return "Approved";
  if (status === "ToPay") return "ToPay";
  if (status === "Rejected" || status === "Cancelled") return "Rejected";
  if (status === "Refund") return "Refund";
  if (status === "Refunded") return "Refunded";
  if (status === "Online") return "Online";
  return "ToCheck";
}

export function canOpenBookingDetails(status: string) {
  return toBookingDisplayStatus(status) === "ToCheck";
}

export function canEditBooking(booking: BookingEntity) {
  const displayStatus = toBookingDisplayStatus(booking.status);
  if (["ToPay", "Approved", "Rejected", "Refund", "Refunded"].includes(displayStatus)) {
    return false;
  }
  const startsAt = new Date(`${booking.bookingDate}T${booking.startTime.length === 5 ? `${booking.startTime}:00` : booking.startTime}`).getTime();
  if (Number.isFinite(startsAt) && startsAt < Date.now()) {
    return false;
  }
  return true;
}

export function canDeleteBooking(status: string) {
  const displayStatus = toBookingDisplayStatus(status);
  return ["ToCheck", "ToPay", "Approved", "Rejected"].includes(displayStatus);
}

export const bookingsService = {
  list: () => listEntities("bookings"),
  getById: (id: string) => getEntityById("bookings", id),
  create: (payload: Record<string, unknown>) => createEntity("bookings", payload),
  update: (id: string, payload: Record<string, unknown>) => updateEntity("bookings", id, payload),
  remove: async (id: string) => {
    await apiRequest<void>(`/bookings/${id}`, { method: "DELETE" });
  },
  approve: (id: string) => transitionEntity("bookings", id, "status", "Approved"),
  reject: (id: string, reason = "Rejected by admin") =>
    transitionEntity("bookings", id, "status", "Rejected", { reason }),
  cancel: (id: string) => transitionEntity("bookings", id, "status", "Cancelled"),
  moveToPay: (id: string) => apiRequest<BookingEntity>(`/bookings/${id}/toPay`, { method: "POST" }),
  markOnline: (id: string) => apiRequest<BookingEntity>(`/bookings/${id}/markOnline`, { method: "POST" }),
  requestRefund: (id: string) => apiRequest<BookingEntity>(`/bookings/${id}/refund`, { method: "POST" }),
  markRefunded: (id: string) => apiRequest<BookingEntity>(`/bookings/${id}/markRefunded`, { method: "POST" })
};
