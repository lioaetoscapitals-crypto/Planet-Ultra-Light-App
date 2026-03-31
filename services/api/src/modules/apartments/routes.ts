import { z } from "zod";
import { makeCrudRouter } from "../shared/crudRouter.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import { apartmentUserMap, db } from "../../shared/store/db.js";
import { makeId, nowIso } from "../../shared/utils.js";

const createSchema = z.object({
  societyId: z.string(),
  tower: z.string(),
  unitNumber: z.string(),
  floor: z.number().int().min(0),
  occupancyStatus: z.enum(["Occupied", "Vacant", "Maintenance", "Inactive"]),
});

const updateSchema = createSchema.partial();

export const apartmentsRouter = makeCrudRouter({
  permissionPrefix: "apartments",
  repository: new ModuleRepository<"apartments">(db.apartments),
  createSchema,
  updateSchema,
  statusField: "occupancyStatus",
});

apartmentsRouter.post("/:id/assign-user", (req, res) => {
  const { userId, relationshipType } = req.body as {
    userId?: string;
    relationshipType?: "Owner" | "Tenant" | "FamilyMember" | "Staff";
  };

  if (!userId || !relationshipType) {
    res.status(422).json({ message: "userId and relationshipType are required" });
    return;
  }

  apartmentUserMap.push({
    id: makeId(),
    apartmentId: req.params.id,
    userId,
    relationshipType,
    status: "Active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  res.json({ success: true });
});
