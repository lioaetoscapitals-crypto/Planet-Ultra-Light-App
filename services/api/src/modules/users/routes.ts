import { z } from "zod";
import { makeCrudRouter } from "../shared/crudRouter.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import { apartmentUserMap, db } from "../../shared/store/db.js";
import { makeId, nowIso } from "../../shared/utils.js";

const createSchema = z.object({
  societyId: z.string(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["Admin", "Manager", "Security", "Resident"]),
  status: z.enum(["Invited", "Active", "Suspended", "Deactivated"]),
});

const updateSchema = createSchema.partial();

export const usersRouter = makeCrudRouter({
  permissionPrefix: "users",
  repository: new ModuleRepository<"users">(db.users),
  createSchema,
  updateSchema,
  statusField: "status",
});

usersRouter.post("/:id/assign-apartment", (req, res) => {
  const { apartmentId, relationshipType } = req.body as {
    apartmentId?: string;
    relationshipType?: "Owner" | "Tenant" | "FamilyMember" | "Staff";
  };

  if (!apartmentId || !relationshipType) {
    res.status(422).json({ message: "apartmentId and relationshipType are required" });
    return;
  }

  apartmentUserMap.push({
    id: makeId(),
    apartmentId,
    userId: req.params.id,
    relationshipType,
    status: "Active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  res.json({ success: true });
});
