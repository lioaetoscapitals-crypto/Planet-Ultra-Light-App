import { Router } from "express";
import { z } from "zod";
import { requirePermission, validate } from "../../shared/http.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import type { EntityMap } from "../../shared/types.js";
import { toPagination } from "../../shared/utils.js";
import { addNotification } from "../../shared/store/notifications.js";
import { apartmentUserMap, db } from "../../shared/store/db.js";

type TransitionMap<K extends keyof EntityMap> = Record<
  string,
  (entity: EntityMap[K], userId: string, body?: Record<string, unknown>) => Partial<EntityMap[K]>
>;

export const makeCrudRouter = <K extends keyof EntityMap>(params: {
  permissionPrefix: "users" | "apartments" | "gate" | "invitations" | "bookings" | "notices" | "market";
  repository: ModuleRepository<K>;
  createSchema: z.ZodType<Omit<EntityMap[K], "id" | "createdAt" | "updatedAt">>;
  updateSchema: z.ZodType<Partial<EntityMap[K]>>;
  statusField?: string;
  transitions?: TransitionMap<K>;
  canPatch?: (entity: EntityMap[K], patch: Partial<EntityMap[K]>) => string | null;
  canDelete?: (entity: EntityMap[K]) => string | null;
}) => {
  const router = Router();
  const { permissionPrefix, repository, createSchema, updateSchema, statusField, transitions, canPatch, canDelete } = params;
  const societyField = "societyId";
  const resolveRecipients = (moduleKey: typeof permissionPrefix, entity: Record<string, unknown>, societyId: string) => {
    if (moduleKey === "bookings") {
      const requester = String(entity.requesterUserId ?? "");
      return requester ? [requester] : [];
    }
    if (moduleKey === "invitations") {
      const host = String(entity.hostUserId ?? "");
      return host ? [host] : [];
    }
    if (moduleKey === "market") {
      const seller = String(entity.sellerUserId ?? "");
      return seller ? [seller] : [];
    }
    if (moduleKey === "gate") {
      const resident = String(entity.residentUserId ?? "");
      return resident ? [resident] : [];
    }
    if (moduleKey === "users") {
      return [String(entity.id ?? "")].filter(Boolean);
    }
    if (moduleKey === "apartments") {
      const apartmentId = String(entity.id ?? "");
      return apartmentUserMap
        .filter((map) => map.apartmentId === apartmentId && map.status === "Active")
        .map((map) => map.userId);
    }
    if (moduleKey === "notices") {
      return db.users.filter((user) => user.societyId === societyId && user.role === "Resident").map((user) => user.id);
    }
    return [];
  };

  const notifyResidents = (
    moduleKey: typeof permissionPrefix,
    entity: Record<string, unknown>,
    actorId: string,
    actorRole: string | undefined,
    action: "created" | "updated" | "deleted" | "approved" | "rejected" | "status_changed"
  ) => {
    if (actorRole !== "Admin" && actorRole !== "Manager" && actorRole !== "Security") {
      return;
    }
    const societyId = String(entity[societyField] ?? "");
    if (!societyId) {
      return;
    }
    const targetIds = resolveRecipients(moduleKey, entity, societyId).filter((id) => id && id !== actorId);
    if (targetIds.length === 0) {
      return;
    }
    const entityId = String(entity.id ?? "");
    const statusValue = String(entity.status ?? entity.entryStatus ?? "");
    const moduleLabel =
      moduleKey === "gate"
        ? "Gate"
        : moduleKey === "invitations"
        ? "Invitation"
        : moduleKey === "bookings"
        ? "Activity"
        : moduleKey === "notices"
        ? "Notice"
        : moduleKey === "market"
        ? "Market"
        : moduleKey === "users"
        ? "User"
        : "Apartment";
    targetIds.forEach((userId) => {
      addNotification({
        societyId,
        userId,
        module: moduleKey,
        entityId,
        action,
        title: `${moduleLabel} ${action.replace("_", " ")}`,
        body: statusValue
          ? `Admin updated ${moduleLabel.toLowerCase()} status to ${statusValue}.`
          : `Admin performed ${action.replace("_", " ")} on ${moduleLabel.toLowerCase()}.`
      });
    });
  };

  router.get("/", requirePermission(`${permissionPrefix}.read`), (req, res) => {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ message: "society_id is required in auth context" });
      return;
    }
    const { page, limit } = toPagination(req.query as { page?: string; limit?: string });
    const result = repository.list({
      page,
      limit,
      search: String(req.query.search ?? ""),
      statusField,
      statusValue: req.query.status ? String(req.query.status) : undefined,
      societyField,
      societyValue: societyId,
    });
    res.json(result);
  });

  router.get("/:id", requirePermission(`${permissionPrefix}.read`), (req, res) => {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ message: "society_id is required in auth context" });
      return;
    }
    const entity = repository.getById(req.params.id);
    const entitySocietyId = String((entity as Record<string, unknown> | undefined)?.[societyField] ?? "");
    if (!entity || entitySocietyId !== societyId) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(entity);
  });

  router.post("/", requirePermission(`${permissionPrefix}.write`), validate(createSchema), (req, res) => {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ message: "society_id is required in auth context" });
      return;
    }
    const bodySocietyId = String((req.body as Record<string, unknown>)[societyField] ?? "");
    if (!bodySocietyId || bodySocietyId !== societyId) {
      res.status(403).json({ message: "society_id mismatch: cross-society writes are forbidden" });
      return;
    }
    const entity = repository.create(req.body);
    notifyResidents(permissionPrefix, entity as Record<string, unknown>, req.user?.id ?? "unknown", req.user?.role, "created");
    res.status(201).json(entity);
  });

  router.patch("/:id", requirePermission(`${permissionPrefix}.write`), validate(updateSchema), (req, res) => {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ message: "society_id is required in auth context" });
      return;
    }
    const existing = repository.getById(req.params.id);
    const existingSocietyId = String((existing as Record<string, unknown> | undefined)?.[societyField] ?? "");
    if (!existing || existingSocietyId !== societyId) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    if ((req.body as Record<string, unknown>)[societyField] && String((req.body as Record<string, unknown>)[societyField]) !== societyId) {
      res.status(403).json({ message: "society_id mismatch: cross-society updates are forbidden" });
      return;
    }
    if (canPatch) {
      const patchError = canPatch(existing, req.body);
      if (patchError) {
        res.status(409).json({ message: patchError });
        return;
      }
    }
    const entity = repository.update(req.params.id, req.body);
    if (!entity) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    if (entity) {
      notifyResidents(permissionPrefix, entity as Record<string, unknown>, req.user?.id ?? "unknown", req.user?.role, "updated");
    }
    res.json(entity);
  });

  router.delete("/:id", requirePermission(`${permissionPrefix}.write`), (req, res) => {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ message: "society_id is required in auth context" });
      return;
    }
    const existing = repository.getById(req.params.id);
    const existingSocietyId = String((existing as Record<string, unknown> | undefined)?.[societyField] ?? "");
    if (!existing || existingSocietyId !== societyId) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    if (canDelete) {
      const deleteError = canDelete(existing);
      if (deleteError) {
        res.status(409).json({ message: deleteError });
        return;
      }
    }
    const deleted = repository.remove(req.params.id);
    if (deleted) {
      notifyResidents(permissionPrefix, deleted as Record<string, unknown>, req.user?.id ?? "unknown", req.user?.role, "deleted");
    }
    res.status(204).send();
  });

  if (transitions) {
    for (const [action, transition] of Object.entries(transitions)) {
      router.post(`/:id/${action}`, requirePermission(`${permissionPrefix}.write`), (req, res) => {
        const societyId = req.user?.societyId;
        if (!societyId) {
          res.status(401).json({ message: "society_id is required in auth context" });
          return;
        }
        const found = repository.getById(req.params.id);
        const foundSocietyId = String((found as Record<string, unknown> | undefined)?.[societyField] ?? "");
        if (!found || foundSocietyId !== societyId) {
          res.status(404).json({ message: "Not found" });
          return;
        }
        try {
          const patch = transition(found, req.user?.id ?? "unknown", req.body as Record<string, unknown> | undefined);
          const updated = repository.update(req.params.id, patch);
          if (updated) {
            const actionType =
              action === "approve"
                ? "approved"
                : action === "reject"
                ? "rejected"
                : "status_changed";
            notifyResidents(
              permissionPrefix,
              updated as Record<string, unknown>,
              req.user?.id ?? "unknown",
              req.user?.role,
              actionType
            );
          }
          res.json(updated);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Transition failed";
          res.status(409).json({ message });
        }
      });
    }
  }

  return router;
};
