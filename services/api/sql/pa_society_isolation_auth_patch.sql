-- PA security patch: society-level isolation + independent authentication store
-- Compatible with PostgreSQL

create table if not exists pa_auth_users (
  user_id text primary key,
  email text unique not null,
  role text not null check (role in ('resident', 'admin', 'staff')),
  society_id text not null,
  hashed_password text not null,
  status text not null default 'active' check (status in ('active', 'disabled')),
  source text not null default 'bo_sync' check (source in ('bo_sync', 'pa_seed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pa_user_society_roles (
  id bigserial primary key,
  user_id text not null references pa_auth_users(user_id) on delete cascade,
  society_id text not null,
  role text not null check (role in ('resident', 'admin', 'staff')),
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, society_id, role)
);

create index if not exists idx_pa_auth_users_society_id on pa_auth_users(society_id);
create index if not exists idx_pa_auth_users_email on pa_auth_users(lower(email));
create index if not exists idx_pa_user_society_roles_user on pa_user_society_roles(user_id, society_id);

-- Test users (for QA only)
-- Plain (never store in production):
-- 1) user_id=pa-resident-tanishq-001 password=Tanishq@123
-- 2) user_id=pa-resident-greenvalley-001 password=Green@123
insert into pa_auth_users (user_id, email, role, society_id, hashed_password, status, source)
values
  (
    'pa-resident-tanishq-001',
    'resident.tanishq@planet.app',
    'resident',
    'soc-tanishq',
    'scrypt$16384$8$1$9c41ab5ffc5eb725990ae559bb4babd7$56503d8ac8929d24b42b85aed0237ddfaf44956f1dda2b47ac92e59a3fdbc0ebba22b2b552ef695b3831e39c9b3e1dcd29726a5f0f07de3f6b6eddec4700e985',
    'active',
    'pa_seed'
  ),
  (
    'pa-resident-greenvalley-001',
    'resident.greenvalley@planet.app',
    'resident',
    'soc-green-valley',
    'scrypt$16384$8$1$ea4b9134aab8214b4d833cf31c636fe3$18b939dd1d2a29b0912caa36b72e2fef42eb6e91aab55f0712445a6e5cbd6ab316053c11c17b897158b292642ab37a45903fb5130d45a177f247dfa6ea8f3162',
    'active',
    'pa_seed'
  )
on conflict (user_id) do update
set
  email = excluded.email,
  role = excluded.role,
  society_id = excluded.society_id,
  hashed_password = excluded.hashed_password,
  status = excluded.status,
  source = excluded.source,
  updated_at = now();
