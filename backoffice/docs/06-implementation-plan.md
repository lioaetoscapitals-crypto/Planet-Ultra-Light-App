# Planet Ultra End-to-End Implementation Plan

## 1) Target Monorepo Structure

```text
Ultra Planet App/
  src/                               # Mobile app (React Native / Expo)
    modules/
      gate/
      invitations/
      bookings/
      notices/
      market/
      users/
      apartments/
    components/
      common/
      ui/
      forms/
    navigation/
    services/
      api/
      auth/
      notifications/
    store/
    hooks/
    utils/
    assets/
  backoffice/                        # SaaS panel (React + TS)
    app/
      navigation/
      layout/
      providers/
    modules/
      dashboard/
      gate/
      invitations/
      bookings/
      notices/
      market/
      users/
      apartments/
      auth/
      shared/
    components/
      common/
      ui/
      forms/
    services/
      api/
      auth/
    hooks/
    utils/
    assets/
    docs/
  services/
    api/                             # Backend service (Node/Nest/Fastify suggested)
      src/
        modules/
          auth/
          users/
          apartments/
          gate/
          invitations/
          bookings/
          notices/
          market/
          notifications/
          audit/
        shared/
          db/
          rbac/
          middleware/
          utils/
      prisma/ or migrations/
```

## 2) Module Build Definition (Applies to each module)

- `List page`: table, filters, search, pagination, bulk actions.
- `Detail page`: complete fields, event timeline, related entities, status controls.
- `Create/Edit page`: typed form, client validation, backend validation, change log.
- `Workflow actions`: approve/reject/activate/deactivate/archive/restore.
- `Permission checks`: route-level + action-level + API-level.

## 3) API Structure

```text
services/api/src/modules/<module>/
  controller.ts
  service.ts
  repository.ts
  dto/
    create.dto.ts
    update.dto.ts
    filter.dto.ts
    transition.dto.ts
  mapper.ts
  policy.ts
```

Common API contracts:
- `GET /<module>?page=1&limit=20&search=...`
- `GET /<module>/:id`
- `POST /<module>`
- `PATCH /<module>/:id`
- `POST /<module>/:id/<transition>`
- `POST /<module>/bulk`

## 4) Role/Permission Implementation

- Roles: `Admin`, `Manager`, `Security`, `Resident`.
- API middleware:
  - `requireAuth`
  - `requireRole`
  - `requirePermission(module, action)`
- Permissions matrix key:
  - `module.read`
  - `module.create`
  - `module.update`
  - `module.delete`
  - `module.archive`
  - `module.approve`
  - `module.reject`
  - `module.assign`

## 5) Workflow Implementation Sequence

1. **Gate + Invitations (Core Operations)**
   - Visitor approval and gate transitions.
   - Invitation-to-gate linking.
2. **Bookings**
   - Availability + conflict checks + approval flow.
3. **Notices**
   - Draft/schedule/publish with audience targeting.
4. **Users + Apartments**
   - Assignment, occupancy, role governance.
5. **Market**
   - Listing moderation lifecycle.
6. **Dashboard + Analytics**
   - KPI aggregation across all modules.

## 6) Sprint Plan (Suggested)

### Sprint 1 (Foundation)
- Auth, RBAC, base layout, shared components, API client, module routing skeleton.

### Sprint 2 (Gate + Invitations)
- Complete mobile + backoffice + API + DB for gate/invitation workflows.

### Sprint 3 (Bookings + Notices)
- End-to-end booking and notice lifecycles with schedule jobs.

### Sprint 4 (Users + Apartments + Market)
- Resident-apartment linking, market moderation, bulk operations.

### Sprint 5 (Hardening)
- Audit logs, alerts, exports, monitoring, security, performance, QA signoff.

## 7) Definition of Done (Per Module)

- All list/detail/form pages working.
- All lifecycle transitions implemented and validated.
- Role permissions enforced in UI and API.
- Audit entries generated for all mutating actions.
- API contract tests + UI smoke tests pass.
