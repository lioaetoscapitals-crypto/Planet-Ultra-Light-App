# Phase 6: API Layer Design

Base path: `/services/api`

## Core principles
- Module-scoped service files.
- No direct fetch/axios calls inside UI components.
- Mock data provider for local development.
- Unified service contracts:
  - `list(params)`
  - `getById(id)`
  - `create(payload)`
  - `update(id, payload)`
  - `transition(id, action)`

## Endpoint map (logical)

### Gate
- `GET /gate-logs`
- `GET /gate-logs/:id`
- `POST /gate-logs`
- `PATCH /gate-logs/:id`
- `POST /gate-logs/:id/entry`
- `POST /gate-logs/:id/exit`

### Invitations
- `GET /invitations`
- `GET /invitations/:id`
- `POST /invitations`
- `PATCH /invitations/:id`
- `POST /invitations/:id/approve`
- `POST /invitations/:id/reject`

### Bookings
- `GET /bookings`
- `GET /bookings/:id`
- `POST /bookings`
- `PATCH /bookings/:id`
- `POST /bookings/:id/approve`
- `POST /bookings/:id/reject`
- `POST /bookings/:id/cancel`

### Notices
- `GET /notices`
- `GET /notices/:id`
- `POST /notices`
- `PATCH /notices/:id`
- `POST /notices/:id/publish`
- `POST /notices/:id/schedule`

### Market
- `GET /market-items`
- `GET /market-items/:id`
- `POST /market-items`
- `PATCH /market-items/:id`
- `POST /market-items/:id/approve`
- `POST /market-items/:id/reject`

### Users
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `POST /users/:id/assign-apartment`

### Apartments
- `GET /apartments`
- `GET /apartments/:id`
- `POST /apartments`
- `PATCH /apartments/:id`
- `POST /apartments/:id/assign-user`

## Authorization (RBAC)
- Admin: full access.
- Manager: all modules except critical role-admin actions.
- Security: Gate + Invitations read/transition operations only.
