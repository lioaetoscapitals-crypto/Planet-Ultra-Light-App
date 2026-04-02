import { Router } from "express";
import { requirePermission } from "../../shared/http.js";
import { listNotificationsByUser, markNotificationRead, type AppNotification } from "../../shared/store/notifications.js";
import { db } from "../../shared/store/db.js";

export const notificationsRouter = Router();

notificationsRouter.get("/resident", requirePermission("bookings.read"), (req, res) => {
  const userId = req.user?.id;
  const societyId = req.user?.societyId;
  if (!userId || !societyId) {
    res.status(401).json({ message: "auth context is required" });
    return;
  }
  const liveNotifications: AppNotification[] = [];

  db.bookings
    .filter((booking) => booking.societyId === societyId && booking.requesterUserId === userId && !!booking.approvedByUserId)
    .forEach((booking) => {
      liveNotifications.push({
        id: `booking-${booking.id}-${booking.updatedAt}`,
        societyId,
        userId,
        module: "bookings",
        entityId: booking.id,
        action: booking.status === "Rejected" ? "rejected" : "status_changed",
        title: `Activity ${booking.status}`,
        body:
          booking.status === "Rejected" && booking.rejectedReason
            ? `${booking.eventType} was rejected. Reason: ${booking.rejectedReason}`
            : `${booking.eventType} status changed to ${booking.status}.`,
        read: false,
        createdAt: booking.updatedAt
      });
    });

  db.invitations
    .filter((invitation) => invitation.societyId === societyId && invitation.hostUserId === userId && !!invitation.approvedByUserId)
    .forEach((invitation) => {
      liveNotifications.push({
        id: `invitation-${invitation.id}-${invitation.updatedAt}`,
        societyId,
        userId,
        module: "invitations",
        entityId: invitation.id,
        action: invitation.status === "Rejected" ? "rejected" : "status_changed",
        title: `Invitation ${invitation.status}`,
        body: `Guest ${invitation.guestName} invitation is now ${invitation.status}.`,
        read: false,
        createdAt: invitation.updatedAt
      });
    });

  const stored = listNotificationsByUser(userId, societyId);
  const mergedById = new Map<string, AppNotification>();
  [...stored, ...liveNotifications].forEach((item) => mergedById.set(item.id, item));
  const data = [...mergedById.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ data, total: data.length });
});

notificationsRouter.post("/:id/read", requirePermission("bookings.read"), (req, res) => {
  const userId = req.user?.id;
  const societyId = req.user?.societyId;
  if (!userId || !societyId) {
    res.status(401).json({ message: "auth context is required" });
    return;
  }
  const item = markNotificationRead(req.params.id, userId, societyId);
  if (!item) {
    res.status(404).json({ message: "Notification not found" });
    return;
  }
  res.json(item);
});
