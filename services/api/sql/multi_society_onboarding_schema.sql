create extension if not exists "pgcrypto";

create type onboarding_user_role as enum ('owner', 'family', 'tenant', 'admin', 'gatekeeper');
create type onboarding_status as enum ('draft', 'submitted', 'under_review', 'approved', 'rejected');
create type onboarding_document_status as enum ('pending', 'approved', 'rejected');
create type onboarding_document_type as enum (
  'sale_deed',
  'index_2',
  'govt_id',
  'rent_agreement',
  'police_verification',
  'society_charge_receipt',
  'reference_owner_id'
);
create type notification_event_type as enum ('submission', 'approval', 'rejection');

create table societies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  city text not null,
  country text not null default 'India',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create table towers (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  name text not null check (name in ('A', 'B', 'C')),
  created_at timestamptz not null default now(),
  unique (society_id, name)
);

create table apartments (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references societies(id) on delete cascade,
  tower_id uuid not null references towers(id) on delete cascade,
  unit_number text not null,
  created_at timestamptz not null default now(),
  unique (society_id, unit_number)
);

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  role onboarding_user_role not null,
  society_id uuid not null references societies(id) on delete cascade,
  status onboarding_status not null default 'draft',
  rejection_reason text,
  created_at timestamptz not null default now(),
  unique (society_id, phone)
);

create table user_apartments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  apartment_id uuid not null references apartments(id) on delete cascade,
  role onboarding_user_role not null check (role in ('owner', 'family', 'tenant')),
  created_at timestamptz not null default now(),
  unique (user_id, apartment_id)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type onboarding_document_type not null,
  file_url text not null,
  status onboarding_document_status not null default 'pending',
  uploaded_at timestamptz not null default now()
);

create table onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  society_id uuid not null references societies(id) on delete cascade,
  apartment_id uuid not null references apartments(id) on delete cascade,
  role onboarding_user_role not null check (role in ('owner', 'family', 'tenant')),
  status onboarding_status not null default 'submitted',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  society_id uuid not null references societies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, society_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  society_id uuid not null references societies(id) on delete cascade,
  event_type notification_event_type not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index idx_towers_society on towers(society_id);
create index idx_apartments_society_tower on apartments(society_id, tower_id);
create index idx_users_society_status on users(society_id, status);
create index idx_user_apartments_apartment_role on user_apartments(apartment_id, role);
create index idx_documents_user_status on documents(user_id, status);
create index idx_requests_society_status on onboarding_requests(society_id, status);
create index idx_requests_apartment on onboarding_requests(apartment_id);
create index idx_admins_society on admins(society_id);
create index idx_notifications_user on notifications(user_id, created_at desc);
