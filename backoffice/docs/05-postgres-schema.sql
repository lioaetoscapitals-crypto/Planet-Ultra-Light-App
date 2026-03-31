-- Planet Ultra Resident Management
-- PostgreSQL schema v1 (multi-tenant ready with society_id)

create extension if not exists "pgcrypto";

create table societies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table towers (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (society_id, name)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('Admin', 'Manager', 'Security', 'Resident')),
  status text not null check (status in ('Invited', 'Active', 'Suspended', 'Deactivated')),
  password_hash text,
  last_login_at timestamptz,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (society_id, email)
);

create table apartments (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  tower_id uuid not null references towers(id) on delete restrict,
  unit_number text not null,
  floor integer not null check (floor >= 0),
  occupancy_status text not null check (occupancy_status in ('Occupied', 'Vacant', 'Maintenance', 'Inactive')),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tower_id, unit_number)
);

create table apartment_user_map (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  apartment_id uuid not null references apartments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('Owner', 'Tenant', 'FamilyMember', 'Staff')),
  is_primary boolean not null default false,
  status text not null check (status in ('Active', 'Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (apartment_id, user_id, relationship_type)
);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  host_user_id uuid not null references users(id) on delete restrict,
  apartment_id uuid not null references apartments(id) on delete restrict,
  guest_name text not null,
  guest_phone text not null,
  visit_date date not null,
  time_slot text not null,
  status text not null check (status in ('Draft', 'Pending', 'Approved', 'Rejected', 'Used', 'Expired', 'Cancelled')),
  approved_by_user_id uuid references users(id) on delete set null,
  approved_at timestamptz,
  rejected_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gate_logs (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  invitation_id uuid references invitations(id) on delete set null,
  apartment_id uuid not null references apartments(id) on delete restrict,
  resident_user_id uuid references users(id) on delete set null,
  visitor_name text not null,
  visitor_phone text not null,
  purpose text not null,
  entry_status text not null check (entry_status in ('Pending', 'Approved', 'Rejected', 'Entered', 'Exited')),
  security_user_id uuid references users(id) on delete set null,
  approved_by_user_id uuid references users(id) on delete set null,
  entry_at timestamptz,
  exit_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (exit_at is null or entry_at is null or exit_at >= entry_at)
);

create table amenities (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  name text not null,
  category text not null,
  requires_approval boolean not null default true,
  status text not null check (status in ('Active', 'Inactive')),
  capacity integer check (capacity is null or capacity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (society_id, name)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  amenity_id uuid not null references amenities(id) on delete restrict,
  requester_user_id uuid not null references users(id) on delete restrict,
  apartment_id uuid not null references apartments(id) on delete restrict,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null check (status in ('Draft', 'Pending', 'Approved', 'Rejected', 'Confirmed', 'Completed', 'Cancelled', 'NoShow')),
  approved_by_user_id uuid references users(id) on delete set null,
  rejection_reason text,
  cancellation_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table notices (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  title text not null,
  body text not null,
  audience text not null check (audience in ('AllResidents', 'Tower', 'Custom')),
  tower_scope_id uuid references towers(id) on delete set null,
  custom_audience jsonb,
  status text not null check (status in ('Draft', 'Scheduled', 'Published', 'Expired', 'Archived')),
  publish_at timestamptz,
  published_at timestamptz,
  author_user_id uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table market_items (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  seller_user_id uuid not null references users(id) on delete restrict,
  title text not null,
  description text not null,
  category text not null,
  price numeric(12,2) not null check (price >= 0),
  quantity integer not null check (quantity >= 0),
  status text not null check (status in ('Draft', 'PendingApproval', 'Approved', 'Rejected', 'Active', 'Inactive', 'Archived')),
  approved_by_user_id uuid references users(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table notification_events (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table auth_refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  replaced_by_token_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  actor_user_id uuid references users(id) on delete set null,
  module text not null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_users_society_role_status on users (society_id, role, status);
create index idx_apartments_society_occupancy on apartments (society_id, occupancy_status);
create index idx_gate_logs_society_status_created on gate_logs (society_id, entry_status, created_at desc);
create index idx_invitations_society_status_date on invitations (society_id, status, visit_date);
create index idx_bookings_society_status_date on bookings (society_id, status, booking_date);
create index idx_notices_society_status_publish on notices (society_id, status, publish_at);
create index idx_market_society_status_created on market_items (society_id, status, created_at desc);
create index idx_notifications_user_unread on notification_events (user_id, is_read, created_at desc);
create index idx_refresh_tokens_user_active on auth_refresh_tokens (user_id, expires_at desc);
create index idx_audit_society_module_created on audit_logs (society_id, module, created_at desc);
