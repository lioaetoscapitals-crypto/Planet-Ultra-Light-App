import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { onboardingStore } from "./store.js";
import type { DocumentType, UserStatus } from "./types.js";

const router = Router();

const mandatoryDocumentsByRole: Record<"owner" | "tenant" | "family", DocumentType[]> = {
  owner: ["sale_deed", "index_2", "govt_id"],
  tenant: ["rent_agreement", "police_verification", "govt_id", "society_charge_receipt"],
  family: ["reference_owner_id", "govt_id"],
};

const allowMultipleTenants = process.env.ALLOW_MULTIPLE_TENANTS !== "false";

const signupSchema = z.object({
  society_id: z.string(),
  apartment_id: z.string(),
  name: z.string().min(2),
  phone: z.string().min(8),
  role: z.enum(["owner", "tenant", "family"]),
  reference_owner_user_id: z.string().optional(),
  documents: z
    .array(
      z.object({
        type: z.enum([
          "sale_deed",
          "index_2",
          "govt_id",
          "rent_agreement",
          "police_verification",
          "society_charge_receipt",
          "reference_owner_id",
        ]),
        file_url: z.string().url(),
      }),
    )
    .min(1),
});

const uploadDocumentSchema = z.object({
  user_id: z.string(),
  type: z.enum([
    "sale_deed",
    "index_2",
    "govt_id",
    "rent_agreement",
    "police_verification",
    "society_charge_receipt",
    "reference_owner_id",
  ]),
  file_url: z.string().url(),
});

const approveSchema = z.object({
  request_id: z.string(),
});

const rejectSchema = z.object({
  request_id: z.string(),
  reason: z.string().min(5),
});

const societySchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2).default("India"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const towerSchema = z.object({
  society_id: z.string(),
  name: z.enum(["A", "B", "C"]),
});

const apartmentSchema = z.object({
  society_id: z.string(),
  tower_id: z.string(),
  unit_number: z.string().regex(/^[ABC]-\d{3}$/),
});

const updateApartmentSchema = z.object({
  tower_id: z.string().optional(),
  unit_number: z
    .string()
    .regex(/^[ABC]-\d{3}$/)
    .optional(),
});

const adminUserSchema = z.object({
  society_id: z.string(),
  apartment_id: z.string().optional(),
  name: z.string().min(2),
  phone: z.string().min(8),
  role: z.enum(["owner", "tenant", "family", "admin", "gatekeeper"]),
  status: z.enum(["draft", "submitted", "under_review", "approved", "rejected"]),
});

function resolveAdminSocietyId(req: any): string | null {
  const requestedSocietyId = (req.query.society_id as string | undefined) ?? (req.body?.society_id as string | undefined);
  const userRole = String(req.user?.role ?? "").toLowerCase();
  const userId = req.user?.id;

  if (userRole === "admin") {
    const mapping = onboardingStore.admins.find((item) => item.userId === userId);
    if (!mapping) {
      // Bootstrap mode for local BO usage without seeded admin mapping.
      return requestedSocietyId ?? onboardingStore.societies[0]?.id ?? null;
    }
    if (requestedSocietyId && requestedSocietyId !== mapping.societyId) return null;
    return mapping.societyId;
  }

  if (userRole === "manager") {
    return requestedSocietyId ?? null;
  }

  return null;
}

function validateMandatoryDocuments(role: "owner" | "tenant" | "family", docTypes: DocumentType[]) {
  const mandatory = mandatoryDocumentsByRole[role];
  const missing = mandatory.filter((type) => !docTypes.includes(type));
  return missing;
}

function setRequestStatus(requestId: string, nextStatus: UserStatus, reason?: string) {
  const request = onboardingStore.requests.find((item) => item.id === requestId);
  if (!request) return null;
  request.status = nextStatus;
  request.updatedAt = new Date().toISOString();
  request.rejectionReason = reason;

  const user = onboardingStore.users.find((item) => item.id === request.userId);
  if (user) {
    user.status = nextStatus;
    user.rejectionReason = reason;
  }
  return request;
}

router.get("/societies", (_req, res) => {
  res.json({ items: onboardingStore.societies, total: onboardingStore.societies.length });
});

router.get("/apartments", (req, res) => {
  const societyId = req.query.society_id ? String(req.query.society_id) : "";
  if (!societyId) {
    res.status(422).json({ message: "society_id is required" });
    return;
  }
  const towerName = req.query.tower ? String(req.query.tower).toUpperCase() : null;
  const towers = onboardingStore.towers.filter((tower) => tower.societyId === societyId && (!towerName || tower.name === towerName));
  const towerIds = new Set(towers.map((tower) => tower.id));
  const items = onboardingStore.apartments.filter((apartment) => apartment.societyId === societyId && towerIds.has(apartment.towerId));
  res.json({ items, total: items.length });
});

router.post("/signup", (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const payload = parsed.data;
  const society = onboardingStore.societies.find((item) => item.id === payload.society_id);
  if (!society) {
    res.status(422).json({ message: "Invalid society_id" });
    return;
  }

  const apartment = onboardingStore.apartments.find((item) => item.id === payload.apartment_id && item.societyId === payload.society_id);
  if (!apartment) {
    res.status(422).json({ message: "Apartment not found in selected society" });
    return;
  }

  const docTypes = payload.documents.map((doc) => doc.type as DocumentType);
  const missingDocs = validateMandatoryDocuments(payload.role, docTypes);
  if (missingDocs.length > 0) {
    res.status(422).json({ message: "Missing mandatory documents", missing: missingDocs });
    return;
  }

  if (payload.role === "owner") {
    const hasExistingOwner = onboardingStore.userApartments.some((link) => {
      if (link.apartmentId !== payload.apartment_id || link.role !== "owner") return false;
      const user = onboardingStore.users.find((u) => u.id === link.userId);
      return user && user.status !== "rejected";
    });
    if (hasExistingOwner) {
      res.status(409).json({ message: "Owner already exists for this apartment" });
      return;
    }
  }

  if (payload.role === "tenant" && !allowMultipleTenants) {
    const tenantCount = onboardingStore.userApartments.filter((link) => {
      if (link.apartmentId !== payload.apartment_id || link.role !== "tenant") return false;
      const user = onboardingStore.users.find((u) => u.id === link.userId);
      return user && user.status !== "rejected";
    }).length;
    if (tenantCount > 0) {
      res.status(409).json({ message: "Tenant already exists for this apartment (configured single-tenant mode)" });
      return;
    }
  }

  if (payload.role === "family") {
    const ownerReferenceId = payload.reference_owner_user_id;
    if (!ownerReferenceId) {
      res.status(422).json({ message: "reference_owner_user_id is required for family role" });
      return;
    }
    const ownerLinked = onboardingStore.userApartments.some(
      (link) => link.apartmentId === payload.apartment_id && link.role === "owner" && link.userId === ownerReferenceId,
    );
    if (!ownerLinked) {
      res.status(422).json({ message: "Family member must reference apartment owner" });
      return;
    }
  }

  const existingByPhone = onboardingStore.users.find((user) => user.phone === payload.phone && user.societyId === payload.society_id);
  const userId = existingByPhone?.id ?? randomUUID();
  const createdAt = new Date().toISOString();

  if (!existingByPhone) {
    onboardingStore.users.push({
      id: userId,
      name: payload.name,
      phone: payload.phone,
      role: payload.role,
      societyId: payload.society_id,
      status: "submitted",
      createdAt,
    });
  } else {
    existingByPhone.name = payload.name;
    existingByPhone.role = payload.role;
    existingByPhone.status = "submitted";
    existingByPhone.rejectionReason = undefined;
  }

  const requestId = randomUUID();
  onboardingStore.requests.push({
    id: requestId,
    userId,
    societyId: payload.society_id,
    apartmentId: payload.apartment_id,
    role: payload.role,
    status: "submitted",
    createdAt,
    updatedAt: createdAt,
  });

  onboardingStore.userApartments.push({
    id: randomUUID(),
    userId,
    apartmentId: payload.apartment_id,
    role: payload.role,
    createdAt,
  });

  for (const document of payload.documents) {
    onboardingStore.documents.push({
      id: randomUUID(),
      userId,
      type: document.type,
      fileUrl: document.file_url,
      status: "pending",
      uploadedAt: createdAt,
    });
  }

  const societyAdmins = onboardingStore.admins.filter((admin) => admin.societyId === payload.society_id);
  for (const admin of societyAdmins) {
    onboardingStore.notifications.push({
      id: randomUUID(),
      userId: admin.userId,
      societyId: payload.society_id,
      eventType: "submission",
      message: `New onboarding submitted by ${payload.name}.`,
      createdAt: new Date().toISOString(),
    });
  }

  res.status(201).json({
    request_id: requestId,
    user_id: userId,
    status: "submitted",
  });
});

router.post("/documents", (req, res) => {
  const parsed = uploadDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const user = onboardingStore.users.find((item) => item.id === parsed.data.user_id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const record = {
    id: randomUUID(),
    userId: parsed.data.user_id,
    type: parsed.data.type,
    fileUrl: parsed.data.file_url,
    status: "pending" as const,
    uploadedAt: new Date().toISOString(),
  };
  onboardingStore.documents.push(record);

  const latestRejectedRequest = [...onboardingStore.requests]
    .reverse()
    .find((request) => request.userId === user.id && request.status === "rejected");
  if (latestRejectedRequest) {
    setRequestStatus(latestRejectedRequest.id, "submitted");
  }

  res.status(201).json({ document: record });
});

router.get("/admin/requests", (req, res) => {
  const societyId = resolveAdminSocietyId(req);
  if (!societyId) {
    res.status(403).json({ message: "Admin access denied for requested society" });
    return;
  }

  const status = req.query.status ? String(req.query.status) : null;
  const role = req.query.role ? String(req.query.role) : null;
  const tower = req.query.tower ? String(req.query.tower).toUpperCase() : null;

  const towerIds = tower
    ? new Set(onboardingStore.towers.filter((item) => item.societyId === societyId && item.name === tower).map((item) => item.id))
    : null;

  const rows = onboardingStore.requests
    .filter((request) => request.societyId === societyId)
    .filter((request) => (status ? request.status === status : true))
    .filter((request) => (role ? request.role === role : true))
    .filter((request) => {
      if (!towerIds) return true;
      const apartment = onboardingStore.apartments.find((item) => item.id === request.apartmentId);
      return apartment ? towerIds.has(apartment.towerId) : false;
    })
    .map((request) => {
      const user = onboardingStore.users.find((item) => item.id === request.userId);
      const apartment = onboardingStore.apartments.find((item) => item.id === request.apartmentId);
      const docs = onboardingStore.documents.filter((doc) => doc.userId === request.userId);
      return {
        ...request,
        user,
        apartment,
        documents: docs,
      };
    });

  const pending = rows.filter((row) => row.status === "submitted" || row.status === "under_review").length;
  const approved = rows.filter((row) => row.status === "approved").length;
  const rejected = rows.filter((row) => row.status === "rejected").length;

  res.json({
    summary: { pending, approved, rejected },
    items: rows,
    total: rows.length,
  });
});

router.post("/admin/approve", (req, res) => {
  const parsed = approveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const target = onboardingStore.requests.find((item) => item.id === parsed.data.request_id);
  if (!target) {
    res.status(404).json({ message: "Request not found" });
    return;
  }

  const allowedSociety = resolveAdminSocietyId({ ...req, query: { society_id: target.societyId } });
  if (!allowedSociety) {
    res.status(403).json({ message: "Admin access denied" });
    return;
  }

  setRequestStatus(target.id, "approved");
  onboardingStore.documents
    .filter((doc) => doc.userId === target.userId && doc.status === "pending")
    .forEach((doc) => {
      doc.status = "approved";
    });

  onboardingStore.notifications.push({
    id: randomUUID(),
    userId: target.userId,
    societyId: target.societyId,
    eventType: "approval",
    message: "Your onboarding request has been approved.",
    createdAt: new Date().toISOString(),
  });

  res.json({ request_id: target.id, status: "approved" });
});

router.post("/admin/reject", (req, res) => {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const target = onboardingStore.requests.find((item) => item.id === parsed.data.request_id);
  if (!target) {
    res.status(404).json({ message: "Request not found" });
    return;
  }

  const allowedSociety = resolveAdminSocietyId({ ...req, query: { society_id: target.societyId } });
  if (!allowedSociety) {
    res.status(403).json({ message: "Admin access denied" });
    return;
  }

  setRequestStatus(target.id, "rejected", parsed.data.reason);
  onboardingStore.documents
    .filter((doc) => doc.userId === target.userId && doc.status === "pending")
    .forEach((doc) => {
      doc.status = "rejected";
    });

  onboardingStore.notifications.push({
    id: randomUUID(),
    userId: target.userId,
    societyId: target.societyId,
    eventType: "rejection",
    message: `Onboarding rejected: ${parsed.data.reason}`,
    createdAt: new Date().toISOString(),
  });

  res.json({ request_id: target.id, status: "rejected", reason: parsed.data.reason });
});

router.get("/admin/societies", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  const userId = req.user?.id;
  if (userRole === "admin") {
    const mapping = onboardingStore.admins.find((item) => item.userId === userId);
    if (!mapping) {
      res.json({ items: onboardingStore.societies });
      return;
    }
    const item = onboardingStore.societies.find((soc) => soc.id === mapping.societyId);
    res.json({ items: item ? [item] : [] });
    return;
  }

  if (userRole === "manager") {
    res.json({ items: onboardingStore.societies });
    return;
  }

  res.status(403).json({ message: "Admin-only endpoint" });
});

router.post("/admin/societies", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    res.status(403).json({ message: "Admin-only endpoint" });
    return;
  }

  const parsed = societySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const exists = onboardingStore.societies.some((society) => society.name.toLowerCase() === parsed.data.name.toLowerCase());
  if (exists) {
    res.status(409).json({ message: "Society with same name already exists" });
    return;
  }

  const created = {
    id: randomUUID(),
    name: parsed.data.name,
    city: parsed.data.city,
    country: parsed.data.country,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    createdAt: new Date().toISOString(),
  };
  onboardingStore.societies.push(created);
  res.status(201).json(created);
});

