import type { EntryApartment, EntryEvent, GateLog, Notification, VisitorEntry } from "./types.js";

export const residentStore: {
  visitorEntries: VisitorEntry[];
  entryApartments: EntryApartment[];
  gateLogs: GateLog[];
  notifications: Notification[];
  events: EntryEvent[];
} = {
  visitorEntries: [],
  entryApartments: [],
  gateLogs: [],
  notifications: [],
  events: [],
};
