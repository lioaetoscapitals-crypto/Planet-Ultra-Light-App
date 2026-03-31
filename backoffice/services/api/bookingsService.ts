import { createEntity, getEntityById, listEntities, transitionEntity, updateEntity } from "./moduleService";

export const bookingsService = {
  list: () => listEntities("bookings"),
  getById: (id: string) => getEntityById("bookings", id),
  create: (payload: Record<string, unknown>) => createEntity("bookings", payload),
  update: (id: string, payload: Record<string, unknown>) => updateEntity("bookings", id, payload),
  approve: (id: string) => transitionEntity("bookings", id, "status", "Approved"),
  reject: (id: string) => transitionEntity("bookings", id, "status", "Rejected"),
  cancel: (id: string) => transitionEntity("bookings", id, "status", "Cancelled")
};