router.get("/admin/societies/:id", (req, res) => {
  const item = onboardingStore.societies.find((society) => society.id === req.params.id);
  if (!item) {
    res.status(404).json({ message: "Society not found" });
    return;
  }
  res.json(item);
});

router.patch("/admin/societies/:id", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    res.status(403).json({ message: "Admin-only endpoint" });
    return;
  }

  const parsed = societySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const item = onboardingStore.societies.find((society) => society.id === req.params.id);
  if (!item) {
    res.status(404).json({ message: "Society not found" });
    return;
  }

  if (parsed.data.name) item.name = parsed.data.name;
  if (parsed.data.city) item.city = parsed.data.city;
  if (parsed.data.country) item.country = parsed.data.country;
  if (typeof parsed.data.latitude !== "undefined") item.latitude = parsed.data.latitude;
  if (typeof parsed.data.longitude !== "undefined") item.longitude = parsed.data.longitude;
  res.json(item);
});

router.delete("/admin/societies/:id", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    res.status(403).json({ message: "Admin-only endpoint" });
    return;
  }

  const itemIndex = onboardingStore.societies.findIndex((society) => society.id === req.params.id);
  if (itemIndex === -1) {
    res.status(404).json({ message: "Society not found" });
    return;
  }

  const societyId = onboardingStore.societies[itemIndex].id;
  const hasApartments = onboardingStore.apartments.some((apartment) => apartment.societyId === societyId);
  if (hasApartments) {
    res.status(409).json({ message: "Cannot delete society with apartments. Remove apartments first." });
    return;
  }

  onboardingStore.societies.splice(itemIndex, 1);
  res.status(204).send();
});

