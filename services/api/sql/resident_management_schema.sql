-- Resident Management System schema
-- Focused on Gatekeeper + Resident approvals + Backoffice monitoring

create extension if not exists "pgcrypto";

create type rms_user_role as enum ('resident', 'admin', 'security', 'gatekeeper');
create type rms_user_status as enum ('active', 'inactive', 'blocked');
create type rms_user_apartment_role as enum ('owner', 'tenant');
create type rms_visitor_type as enum ('delivery', 'cab', 'service', 'guest');
create type rms_overall_status as enum (
  'pending',
  'partial_approved',
  'approved',
  'rejected',
  'completed',
  'expired'
);
create type rms_entry_apartment_status as enum ('pending', 'approved', 'rejected', 'expired');
create type rms_gate_log_status as enum ('checked_in', 'checked_out');
create type rms_notification_type as enum ('approval_request', 'update');
create type rms_notification_status as enum ('sent', 'read', 'actioned');

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  role rms_user_role not null,
  status rms_user_status not null default 'active',
  created_at timestamptz not null default now()
);

create table apartments (
  id uuid primary key default gen_random_uuid(),
  tower text not null,
  unit_number text not null,
  unique (tower, unit_number)
);

create table user_apartments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  apartment_id uuid not null references apartments(id) on delete cascade,
  role rms_user_apartment_role not null,
  unique (user_id, apartment_id)
);

create table visitor_entries (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references users(id) on delete restrict,
  visitor_name text not null,
  visitor_phone text not null,
  visitor_type rms_visitor_type not null,
  vehicle_number text,
  vehicle_photo_url text,
  visitor_photo_url text,
  visitor_count integer not null default 1 check (visitor_count > 0),
  overall_status rms_overall_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table entry_apartments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references visitor_entries(id) on delete cascade,
  apartment_id uuid not null references apartments(id) on delete restrict,
  status rms_entry_apartment_status not null default 'pending',
  responded_by uuid references users(id) on delete set null,
  responded_at timestamptz,
  unique (entry_id, apartment_id)
);

create table gate_logs (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null unique references visitor_entries(id) on delete cascade,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status rms_gate_log_status,
  check (
    check_out_time is null
    or check_in_time is null
    or check_out_time >= check_in_time
  )
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  entry_id uuid not null references visitor_entries(id) on delete cascade,
  type rms_notification_type not null,
  status rms_notification_status not null default 'sent'
);

create index idx_entry_apartments_entry_id on entry_apartments(entry_id);
create index idx_entry_apartments_apartment_id on entry_apartments(apartment_id);
create index idx_entry_apartments_status on entry_apartments(status);
create index idx_visitor_entries_status_created_at on visitor_entries(overall_status, created_at desc);
create index idx_gate_logs_entry_id on gate_logs(entry_id);
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_entry_id on notifications(entry_id);
