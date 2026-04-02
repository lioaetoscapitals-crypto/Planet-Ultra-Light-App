import { nowIso } from "../utils.js";

export type AppNotification = {
  id: string;
  societyId: string;
  userId: string;
  module: "users" | "apartments" | "gate" | "invitations" | "bookings" | "notices" | "market";
  entityId: string;
  action: "created" | "updated" | "deleted" | "approved" | "rejected" | "status_changed";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

const notifications: AppNotification[] = [];

export function listNotificationsByUser(userId: string, societyId: string): AppNotification[] {
  return notifications
    .filter((item) => item.userId === userId && item.societyId === societyId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addNotification(input: Omit<AppNotification, "id" | "createdAt" | "read">): AppNotification {
  const next: AppNotification = {
    ...input,
    id: `notif-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    read: false,
    createdAt: nowIso()
  };
  notifications.unshift(next);
  return next;
}

export function markNotificationRead(notificationId: string, userId: string, societyId: string): AppNotification | null {
  const index = notifications.findIndex(
    (item) => item.id === notificationId && item.userId === userId && item.societyId === societyId
  );
  if (index === -1) {
    return null;
  }
  notifications[index] = { ...notifications[index], read: true };
  return notifications[index];
}

