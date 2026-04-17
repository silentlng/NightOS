create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'manager', 'rp');
create type public.reservation_status as enum ('draft', 'confirmed', 'arrived', 'completed', 'cancelled', 'no_show');
create type public.sync_status as enum ('manual_only', 'pending', 'in_sync', 'stale', 'error');
create type public.vip_tier as enum ('standard', 'vip', 'vvip', 'house_priority');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'manager',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rp_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(user_id) on delete cascade,
  display_name text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  vip_tier public.vip_tier not null default 'standard',
  assigned_rp_profile_id uuid references public.rp_profiles(id) on delete set null,
  preferences jsonb not null default '{}'::jsonb,
  notes text,
  external_source text,
  source_client_id text,
  sync_status public.sync_status not null default 'pending',
  last_synced_at timestamptz,
  imported_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique nulls not distinct (external_source, source_client_id)
);

create table if not exists public.tables_club (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room text,
  capacity integer,
  sort_order integer,
  is_active boolean not null default true,
  external_source text,
  external_table_id text,
  sync_status public.sync_status not null default 'pending',
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique nulls not distinct (external_source, external_table_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date timestamptz not null,
  notes text,
  external_source text,
  external_event_id text,
  sync_status public.sync_status not null default 'pending',
  last_synced_at timestamptz,
  imported_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique nulls not distinct (external_source, external_event_id)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  table_id uuid references public.tables_club(id) on delete set null,
  rp_profile_id uuid references public.rp_profiles(id) on delete set null,
  status public.reservation_status not null default 'confirmed',
  reservation_datetime timestamptz,
  guest_count integer,
  spend_estimate numeric(12,2),
  spend_actual numeric(12,2),
  notes text,
  external_source text,
  external_booking_id text,
  sync_status public.sync_status not null default 'pending',
  last_synced_at timestamptz,
  imported_at timestamptz,
  created_from text,
  updated_from_source timestamptz,
  source_event_id text,
  source_client_id text,
  source_booking_label text,
  raw_source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique nulls not distinct (external_source, external_booking_id)
);

create table if not exists public.client_visits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  rp_profile_id uuid references public.rp_profiles(id) on delete set null,
  visit_date timestamptz not null,
  spend_amount numeric(12,2),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.creative_bridge_placeholders (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references auth.users(id) on delete set null,
  title text not null,
  brief_status text not null default 'planned',
  reservation_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists reservations_event_id_idx on public.reservations(event_id);
create index if not exists reservations_rp_profile_id_idx on public.reservations(rp_profile_id);
create index if not exists reservations_client_id_idx on public.reservations(client_id);
create index if not exists reservations_sync_status_idx on public.reservations(sync_status);
create index if not exists clients_assigned_rp_profile_id_idx on public.clients(assigned_rp_profile_id);
create index if not exists client_visits_client_id_idx on public.client_visits(client_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_rp_profiles_updated_at
before update on public.rp_profiles
for each row execute function public.set_updated_at();

create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger set_tables_club_updated_at
before update on public.tables_club
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger set_reservations_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

create trigger set_client_visits_updated_at
before update on public.client_visits
for each row execute function public.set_updated_at();

create trigger set_creative_bridge_placeholders_updated_at
before update on public.creative_bridge_placeholders
for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where user_id = auth.uid();
$$;

create or replace function public.current_rp_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.rp_profiles
  where profile_id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.rp_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.tables_club enable row level security;
alter table public.events enable row level security;
alter table public.reservations enable row level security;
alter table public.client_visits enable row level security;
alter table public.audit_logs enable row level security;
alter table public.creative_bridge_placeholders enable row level security;

create policy "profiles_select_self_or_management"
on public.profiles
for select
using (
  auth.uid() = user_id
  or public.current_app_role() in ('admin', 'manager')
);

create policy "profiles_update_self_or_admin"
on public.profiles
for update
using (
  auth.uid() = user_id
  or public.current_app_role() = 'admin'
)
with check (
  auth.uid() = user_id
  or public.current_app_role() = 'admin'
);

create policy "rp_profiles_select_scoped"
on public.rp_profiles
for select
using (
  public.current_app_role() in ('admin', 'manager')
  or profile_id = auth.uid()
);

create policy "rp_profiles_write_admin_only"
on public.rp_profiles
for all
using (
  public.current_app_role() = 'admin'
)
with check (
  public.current_app_role() = 'admin'
);

create policy "clients_select_scoped"
on public.clients
for select
using (
  public.current_app_role() in ('admin', 'manager')
  or assigned_rp_profile_id = public.current_rp_profile_id()
  or exists (
    select 1
    from public.reservations
    where reservations.client_id = clients.id
      and reservations.rp_profile_id = public.current_rp_profile_id()
  )
);

create policy "clients_write_management"
on public.clients
for all
using (
  public.current_app_role() in ('admin', 'manager')
  or assigned_rp_profile_id = public.current_rp_profile_id()
)
with check (
  public.current_app_role() in ('admin', 'manager')
  or assigned_rp_profile_id = public.current_rp_profile_id()
);

create policy "tables_club_select_all_authenticated"
on public.tables_club
for select
using (auth.uid() is not null);

create policy "tables_club_write_management"
on public.tables_club
for all
using (public.current_app_role() in ('admin', 'manager'))
with check (public.current_app_role() in ('admin', 'manager'));

create policy "events_select_all_authenticated"
on public.events
for select
using (auth.uid() is not null);

create policy "events_write_management"
on public.events
for all
using (public.current_app_role() in ('admin', 'manager'))
with check (public.current_app_role() in ('admin', 'manager'));

create policy "reservations_select_scoped"
on public.reservations
for select
using (
  public.current_app_role() in ('admin', 'manager')
  or rp_profile_id = public.current_rp_profile_id()
);

create policy "reservations_write_scoped"
on public.reservations
for all
using (
  public.current_app_role() in ('admin', 'manager')
  or rp_profile_id = public.current_rp_profile_id()
)
with check (
  public.current_app_role() in ('admin', 'manager')
  or rp_profile_id = public.current_rp_profile_id()
);

create policy "client_visits_select_scoped"
on public.client_visits
for select
using (
  public.current_app_role() in ('admin', 'manager')
  or rp_profile_id = public.current_rp_profile_id()
);

create policy "client_visits_write_scoped"
on public.client_visits
for all
using (
  public.current_app_role() in ('admin', 'manager')
  or rp_profile_id = public.current_rp_profile_id()
)
with check (
  public.current_app_role() in ('admin', 'manager')
  or rp_profile_id = public.current_rp_profile_id()
);

create policy "audit_logs_select_management"
on public.audit_logs
for select
using (public.current_app_role() in ('admin', 'manager'));

create policy "audit_logs_insert_management"
on public.audit_logs
for insert
with check (public.current_app_role() in ('admin', 'manager'));

create policy "creative_bridge_placeholders_select_management"
on public.creative_bridge_placeholders
for select
using (public.current_app_role() in ('admin', 'manager'));

create policy "creative_bridge_placeholders_write_management"
on public.creative_bridge_placeholders
for all
using (public.current_app_role() in ('admin', 'manager'))
with check (public.current_app_role() in ('admin', 'manager'));
