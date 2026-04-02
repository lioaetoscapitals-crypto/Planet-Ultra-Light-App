import { z } from "zod";
import { makeCrudRouter } from "../shared/crudRouter.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import { db } from "../../shared/store/db.js";
import type { BookingEntity } from "../../shared/types.js";

const BOOKING_STATUS_VALUES = [
  "Draft",
  "Pending",
  "ToCheck",
  "Approved",
  "ToPay",
  "Online",
  "Rejected",
  "Refund",
  "Refunded",
  "Confirmed",
  "Completed",
  "Cancelled",
  "NoShow",
] as const;

const TRANSITIONAL_EDITABLE_STATUSES = new Set<string>(["Draft", "Pending", "ToCheck"]);
const REJECTABLE_STATUSES = new Set<string>(["Draft", "Pending", "ToCheck"]);
const APPROVABLE_STATUSES = new Set<string>(["Draft", "Pending", "ToCheck"]);
const DELETABLE_STATUSES = new Set<string>(["Draft", "Pending", "ToCheck", "ToPay", "Approved", "Rejected", "Cancelled"]);

function normalizeIncomingStatus(status: string): (typeof BOOKING_STATUS_VALUES)[number] {
  if (status === "Waiting") return "ToCheck";
  if (status === "waiting") return "ToCheck";
  return BOOKING_STATUS_VALUES.includes(status as (typeof BOOKING_STATUS_VALUES)[number])
    ? (status as (typeof BOOKING_STATUS_VALUES)[number])
    : "Pending";
}

function startDateTimeValue(entity: Partial<BookingEntity>): number {
  if (!entity.bookingDate || !entity.startTime) return Number.POSITIVE_INFINITY;
  const normalizedTime = String(entity.startTime).length === 5 ? `${entity.startTime}:00` : String(entity.startTime);
  return new Date(`${entity.bookingDate}T${normalizedTime}`).getTime();
}

function validateEditability(entity: BookingEntity): string | null {
  const status = String(entity.status ?? "");
  if (!TRANSITIONAL_EDITABLE_STATUSES.has(status)) {
    return `Activity cannot be edited when status is ${status}.`;
  }
  const startsAt = startDateTimeValue(entity);
  if (Number.isFinite(startsAt) && startsAt < Date.now()) {
    return "Past activity cannot be edited.";
  }
  return null;
}

function validatePatch(existing: BookingEntity, patch: Partial<BookingEntity>): string | null {
  if (Object.keys(patch).length === 0) {
    return null;
  }
  const status = normalizeIncomingStatus(String(patch.status ?? existing.status));
  const editableError = validateEditability(existing);
  if (editableError) {
    return editableError;
  }
  if (["ToPay", "Refund", "Approved", "Rejected", "Refunded"].includes(existing.status)) {
    return `Activity in ${existing.status} cannot be edited manually.`;
  }
  if (status !== existing.status && !TRANSITIONAL_EDITABLE_STATUSES.has(existing.status)) {
    return `Activity status cannot change from ${existing.status}.`;
  }
  return null;
}

function validateDelete(existing: BookingEntity): string | null {
  if (!DELETABLE_STATUSES.has(existing.status)) {
    return `Activity in ${existing.status} cannot be deleted.`;
  }
  return null;
}

const createSchema = z.object({
  societyId: z.string(),
  requesterUserId: z.string(),
  apartmentId: z.string(),
  spaceType: z.enum(["Community Hall", "Co-Work Space", "Gym", "Pool", "Court"]),
  eventType: z.string().min(1),
  visibility: z.enum(["Public", "Private"]),
  message: z.string().optional(),
  bookingDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(BOOKING_STATUS_VALUES),
  authorName: z.string().optional(),
  paymentLabel: z.string().optional(),
  paymentStatus: z.enum(["Unpaid", "Paid", "RefundInitiated", "Refunded"]).optional(),
  paymentMethod: z.enum(["InternalPA", "Razorpay", "Cash", "BankTransfer"]).optional(),
  coverImageUrl: z.string().optional(),
  rejectedReason: z.string().optional(),
  approvedByUserId: z.string().optional(),
});

const updateSchema = createSchema.partial();

const repository = new ModuleRepository<"bookings">(db.bookings);

export const bookingsRouter = makeCrudRouter({
  permissionPrefix: "bookings",
  repository,
  createSchema,
  updateSchema,
  statusField: "status",
  canPatch: validatePatch,
  canDelete: validateDelete,
  transitions: {
    approve: (entity, userId) => {
      if (!APPROVABLE_STATUSES.has(entity.status)) {
        throw new Error(`Cannot approve activity from ${entity.status} state.`);
      }
      if (entity.paymentMethod === "InternalPA") {
        return { status: "Approved" as const, paymentStatus: "Paid" as const, approvedByUserId: userId };
      }
      return { status: "Approved" as const, approvedByUserId: userId };
    },
    reject: (entity, userId, body) => {
      if (!REJECTABLE_STATUSES.has(entity.status)) {
        throw new Error(`Cannot reject activity from ${entity.status} state.`);
      }
      const reason = String(body?.reason ?? "").trim();
      if (!reason) {
        throw new Error("Reject reason is required.");
      }
      return { status: "Rejected" as const, approvedByUserId: userId, rejectedReason: reason };
    },
    toPay: (entity, userId) => {
      if (entity.status !== "Approved") {
        throw new Error("Only approved activities can move to ToPay.");
      }
      return { status: "ToPay" as const, approvedByUserId: userId };
    },
    markOnline: (entity, userId) => {
      if (entity.status !== "ToPay") {
        throw new Error("Only ToPay activities can move to Online.");
      }
      return { status: "Online" as const, paymentStatus: "Paid" as const, approvedByUserId: userId };
    },
    refund: (entity, userId) => {
      if (entity.status !== "Online" && entity.status !== "Approved") {
        throw new Error("Only active paid activities can move to Refund.");
      }
      return { status: "Refund" as const, paymentStatus: "RefundInitiated" as const, approvedByUserId: userId };
    },
    markRefunded: (entity, userId) => {
      if (entity.status !== "Refund") {
        throw new Error("Only Refund activities can move to Refunded.");
      }
      return { status: "Refunded" as const, paymentStatus: "Refunded" as const, approvedByUserId: userId };
    },
    cancel: () => ({ status: "Cancelled" as const }),
  },
});
