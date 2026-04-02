import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { Request } from "express";
import { z } from "zod";
import { db, apartmentUserMap } from "../../shared/store/db.js";
import type { EntryApartmentStatus, OverallStatus } from "./types.js";
import { residentStore } from "./store.js";

const router = Router();

const timeoutSeconds = Number.parseInt(process.env.ENTRY_TIMEOUT_SECONDS ?? "120", 10);
const timeoutOutcome = process.env.ENTRY_TIMEOUT_OUTCOME === "auto_reject" ? "auto_reject" : "expired";

const createEntrySchema = z.object({
  visitor_name: z.string().min(2),
  visitor_phone: z.string().min(8),
  visitor_type: z.enum(["delivery", "cab", "service", "guest"]),
  apartment_ids: z.array(z.string()).min(1),
  vehicle_number: z.string().optional(),
  vehicle_photo_url: z.string().optional(),
  visitor_photo_url: z.string().optional(),
  visitor_count: z.number().int().min(1).default(1),
});

const respondSchema = z.object({
  apartment_id: z.string(),
  action: z.enum(["approve", "reject"]),
});

const overrideSchema = z.object({
  force_status: z.enum(["pending", "partial_approved", "approved", "rejected", "completed", "expired"]),
});

function role(reqRole: unknown): string {
  return String(reqRole ?? "").toLowerCase();
}

function canGatekeeper(reqRole: unknown): boolean {
  const r = role(reqRole);
  return r === "security" || r === "gatekeeper" || r === "admin" || r === "manager";
}

function canAdmin(reqRole: unknown): boolean {
  const r = role(reqRole);
  return r === "admin" || r === "manager";
}

function requireSocietyId(req: Request): string | null {
  return req.user?.societyId ?? null;
}

function recomputeOverallStatus(entryId: string): OverallStatus {
  const children = residentStore.entryApartments.filter((item) => item.entryId === entryId);
  const statuses = children.map((item) => item.status);

  if (statuses.length === 0) return "pending";
  if (statuses.every((status) => status === "approved")) return "approved";
  if (statuses.some((status) => status === "approved")) return "partial_approved";
  if (statuses.every((status) => status === "rejected")) return "rejected";

  const allTerminalNoApproval = statuses.every((status) => status === "rejected" || status === "expired");
  if (allTerminalNoApproval) {
    if (timeoutOutcome === "expired" && statuses.some((status) => status === "expired")) {
      return "expired";
    }
    return "rejected";
  }

  return "pending";
}

function emitEvent(
  entryId: string,
  eventType: "ENTRY_CREATED" | "ENTRY_UPDATED" | "ENTRY_COMPLETED" | "ENTRY_EXPIRED",
  payload: Record<string, unknown>,
) {
  residentStore.events.unshift({
    id: randomUUID(),
    entryId,
    eventType,
    payload,
    createdAt: new Date().toISOString(),
  });
}

function applyTimeoutSweep() {
  const now = Date.now();
  for (const entry of residentStore.visitorEntries) {
    if (!["pending", "partial_approved"].includes(entry.overallStatus)) continue;
    if (new Date(entry.expiresAt).getTime() > now) continue;

    const children = residentStore.entryApartments.filter((item) => item.entryId === entry.id);
    let changed = false;
    for (const child of children) {
      if (child.status !== "pending") continue;
      child.status = timeoutOutcome === "auto_reject" ? "rejected" : "expired";
      child.respondedAt = new Date().toISOString();
      changed = true;
    }
    if (!changed) continue;

    const next = recomputeOverallStatus(entry.id);
    entry.overallStatus = next;
    emitEvent(entry.id, next === "expired" ? "ENTRY_EXPIRED" : "ENTRY_UPDATED", {
      reason: "timeout",
      overall_status: next,
    });
  }
}

