# Phase 2: Data Model Design

## Users
- `id` (PK, string)
- `fullName` (required)
- `email` (required, unique)
- `phone` (optional)
- `role` (`Admin | Manager | Security | Resident`)
- `status` (`Active | Pending | Suspended`)
- `apartmentId` (FK -> Apartments.id, nullable for staff users)
- `createdAt`, `updatedAt` (required)

## Apartments
- `id` (PK, string)
- `tower` (required)
- `unitNumber` (required, unique by tower + unitNumber)
- `floor` (required, integer >= 0)
- `occupancyStatus` (`Occupied | Vacant | Maintenance`)
- `ownerUserId` (FK -> Users.id, nullable)
- `createdAt`, `updatedAt`

## GateLogs
- `id` (PK, string)
- `visitorName` (required)
- `visitorPhone` (required)
- `purpose` (required)
- `apartmentId` (FK -> Apartments.id, required)
- `invitationId` (FK -> Invitations.id, nullable)
- `entryStatus` (`Pending | Approved | Rejected | Entered | Exited`)
- `entryAt` (nullable)
- `exitAt` (nullable)
- `securityUserId` (FK -> Users.id, nullable)
- `notes` (nullable)
- `createdAt`, `updatedAt`

## Invitations
- `id` (PK, string)
- `hostUserId` (FK -> Users.id, required)
- `apartmentId` (FK -> Apartments.id, required)
- `guestName` (required)
- `guestPhone` (required)
- `visitDate` (required)
- `timeSlot` (required)
- `status` (`Pending | Approved | Rejected | Used | Expired`)
- `approvedByUserId` (FK -> Users.id, nullable)
- `createdAt`, `updatedAt`

## Bookings
- `id` (PK, string)
- `requesterUserId` (FK -> Users.id, required)
- `apartmentId` (FK -> Apartments.id, required)
- `spaceType` (`Community Hall | Co-Work Space | Gym | Pool | Court`)
- `bookingDate` (required)
- `startTime` (required)
- `endTime` (required)
- `status` (`Pending | Approved | Rejected | Cancelled`)
- `approvedByUserId` (FK -> Users.id, nullable)
- `notes` (nullable)
- `createdAt`, `updatedAt`

## Notices
- `id` (PK, string)
- `title` (required)
- `body` (required)
- `audience` (`AllResidents | Tower | Custom`)
- `towerScope` (nullable)
- `status` (`Draft | Scheduled | Published | Archived`)
- `publishAt` (nullable)
- `authorUserId` (FK -> Users.id, required)
- `createdAt`, `updatedAt`

## MarketItems
- `id` (PK, string)
- `sellerUserId` (FK -> Users.id, required)
- `title` (required)
- `description` (required)
- `category` (required)
- `price` (required, decimal >= 0)
- `quantity` (required, integer >= 0)
- `status` (`Draft | PendingApproval | Approved | Rejected | Inactive`)
- `approvedByUserId` (FK -> Users.id, nullable)
- `createdAt`, `updatedAt`

## Constraints
- Unique:
  - `Users.email`
  - `Apartments(tower, unitNumber)`
- Referential:
  - Cannot delete `Apartment` with active residents without reassignment.
  - Cannot mark `GateLog` as `Entered` unless `Pending/Approved`.
  - `Booking.endTime` must be after `startTime`.
  - `Notice.publishAt` required when status = `Scheduled`.
  - `MarketItems.price >= 0`, `quantity >= 0`.
