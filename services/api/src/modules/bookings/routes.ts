import { z } from "zod";
import { makeCrudRouter } from "../shared/crudRouter.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import { db } from "../../shared/store/db.js";

const createSchema = z.object({
  societyId: z.string(),
  requesterUserId: z.string(),
  apartmentId: z.string(),
  spaceType: z.enum(["Community Hall", "Co-Work Space", "Gym", "Pool", "Court"]),
  bookingDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(["Draft", "Pending", "Approved", "Rejected", "Confirmed", "Completed", "Cancelled", "NoShow"]),
  approvedByUserId: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const bookingsRouter = makeCrudRouter({
  permissionPrefix: "bookings",
  repository: new ModuleRepository<"bookings">(db.bookings),
  createSchema,
  updateSchema,
  statusField: "status",
  transitions: {
    approve: (_entity, userId) => ({ status: "Approved" as const, approvedByUserId: userId }),
    reject: (_entity, userId) => ({ status: "Rejected" as const, approvedByUserId: userId }),
    cancel: () => ({ status: "Cancelled" as const }),
  },
});
