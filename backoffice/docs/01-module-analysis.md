# Phase 1: Mobile Module Analysis

## 1) Gate
- Primary actions:
  - Log visitor entry request
  - Approve/reject entry
  - Mark entry/exit timestamps
  - Track guard/security decisions
- Actors:
  - Resident, Security, Admin/Manager
- Backoffice implications:
  - Live/filtered visitor logs
  - Entry/exit SLA tracking
  - Audit trail by guard and approver

## 2) Invitations
- Primary actions:
  - Resident creates invitation
  - Invitation approved/rejected
  - Check-in via gate
- Actors:
  - Resident, Security, Manager/Admin
- Backoffice implications:
  - Invitation workflow queue
  - Approval state transitions
  - Link invitation to gate logs

## 3) Space Bookings
- Primary actions:
  - Browse spaces
  - View slot/pricing details
  - Submit booking request
  - Approve/reject/cancel booking
- Actors:
  - Resident, Manager/Admin
- Backoffice implications:
  - Calendar-like booking management
  - Pricing and slot governance
  - Conflict prevention controls

## 4) Notices
- Primary actions:
  - Draft notice
  - Publish now or schedule
  - Set visibility scope
- Actors:
  - Admin/Manager
- Backoffice implications:
  - Editorial workflow
  - Publish/schedule state machine
  - Audience targeting

## 5) Market
- Primary actions:
  - Create listing
  - Moderate listing
  - Activate/deactivate listing
- Actors:
  - Resident seller, Admin/Manager
- Backoffice implications:
  - Listing moderation queue
  - Status governance
  - Category and inventory metadata

## 6) Users
- Primary actions:
  - Manage user lifecycle
  - Assign roles and status
  - Map users to apartments
- Actors:
  - Admin/Manager
- Backoffice implications:
  - RBAC + user directory
  - Account-state governance
  - Apartment ownership/occupancy mapping

## 7) Apartments
- Primary actions:
  - Create apartment records
  - Assign/remove residents
  - Track occupancy status
- Actors:
  - Admin/Manager
- Backoffice implications:
  - Apartment master data
  - Tenant mapping
  - Relationship source for invitations, notices scope, and gate checks

## Entity Relationship Flow
- `Users` belong to or are assigned to `Apartments`.
- `Invitations` are created by `Users` and validated against `Apartments`.
- `GateLogs` can reference `Invitations`, and always reference apartment/user context when known.
- `Bookings` are created by `Users` for space resources.
- `Notices` are authored by `Users` (Admin/Manager) with target audience metadata.
- `MarketItems` are created by `Users` and moderated by Admin/Manager.