router.post("/entries", (req, res) => {
  if (!canGatekeeper(req.user?.role)) {
    res.status(403).json({ message: "Only gatekeeper/security/admin can create entries" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }

  applyTimeoutSweep();
  const parsed = createEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const apartmentIds = [...new Set(parsed.data.apartment_ids)];
  const invalidApartment = apartmentIds.find((id) => !db.apartments.some((apartment) => apartment.id === id && apartment.societyId === societyId));
  if (invalidApartment) {
    res.status(422).json({ message: `Unknown apartment_id: ${invalidApartment}` });
    return;
  }

  const nowIso = new Date().toISOString();
  const entryId = randomUUID();
  const expiresAt = new Date(Date.now() + timeoutSeconds * 1000).toISOString();

  const entry = {
    id: entryId,
    societyId,
    createdBy: req.user?.id ?? "unknown",
    visitorName: parsed.data.visitor_name,
    visitorPhone: parsed.data.visitor_phone,
    visitorType: parsed.data.visitor_type,
    vehicleNumber: parsed.data.vehicle_number,
    vehiclePhotoUrl: parsed.data.vehicle_photo_url,
    visitorPhotoUrl: parsed.data.visitor_photo_url,
    visitorCount: parsed.data.visitor_count,
    overallStatus: "pending" as const,
    createdAt: nowIso,
    expiresAt,
  };

  residentStore.visitorEntries.unshift(entry);

  const entryApartments = apartmentIds.map((apartmentId) => ({
    id: randomUUID(),
    entryId,
    apartmentId,
    status: "pending" as const,
  }));
  residentStore.entryApartments.push(...entryApartments);

  const residentUsers = apartmentUserMap
    .filter((map) => map.status === "Active" && apartmentIds.includes(map.apartmentId))
    .map((map) => map.userId);
  const uniqueResidents = [...new Set(residentUsers)];

  for (const userId of uniqueResidents) {
    const mappedUser = db.users.find((item) => item.id === userId);
    if (!mappedUser || mappedUser.societyId !== societyId) continue;
    residentStore.notifications.push({
      id: randomUUID(),
      societyId,
      userId,
      entryId,
      type: "approval_request",
      status: "sent",
      createdAt: new Date().toISOString(),
    });
  }

  emitEvent(entryId, "ENTRY_CREATED", {
    apartment_ids: apartmentIds,
    resident_user_ids: uniqueResidents,
  });

  res.status(201).json({
    entry,
    entry_apartments: entryApartments,
    notifications_sent: uniqueResidents.length,
  });
});

router.get("/entries", (req, res) => {
  if (!canGatekeeper(req.user?.role)) {
    res.status(403).json({ message: "Only gatekeeper/security/admin can list entries" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  applyTimeoutSweep();
  const status = req.query.status ? String(req.query.status) : null;
  const from = req.query.from ? new Date(String(req.query.from)).getTime() : null;
  const to = req.query.to ? new Date(String(req.query.to)).getTime() : null;

  const items = residentStore.visitorEntries.filter((entry) => {
    if (entry.societyId !== societyId) return false;
    if (status && entry.overallStatus !== status) return false;
    const created = new Date(entry.createdAt).getTime();
    if (from && created < from) return false;
    if (to && created > to) return false;
    return true;
  });

  res.json({ items, total: items.length });
});

router.post("/entries/:id/check-in", (req, res) => {
  if (!canGatekeeper(req.user?.role)) {
    res.status(403).json({ message: "Only gatekeeper/security/admin can check-in" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  applyTimeoutSweep();
  const entry = residentStore.visitorEntries.find((item) => item.id === req.params.id && item.societyId === societyId);
  if (!entry) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }

  const children = residentStore.entryApartments.filter((item) => item.entryId === entry.id);
  const canEnter = children.some((item) => item.status === "approved");
  if (!canEnter) {
    res.status(409).json({ message: "Entry cannot be checked in: no apartment approval yet" });
    return;
  }

  if (entry.checkedInAt) {
    res.status(409).json({ message: "Entry already checked in" });
    return;
  }

  const nowIso = new Date().toISOString();
  entry.checkedInAt = nowIso;
  let gateLog = residentStore.gateLogs.find((item) => item.entryId === entry.id);
  if (!gateLog) {
    gateLog = {
      id: randomUUID(),
      societyId,
      entryId: entry.id,
      checkInTime: nowIso,
      status: "checked_in",
    };
    residentStore.gateLogs.unshift(gateLog);
  } else {
    gateLog.checkInTime = nowIso;
    gateLog.status = "checked_in";
  }

  emitEvent(entry.id, "ENTRY_UPDATED", { stage: "checked_in" });
  res.json({
    entry_id: entry.id,
    check_in_time: nowIso,
    gate_log_status: gateLog.status,
  });
});

router.post("/entries/:id/check-out", (req, res) => {
  if (!canGatekeeper(req.user?.role)) {
    res.status(403).json({ message: "Only gatekeeper/security/admin can check-out" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  const entry = residentStore.visitorEntries.find((item) => item.id === req.params.id && item.societyId === societyId);
  if (!entry) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }
  if (!entry.checkedInAt) {
    res.status(409).json({ message: "Cannot check-out before check-in" });
    return;
  }
  if (entry.checkedOutAt) {
    res.status(409).json({ message: "Entry already checked out" });
    return;
  }

  const nowIso = new Date().toISOString();
  entry.checkedOutAt = nowIso;
  entry.overallStatus = "completed";

  let gateLog = residentStore.gateLogs.find((item) => item.entryId === entry.id);
  if (!gateLog) {
    gateLog = { id: randomUUID(), societyId, entryId: entry.id };
    residentStore.gateLogs.unshift(gateLog);
  }
  gateLog.checkInTime = gateLog.checkInTime ?? entry.checkedInAt;
  gateLog.checkOutTime = nowIso;
  gateLog.status = "checked_out";

  emitEvent(entry.id, "ENTRY_COMPLETED", { stage: "checked_out" });
  res.json({
    entry_id: entry.id,
    check_out_time: nowIso,
    gate_log_status: gateLog.status,
  });
});

router.get("/entries/pending", (req, res) => {
  if (role(req.user?.role) !== "resident") {
    res.status(403).json({ message: "Only residents can fetch pending requests" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  applyTimeoutSweep();
  const userId = req.user?.id ?? "";
  const userApartmentIds = apartmentUserMap
    .filter((map) => map.userId === userId && map.status === "Active")
    .map((map) => map.apartmentId);

  const pendingRows = residentStore.entryApartments.filter(
    (item) => item.status === "pending" && userApartmentIds.includes(item.apartmentId),
  );
  const entryIds = [...new Set(pendingRows.map((row) => row.entryId))];
  const items = residentStore.visitorEntries.filter((entry) => entryIds.includes(entry.id) && entry.societyId === societyId);
  res.json({ items, total: items.length });
});

router.post("/entries/:id/respond", (req, res) => {
  if (role(req.user?.role) !== "resident") {
    res.status(403).json({ message: "Only residents can respond" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  applyTimeoutSweep();
  const parsed = respondSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const entry = residentStore.visitorEntries.find((item) => item.id === req.params.id && item.societyId === societyId);
  if (!entry) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }

  const userId = req.user?.id ?? "";
  const canRespondForApartment = apartmentUserMap.some(
    (map) => map.userId === userId && map.apartmentId === parsed.data.apartment_id && map.status === "Active",
  );
  if (!canRespondForApartment) {
    res.status(403).json({ message: "Resident is not mapped to this apartment" });
    return;
  }

  const row = residentStore.entryApartments.find(
    (item) => item.entryId === entry.id && item.apartmentId === parsed.data.apartment_id,
  );
  if (!row) {
    res.status(404).json({ message: "Apartment is not part of this entry" });
    return;
  }
  if (row.status !== "pending") {
    res.status(409).json({ message: "This apartment has already responded" });
    return;
  }

  row.status = parsed.data.action === "approve" ? "approved" : "rejected";
  row.respondedBy = userId;
  row.respondedAt = new Date().toISOString();

  entry.overallStatus = recomputeOverallStatus(entry.id);
  emitEvent(entry.id, "ENTRY_UPDATED", {
    apartment_id: row.apartmentId,
    action: parsed.data.action,
    overall_status: entry.overallStatus,
  });

  residentStore.notifications.push({
    id: randomUUID(),
    societyId,
    userId: entry.createdBy,
    entryId: entry.id,
    type: "update",
    status: "sent",
    createdAt: new Date().toISOString(),
  });

  res.json({
    apartment_status: row.status,
    apartment_id: row.apartmentId,
    recomputed_overall_status: entry.overallStatus,
  });
});

router.get("/admin/entries", (req, res) => {
  if (!canAdmin(req.user?.role)) {
    res.status(403).json({ message: "Only admin/manager can access admin entries" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  applyTimeoutSweep();
  const status = req.query.status ? String(req.query.status) : null;
  const items = residentStore.visitorEntries
    .filter((entry) => entry.societyId === societyId && (status ? entry.overallStatus === status : true))
    .map((entry) => {
      const gateLog = residentStore.gateLogs.find((log) => log.entryId === entry.id);
      const child = residentStore.entryApartments.filter((row) => row.entryId === entry.id);
      return {
        ...entry,
        apartment_count: child.length,
        approved_count: child.filter((row) => row.status === "approved").length,
        rejected_count: child.filter((row) => row.status === "rejected").length,
        pending_count: child.filter((row) => row.status === "pending").length,
        inside: gateLog?.status === "checked_in",
      };
    });

  res.json({ items, total: items.length });
});

router.get("/admin/entries/:id", (req, res) => {
  if (!canAdmin(req.user?.role)) {
    res.status(403).json({ message: "Only admin/manager can access admin entries" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  applyTimeoutSweep();
  const entry = residentStore.visitorEntries.find((item) => item.id === req.params.id && item.societyId === societyId);
  if (!entry) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }

  const apartments = residentStore.entryApartments.filter((item) => item.entryId === entry.id);
  const gateLog = residentStore.gateLogs.find((item) => item.entryId === entry.id) ?? null;
  const timeline = residentStore.events
    .filter((item) => item.entryId === entry.id)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  res.json({
    entry,
    apartment_list: apartments,
    gate_log: gateLog,
    timeline,
  });
});

router.patch("/admin/entries/:id", (req, res) => {
  if (!canAdmin(req.user?.role)) {
    res.status(403).json({ message: "Only admin/manager can override entries" });
    return;
  }
  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }

  const parsed = overrideSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const entry = residentStore.visitorEntries.find((item) => item.id === req.params.id && item.societyId === societyId);
  if (!entry) {
    res.status(404).json({ message: "Entry not found" });
    return;
  }

  entry.overallStatus = parsed.data.force_status;
  emitEvent(entry.id, "ENTRY_UPDATED", {
    override: true,
    force_status: parsed.data.force_status,
    actor_user_id: req.user?.id,
  });

  res.json({ entry });
});

router.get("/admin/analytics", (req, res) => {
  if (!canAdmin(req.user?.role)) {
    res.status(403).json({ message: "Only admin/manager can access analytics" });
    return;
  }

  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  applyTimeoutSweep();
  const byDay = new Map<string, number>();
  const scopedEntries = residentStore.visitorEntries.filter((entry) => entry.societyId === societyId);
  for (const entry of scopedEntries) {
    const day = entry.createdAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const total = scopedEntries.length;
  const approved = scopedEntries.filter((item) => item.overallStatus === "approved").length;
  const rejected = scopedEntries.filter((item) => item.overallStatus === "rejected").length;

  res.json({
    total_entries: total,
    approval_rate: total > 0 ? Number((approved / total).toFixed(4)) : 0,
    rejection_rate: total > 0 ? Number((rejected / total).toFixed(4)) : 0,
    entries_per_day: [...byDay.entries()].map(([date, count]) => ({ date, count })),
  });
});

router.get("/apartments", (req, res) => {
  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  const items = db.apartments.filter((item) => item.societyId === societyId);
  res.json({ items, total: items.length });
});

router.get("/users", (req, res) => {
  const societyId = requireSocietyId(req);
  if (!societyId) {
    res.status(401).json({ message: "society_id is required in auth context" });
    return;
  }
  const items = db.users.filter((item) => item.societyId === societyId);
  res.json({ items, total: items.length });
});

export { router as residentSystemRouter };
