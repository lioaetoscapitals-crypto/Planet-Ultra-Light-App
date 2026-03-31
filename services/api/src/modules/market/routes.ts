import { z } from "zod";
import { makeCrudRouter } from "../shared/crudRouter.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import { db } from "../../shared/store/db.js";

const createSchema = z.object({
  societyId: z.string(),
  sellerUserId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number().min(0),
  quantity: z.number().int().min(0),
  status: z.enum(["Draft", "PendingApproval", "Approved", "Rejected", "Active", "Inactive", "Archived"]),
  approvedByUserId: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const marketRouter = makeCrudRouter({
  permissionPrefix: "market",
  repository: new ModuleRepository<"marketItems">(db.marketItems),
  createSchema,
  updateSchema,
  statusField: "status",
  transitions: {
    approve: (_entity, userId) => ({ status: "Approved" as const, approvedByUserId: userId }),
    reject: (_entity, userId) => ({ status: "Rejected" as const, approvedByUserId: userId }),
  },
});
