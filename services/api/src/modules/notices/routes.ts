import { z } from "zod";
import { makeCrudRouter } from "../shared/crudRouter.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import { db } from "../../shared/store/db.js";

const createSchema = z.object({
  societyId: z.string(),
  title: z.string(),
  body: z.string(),
  audience: z.enum(["AllResidents", "Tower", "Custom"]),
  towerScope: z.string().optional(),
  status: z.enum(["Draft", "Scheduled", "Published", "Expired", "Archived"]),
  publishAt: z.string().optional(),
  authorUserId: z.string(),
});

const updateSchema = createSchema.partial();

export const noticesRouter = makeCrudRouter({
  permissionPrefix: "notices",
  repository: new ModuleRepository<"notices">(db.notices),
  createSchema,
  updateSchema,
  statusField: "status",
  transitions: {
    publish: () => ({ status: "Published" as const }),
    schedule: () => ({ status: "Scheduled" as const }),
  },
});
