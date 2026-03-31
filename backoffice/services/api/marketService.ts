import { createEntity, getEntityById, listEntities, transitionEntity, updateEntity } from "./moduleService";

export const marketService = {
  list: () => listEntities("market"),
  getById: (id: string) => getEntityById("market", id),
  create: (payload: Record<string, unknown>) => createEntity("market", payload),
  update: (id: string, payload: Record<string, unknown>) => updateEntity("market", id, payload),
  approve: (id: string) => transitionEntity("market", id, "status", "Approved"),
  reject: (id: string) => transitionEntity("market", id, "status", "Rejected")
};