router.get("/admin/towers", (req, res) => {
  const societyId = String(req.query.society_id ?? "");
  const items = societyId ? onboardingStore.towers.filter((tower) => tower.societyId === societyId) : onboardingStore.towers;
  res.json({ items, total: items.length });
});

router.post("/admin/towers", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    res.status(403).json({ message: "Admin-only endpoint" });
    return;
  }

  const parsed = towerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const society = onboardingStore.societies.find((item) => item.id === parsed.data.society_id);
  if (!society) {
    res.status(422).json({ message: "Invalid society_id" });
    return;
  }

  const duplicate = onboardingStore.towers.some(
    (tower) => tower.societyId === parsed.data.society_id && tower.name === parsed.data.name,
  );
  if (duplicate) {
    res.status(409).json({ message: "Tower already exists for society" });
    return;
  }

  const created = {
    id: randomUUID(),
    societyId: parsed.data.society_id,
    name: parsed.data.name,
    createdAt: new Date().toISOString(),
  };
  onboardingStore.towers.push(created);
  res.status(201).json(created);
});

router.get("/admin/apartments", (req, res) => {
  const societyId = String(req.query.society_id ?? "");
  const towerId = String(req.query.tower_id ?? "");

  const items = onboardingStore.apartments.filter((apartment) => {
    if (societyId && apartment.societyId !== societyId) return false;
    if (towerId && apartment.towerId !== towerId) return false;
    return true;
  });

  const rows = items.map((item) => {
    const society = onboardingStore.societies.find((soc) => soc.id === item.societyId);
    const tower = onboardingStore.towers.find((tw) => tw.id === item.towerId);
    const links = onboardingStore.userApartments.filter((link) => link.apartmentId === item.id);
    const owners = links
      .filter((link) => link.role === "owner")
      .map((link) => onboardingStore.users.find((user) => user.id === link.userId)?.name)
      .filter((name): name is string => Boolean(name));
    const tenants = links
      .filter((link) => link.role === "tenant")
      .map((link) => onboardingStore.users.find((user) => user.id === link.userId)?.name)
      .filter((name): name is string => Boolean(name));
    return {
      ...item,
      societyName: society?.name ?? "-",
      towerName: tower?.name ?? "-",
      home: item.unitNumber,
      ownerDetails: owners.length > 0 ? owners.join(", ") : "-",
      tenantDetails: tenants.length > 0 ? tenants.join(", ") : "-",
      actions: "Info",
    };
  });

  res.json({ items: rows, total: rows.length });
});

