import { z } from "zod";
import { makeCrudRouter } from "../shared/crudRouter.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import { db } from "../../shared/store/db.js";
import { nowIso } from "../../shared/utils.js";

const createSchema = z.object({
  societyId: z.string(),
  invitationId: z.string().optional(),
  apartmentId: z.string(),
  residentUserId: z.string().optional(),
  visitorName: z.string(),
  visitorPhone: z.string(),
  purpose: z.string(),
  entryStatus: z.enum(["Pending", "Approved", "Rejected", "Entered", "Exited"]),
  securityUserId: z.string().optional(),
  approvedByUserId: z.string().optional(),
  entryAt: z.string().optional(),
  exitAt: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const gateRouter = makeCrudRouter({
  permissionPrefix: "gate",
  repository: new ModuleRepository<"gateLogs">(db.gateLogs),
  createSchema,
  updateSchema,
  statusField: "entryStatus",
  transitions: {
    approve: (_entity, userId) => ({ entryStatus: "Approved" as const, approvedByUserId: userId }),
    reject: (_entity, userId) => ({ entryStatus: "Rejected" as const, approvedByUserId: userId }),
    entry: (_entity, userId) => ({ entryStatus: "Entered" as const, securityUserId: userId, entryAt: nowIso() }),
    exit: (_entity, userId) => ({ entryStatus: "Exited" as const, securityUserId: userId, exitAt: nowIso() }),
  },
});
