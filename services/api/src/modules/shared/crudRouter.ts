import { Router } from "express";
import { z } from "zod";
import { requirePermission, validate } from "../../shared/http.js";
import { ModuleRepository } from "../../shared/moduleRepository.js";
import type { EntityMap } from "../../shared/types.js";
import { toPagination } from "../../shared/utils.js";

type TransitionMap<K extends keyof EntityMap> = Record<string, (entity: EntityMap[K], userId: string) => Partial<EntityMap[K]>>;

export const makeCrudRouter = <K extends keyof EntityMap>(params: {
  permissionPrefix: "users" | "apartments" | "gate" | "invitations" | "bookings" | "notices" | "market";
  repository: ModuleRepository<K>;
  createSchema: z.ZodType<Omit<EntityMap[K], "id" | "createdAt" | "updatedAt">>;
  updateSchema: z.ZodType<Partial<EntityMap[K]>>;
  statusField?: string;
  transitions?: TransitionMap<K>;
}) => {
  const router = Router();
  const { permissionPrefix, repository, createSchema, updateSchema, statusField, transitions } = params;

  router.get("/", requirePermission(`${permissionPrefix}.read`), (req, res) => {
    const { page, limit } = toPagination(req.query as { page?: string; limit?: string });
    const result = repository.list({
      page,
      limit,
      search: String(req.query.search ?? ""),
      statusField,
      statusValue: req.query.status ? String(req.query.status) : undefined,
    });
    res.json(result);
  });

  router.get("/:id", requirePermission(`${permissionPrefix}.read`), (req, res) => {
    const entity = repository.getById(req.params.id);
    if (!entity) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(entity);
  });

  router.post("/", requirePermission(`${permissionPrefix}.write`), validate(createSchema), (req, res) => {
    const entity = repository.create(req.body);
    res.status(201).json(entity);
  });

  router.patch("/:id", requirePermission(`${permissionPrefix}.write`), validate(updateSchema), (req, res) => {
    const entity = repository.update(req.params.id, req.body);
    if (!entity) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json(entity);
  });

  if (transitions) {
    for (const [action, transition] of Object.entries(transitions)) {
      router.post(`/:id/${action}`, requirePermission(`${permissionPrefix}.write`), (req, res) => {
        const found = repository.getById(req.params.id);
        if (!found) {
          res.status(404).json({ message: "Not found" });
          return;
        }
        const patch = transition(found, req.user?.id ?? "unknown");
        const updated = repository.update(req.params.id, patch);
        res.json(updated);
      });
    }
  }

  return router;
};