router.get("/admin/apartments/:id", (req, res) => {
  const item = onboardingStore.apartments.find((apartment) => apartment.id === req.params.id);
  if (!item) {
    res.status(404).json({ message: "Apartment not found" });
    return;
  }
  const society = onboardingStore.societies.find((soc) => soc.id === item.societyId);
  const tower = onboardingStore.towers.find((tw) => tw.id === item.towerId);
  const links = onboardingStore.userApartments.filter((link) => link.apartmentId === item.id);
  const owners = links
    .filter((link) => link.role === "owner")
    .map((link) => onboardingStore.users.find((user) => user.id === link.userId)?.name)
    .filter((name): name is string => Boolean(name));
  const tenants = links
    .filter((link) => link.role === "tenant")
    .map((link) => onboardingStore.users.find((user) => user.id === link.userId)?.name)
    .filter((name): name is string => Boolean(name));
  res.json({
    ...item,
    societyName: society?.name ?? "-",
    towerName: tower?.name ?? "-",
    home: item.unitNumber,
    ownerDetails: owners.length > 0 ? owners.join(", ") : "-",
    tenantDetails: tenants.length > 0 ? tenants.join(", ") : "-",
    actions: "Info",
  });
});

router.post("/admin/apartments", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    res.status(403).json({ message: "Admin-only endpoint" });
    return;
  }

  const parsed = apartmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const society = onboardingStore.societies.find((item) => item.id === parsed.data.society_id);
  if (!society) {
    res.status(422).json({ message: "Invalid society_id" });
    return;
  }

  const tower = onboardingStore.towers.find(
    (item) => item.id === parsed.data.tower_id && item.societyId === parsed.data.society_id,
  );
  if (!tower) {
    res.status(422).json({ message: "tower_id does not belong to selected society" });
    return;
  }

  const duplicate = onboardingStore.apartments.some(
    (item) => item.societyId === parsed.data.society_id && item.unitNumber === parsed.data.unit_number,
  );
  if (duplicate) {
    res.status(409).json({ message: "Apartment unit already exists in society" });
    return;
  }

  const created = {
    id: randomUUID(),
    societyId: parsed.data.society_id,
    towerId: parsed.data.tower_id,
    unitNumber: parsed.data.unit_number,
    createdAt: new Date().toISOString(),
  };
  onboardingStore.apartments.push(created);
  res.status(201).json(created);
});

