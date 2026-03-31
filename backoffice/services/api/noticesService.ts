import { createEntity, getEntityById, listEntities, transitionEntity, updateEntity } from "./moduleService";

export const noticesService = {
  list: () => listEntities("notices"),
  getById: (id: string) => getEntityById("notices", id),
  create: (payload: Record<string, unknown>) => createEntity("notices", payload),
  update: (id: string, payload: Record<string, unknown>) => updateEntity("notices", id, payload),
  publish: (id: string) => transitionEntity("notices", id, "status", "Published"),
  schedule: (id: string) => transitionEntity("notices", id, "status", "Scheduled")
};
