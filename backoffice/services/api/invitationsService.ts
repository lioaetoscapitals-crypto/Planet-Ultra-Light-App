import { createEntity, getEntityById, listEntities, transitionEntity, updateEntity } from "./moduleService";

export const invitationsService = {
  list: () => listEntities("invitations"),
  getById: (id: string) => getEntityById("invitations", id),
  create: (payload: Record<string, unknown>) => createEntity("invitations", payload),
  update: (id: string, payload: Record<string, unknown>) => updateEntity("invitations", id, payload),
  approve: (id: string) => transitionEntity("invitations", id, "status", "Approved"),
  reject: (id: string) => transitionEntity("invitations", id, "status", "Rejected")
};
