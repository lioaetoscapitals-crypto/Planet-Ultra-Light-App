import { z } from "zod";
import { makeCrudRouter } from "../shared/crudRouter.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import { db } from "../../shared/store/db.js";

const createSchema = z.object({
  societyId: z.string(),
  hostUserId: z.string(),
  apartmentId: z.string(),
  guestName: z.string(),
  guestPhone: z.string(),
  visitDate: z.string(),
  timeSlot: z.string(),
  status: z.enum(["Draft", "Pending", "Approved", "Rejected", "Used", "Expired", "Cancelled"]),
  approvedByUserId: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const invitationsRouter = makeCrudRouter({
  permissionPrefix: "invitations",
  repository: new ModuleRepository<"invitations">(db.invitations),
  createSchema,
  updateSchema,
  statusField: "status",
  transitions: {
    approve: (_entity, userId) => ({ status: "Approved" as const, approvedByUserId: userId }),
    reject: (_entity, userId) => ({ status: "Rejected" as const, approvedByUserId: userId }),
  },
});