router.patch("/admin/apartments/:id", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    res.status(403).json({ message: "Admin-only endpoint" });
    return;
  }

  const parsed = updateApartmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const item = onboardingStore.apartments.find((apartment) => apartment.id === req.params.id);
  if (!item) {
    res.status(404).json({ message: "Apartment not found" });
    return;
  }

  if (parsed.data.tower_id) {
    const tower = onboardingStore.towers.find((tw) => tw.id === parsed.data.tower_id && tw.societyId === item.societyId);
    if (!tower) {
      res.status(422).json({ message: "tower_id does not belong to apartment society" });
      return;
    }
    item.towerId = parsed.data.tower_id;
  }

  if (parsed.data.unit_number) {
    const duplicate = onboardingStore.apartments.some(
      (apartment) =>
        apartment.id !== item.id &&
        apartment.societyId === item.societyId &&
        apartment.unitNumber === parsed.data.unit_number,
    );
    if (duplicate) {
      res.status(409).json({ message: "Apartment unit already exists in society" });
      return;
    }
    item.unitNumber = parsed.data.unit_number;
  }

  res.json(item);
});

router.delete("/admin/apartments/:id", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    res.status(403).json({ message: "Admin-only endpoint" });
    return;
  }

  const itemIndex = onboardingStore.apartments.findIndex((apartment) => apartment.id === req.params.id);
  if (itemIndex === -1) {
    res.status(404).json({ message: "Apartment not found" });
    return;
  }

  const apartmentId = onboardingStore.apartments[itemIndex].id;
  onboardingStore.userApartments = onboardingStore.userApartments.filter((link) => link.apartmentId !== apartmentId);
  onboardingStore.requests = onboardingStore.requests.filter((request) => request.apartmentId !== apartmentId);
  onboardingStore.apartments.splice(itemIndex, 1);
  res.status(204).send();
});

router.get("/admin/users", (req, res) => {
  const societyId = String(req.query.society_id ?? "");
  const role = String(req.query.role ?? "").toLowerCase();

  const rows = onboardingStore.users
    .filter((user) => (societyId ? user.societyId === societyId : true))
    .filter((user) => (role ? user.role === role : true))
    .map((user) => {
      const apartmentLink = onboardingStore.userApartments.find((link) => link.userId === user.id);
      const apartment = apartmentLink ? onboardingStore.apartments.find((apt) => apt.id === apartmentLink.apartmentId) : null;
      const uiRole =
        user.role === "gatekeeper"
          ? "Staff"
          : user.role === "owner" || user.role === "tenant" || user.role === "family"
            ? "Resident"
            : user.role === "admin"
              ? "Admin"
              : "Guest";
      return {
        id: user.id,
        name: user.name,
        apartment: apartment?.unitNumber ?? "-",
        role: uiRole,
        status: user.status,
        actions: "View | Edit | Settings",
        societyId: user.societyId,
        phone: user.phone,
      };
    });

  res.json({ items: rows, total: rows.length });
});

