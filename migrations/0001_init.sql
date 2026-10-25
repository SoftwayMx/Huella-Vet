-- ============================================================================
-- Huella Vet — Migración inicial
-- Tablas, restricciones, restricción de exclusión anti-traslape y RLS.
-- Zona horaria de la clínica: America/Mexico_City. Fechas/horas en timestamptz (UTC).
-- ============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist"; -- restricción de exclusión (uuid = , rango &&)

-- ---------------------------------------------------------------------------
-- Servicios (sin duración: toda cita ocupa un bloque fijo de 30 minutos)
-- ---------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price numeric(10, 2) not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Veterinarios
-- ---------------------------------------------------------------------------
create table public.veterinarians (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Horarios laborales. day_of_week: 0=domingo .. 6=sábado (igual que Date.getDay()).
-- La ausencia de fila para un día = día de descanso recurrente.
create table public.vet_schedules (
  id uuid primary key default gen_random_uuid(),
  veterinarian_id uuid not null references public.veterinarians(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  check (start_time < end_time),
  unique (veterinarian_id, day_of_week)
);

-- Días de descanso puntuales (fechas concretas) por veterinario.
create table public.vet_days_off (
  id uuid primary key default gen_random_uuid(),
  veterinarian_id uuid not null references public.veterinarians(id) on delete cascade,
  date date not null,
  reason text,
  unique (veterinarian_id, date)
);

-- Bloqueos de fechas de la clínica (vacaciones / festivos). start_time null = todo el día.
create table public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time,
  end_time time,
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (start_time is null or end_time is not null),
  check (start_time is null or start_time < end_time)
);

-- ---------------------------------------------------------------------------
-- Clientes (dueños) y mascotas
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);
create index clients_phone_idx on public.clients (phone);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  age text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Citas (bloque fijo de 30 minutos)
-- ---------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  pet_id uuid not null references public.pets(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  veterinarian_id uuid not null references public.veterinarians(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_asistio')),
  reason text,
  consent boolean not null,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (consent = true),
  check (end_at = start_at + interval '30 minutes')
);

create index appointments_start_idx on public.appointments (start_at);
create index appointments_vet_idx on public.appointments (veterinarian_id, start_at);

-- Restricción anti-traslape: impide dos citas que se traslapen para el mismo veterinario,
-- incluso si falla la validación en el servidor. 'cancelada' libera el bloque.
alter table public.appointments add constraint appointments_no_overlap
  exclude using gist (
    veterinarian_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (status <> 'cancelada');

-- ---------------------------------------------------------------------------
-- Personal (vincula Supabase Auth con un rol)
-- ---------------------------------------------------------------------------
create table public.staff (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('admin', 'recepcion')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Límite de peticiones para endpoints públicos (sin servicios externos)
-- ---------------------------------------------------------------------------
create table public.rate_limits (
  key text not null,
  endpoint text not null,
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, endpoint, window_start)
);

-- Incrementa el contador de forma atómica y devuelve true si aún está permitido.
create or replace function public.rate_limit_hit(
  p_key text, p_endpoint text, p_window_start timestamptz, p_max integer
) returns boolean
language plpgsql
as $$
declare c integer;
begin
  insert into public.rate_limits (key, endpoint, window_start, count)
  values (p_key, p_endpoint, p_window_start, 1)
  on conflict (key, endpoint, window_start)
  do update set count = public.rate_limits.count + 1
  returning count into c;
  return c <= p_max;
end;
$$;

-- ============================================================================
-- Row Level Security
-- anónimo: sin acceso a ninguna tabla (solo vía endpoints del servidor).
-- personal autenticado: lectura del catálogo; escritura según rol.
-- ============================================================================
alter table public.services enable row level security;
alter table public.veterinarians enable row level security;
alter table public.vet_schedules enable row level security;
alter table public.vet_days_off enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.clients enable row level security;
alter table public.pets enable row level security;
alter table public.appointments enable row level security;
alter table public.staff enable row level security;
alter table public.rate_limits enable row level security; -- sin políticas: solo service-role

-- staff: cada usuario lee su propia fila (para resolver su rol).
create policy staff_select_own on public.staff
  for select to authenticated using (id = auth.uid());

-- Catálogos administrables: staff lee, admin escribe.
create policy services_select on public.services
  for select to authenticated using (exists (select 1 from public.staff where id = auth.uid()));
create policy services_admin_write on public.services
  for all to authenticated
  using (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'));

create policy veterinarians_select on public.veterinarians
  for select to authenticated using (exists (select 1 from public.staff where id = auth.uid()));
create policy veterinarians_admin_write on public.veterinarians
  for all to authenticated
  using (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'));

create policy vet_schedules_select on public.vet_schedules
  for select to authenticated using (exists (select 1 from public.staff where id = auth.uid()));
create policy vet_schedules_admin_write on public.vet_schedules
  for all to authenticated
  using (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'));

create policy vet_days_off_select on public.vet_days_off
  for select to authenticated using (exists (select 1 from public.staff where id = auth.uid()));
create policy vet_days_off_admin_write on public.vet_days_off
  for all to authenticated
  using (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'));

create policy blocked_dates_select on public.blocked_dates
  for select to authenticated using (exists (select 1 from public.staff where id = auth.uid()));
create policy blocked_dates_admin_write on public.blocked_dates
  for all to authenticated
  using (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.staff where id = auth.uid() and role = 'admin'));

-- Clientes y mascotas: staff lee y escribe (sin borrado).
create policy clients_select on public.clients
  for select to authenticated using (exists (select 1 from public.staff where id = auth.uid()));
create policy clients_insert on public.clients
  for insert to authenticated with check (exists (select 1 from public.staff where id = auth.uid()));
create policy clients_update on public.clients
  for update to authenticated
  using (exists (select 1 from public.staff where id = auth.uid()))
  with check (exists (select 1 from public.staff where id = auth.uid()));

create policy pets_select on public.pets
  for select to authenticated using (exists (select 1 from public.staff where id = auth.uid()));
create policy pets_insert on public.pets
  for insert to authenticated with check (exists (select 1 from public.staff where id = auth.uid()));
create policy pets_update on public.pets
  for update to authenticated
  using (exists (select 1 from public.staff where id = auth.uid()))
  with check (exists (select 1 from public.staff where id = auth.uid()));

-- Citas: staff lee y escribe (estados, no borrado físico).
create policy appointments_select on public.appointments
  for select to authenticated using (exists (select 1 from public.staff where id = auth.uid()));
create policy appointments_insert on public.appointments
  for insert to authenticated with check (exists (select 1 from public.staff where id = auth.uid()));
create policy appointments_update on public.appointments
  for update to authenticated
  using (exists (select 1 from public.staff where id = auth.uid()))
  with check (exists (select 1 from public.staff where id = auth.uid()));