router.get("/admin/users/:id", (req, res) => {
  const user = onboardingStore.users.find((item) => item.id === req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const apartmentLink = onboardingStore.userApartments.find((link) => link.userId === user.id);
  const apartment = apartmentLink ? onboardingStore.apartments.find((apt) => apt.id === apartmentLink.apartmentId) : null;

  res.json({
    id: user.id,
    name: user.name,
    apartment: apartment?.unitNumber ?? "-",
    role: user.role,
    status: user.status,
    societyId: user.societyId,
    phone: user.phone,
    createdAt: user.createdAt,
  });
});

router.post("/admin/users", (req, res) => {
  const parsed = adminUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const society = onboardingStore.societies.find((item) => item.id === parsed.data.society_id);
  if (!society) {
    res.status(422).json({ message: "Invalid society_id" });
    return;
  }

  const createdAt = new Date().toISOString();
  const createdUser = {
    id: randomUUID(),
    name: parsed.data.name,
    phone: parsed.data.phone,
    role: parsed.data.role,
    societyId: parsed.data.society_id,
    status: parsed.data.status,
    createdAt,
  };
  onboardingStore.users.push(createdUser);

  if (parsed.data.apartment_id) {
    onboardingStore.userApartments.push({
      id: randomUUID(),
      userId: createdUser.id,
      apartmentId: parsed.data.apartment_id,
      role: parsed.data.role === "admin" || parsed.data.role === "gatekeeper" ? "tenant" : parsed.data.role,
      createdAt,
    });
  }

  res.status(201).json(createdUser);
});

router.patch("/admin/users/:id", (req, res) => {
  const parsed = adminUserSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ message: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const user = onboardingStore.users.find((item) => item.id === req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (parsed.data.name) user.name = parsed.data.name;
  if (parsed.data.phone) user.phone = parsed.data.phone;
  if (parsed.data.role) user.role = parsed.data.role;
  if (parsed.data.status) user.status = parsed.data.status;
  if (parsed.data.society_id) user.societyId = parsed.data.society_id;

  if (parsed.data.apartment_id) {
    const current = onboardingStore.userApartments.find((link) => link.userId === user.id);
    if (current) {
      current.apartmentId = parsed.data.apartment_id;
      if (parsed.data.role && parsed.data.role !== "admin" && parsed.data.role !== "gatekeeper") {
        current.role = parsed.data.role;
      }
    } else {
      onboardingStore.userApartments.push({
        id: randomUUID(),
        userId: user.id,
        apartmentId: parsed.data.apartment_id,
        role: parsed.data.role && parsed.data.role !== "admin" && parsed.data.role !== "gatekeeper" ? parsed.data.role : "tenant",
        createdAt: new Date().toISOString(),
      });
    }
  }

  res.json(user);
});

router.delete("/admin/users/:id", (req, res) => {
  const userRole = String(req.user?.role ?? "").toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    res.status(403).json({ message: "Admin-only endpoint" });
    return;
  }

  const userIndex = onboardingStore.users.findIndex((item) => item.id === req.params.id);
  if (userIndex === -1) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const userId = onboardingStore.users[userIndex].id;
  onboardingStore.users.splice(userIndex, 1);
  onboardingStore.userApartments = onboardingStore.userApartments.filter((link) => link.userId !== userId);
  onboardingStore.documents = onboardingStore.documents.filter((doc) => doc.userId !== userId);
  onboardingStore.requests = onboardingStore.requests.filter((request) => request.userId !== userId);
  onboardingStore.notifications = onboardingStore.notifications.filter((notification) => notification.userId !== userId);
  res.status(204).send();
});

export { router as onboardingRouter };
