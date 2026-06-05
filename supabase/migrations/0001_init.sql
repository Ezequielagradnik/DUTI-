-- ============================================================
-- DUTI — Initial schema
-- Pedidos de comida con verificación de comprobantes por IA
-- ============================================================

-- Extensions ---------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------
do $$ begin
  create type rol_usuario as enum ('cliente', 'local', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_pedido as enum (
    'pendiente_pago',   -- esperando comprobante
    'verificando',      -- comprobante en análisis IA (n8n)
    'confirmado',       -- pago válido
    'sospechoso',       -- IA detectó algo raro -> revisión manual
    'rechazado',        -- comprobante falso / monto incorrecto
    'en_preparacion',   -- la cocina lo está haciendo
    'listo',            -- listo para retirar
    'retirado'          -- entregado
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type revision_estado as enum ('revisado', 'rechazado', 'comprobado');
exception when duplicate_object then null; end $$;

-- Utility: updated_at trigger ----------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ============================================================
-- profiles  (extiende auth.users)
-- ============================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text,
  telefono    text,
  rol         rol_usuario not null default 'cliente',
  local_id    uuid,                     -- si rol = 'local'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- locales
-- ============================================================
create table if not exists locales (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  slug                text not null unique,
  logo_url            text,
  portada_url         text,
  descripcion         text,
  categoria           text not null default 'Otros',
  tiempo_estimado_min int  not null default 20,
  alias_cobro         text,
  activo              boolean not null default true,
  horario_apertura    time,
  horario_cierre      time,
  comision_pct        numeric(5,2) not null default 10.00,  -- comisión de la plataforma
  owner_id            uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_locales_activo on locales(activo);
create index if not exists idx_locales_slug on locales(slug);

-- FK de profiles.local_id (después de crear locales)
alter table profiles
  drop constraint if exists profiles_local_id_fkey,
  add constraint profiles_local_id_fkey
  foreign key (local_id) references locales(id) on delete set null;

-- ============================================================
-- platos
-- ============================================================
create table if not exists platos (
  id          uuid primary key default gen_random_uuid(),
  local_id    uuid not null references locales(id) on delete cascade,
  nombre      text not null,
  descripcion text,
  precio      numeric(10,2) not null check (precio >= 0),
  foto_url    text,
  categoria   text,
  disponible  boolean not null default true,
  orden       int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_platos_local on platos(local_id);
create index if not exists idx_platos_disponible on platos(local_id, disponible);

-- ============================================================
-- slots  (franjas horarias de retiro por local)
-- ============================================================
create table if not exists slots (
  id            uuid primary key default gen_random_uuid(),
  local_id      uuid not null references locales(id) on delete cascade,
  hora          time not null,
  capacidad_max int  not null default 8 check (capacidad_max > 0),
  activo        boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (local_id, hora)
);
create index if not exists idx_slots_local on slots(local_id);

-- ============================================================
-- pedidos
-- ============================================================
create table if not exists pedidos (
  id                uuid primary key default gen_random_uuid(),
  local_id          uuid not null references locales(id) on delete restrict,
  usuario_id        uuid references auth.users(id) on delete set null, -- null = guest
  items             jsonb not null,            -- [{plato_id, nombre, precio, cantidad}]
  subtotal          numeric(10,2) not null,
  total             numeric(10,2) not null,    -- subtotal + centavos únicos por pedido
  horario_retiro    text not null,             -- "13:00"
  estado            estado_pedido not null default 'pendiente_pago',
  estado_revision   revision_estado,           -- revisión manual del local/admin
  comprobante_base64 text,                     -- imagen del comprobante en base64
  verificacion      jsonb,                     -- resultado de la IA (n8n)
  nombre_cliente    text,
  telefono_cliente  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_pedidos_local on pedidos(local_id);
create index if not exists idx_pedidos_usuario on pedidos(usuario_id);
create index if not exists idx_pedidos_estado on pedidos(estado);
create index if not exists idx_pedidos_created on pedidos(created_at desc);

-- updated_at triggers ------------------------------------------
drop trigger if exists trg_locales_updated on locales;
create trigger trg_locales_updated before update on locales
  for each row execute function set_updated_at();

drop trigger if exists trg_platos_updated on platos;
create trigger trg_platos_updated before update on platos
  for each row execute function set_updated_at();

drop trigger if exists trg_pedidos_updated on pedidos;
create trigger trg_pedidos_updated before update on pedidos
  for each row execute function set_updated_at();

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- Auto-crear profile al registrarse ----------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data->>'nombre')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helpers de rol -----------------------------------------------
create or replace function es_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and rol = 'admin');
$$;

create or replace function es_owner_de(_local_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from locales where id = _local_id and owner_id = auth.uid()
  ) or es_admin();
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table locales  enable row level security;
alter table platos   enable row level security;
alter table slots    enable row level security;
alter table pedidos  enable row level security;

-- profiles: cada uno ve/edita el suyo; admin ve todo
drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles for select
  using (id = auth.uid() or es_admin());
drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles for update
  using (id = auth.uid());

-- locales: lectura pública de los activos; admin/owner gestionan
drop policy if exists locales_select_public on locales;
create policy locales_select_public on locales for select
  using (activo = true or owner_id = auth.uid() or es_admin());
drop policy if exists locales_write_owner on locales;
create policy locales_write_owner on locales for all
  using (owner_id = auth.uid() or es_admin())
  with check (owner_id = auth.uid() or es_admin());

-- platos: lectura pública de disponibles; owner/admin gestionan
drop policy if exists platos_select_public on platos;
create policy platos_select_public on platos for select
  using (
    disponible = true
    or es_owner_de(local_id)
  );
drop policy if exists platos_write_owner on platos;
create policy platos_write_owner on platos for all
  using (es_owner_de(local_id))
  with check (es_owner_de(local_id));

-- slots: lectura pública; owner/admin gestionan
drop policy if exists slots_select_public on slots;
create policy slots_select_public on slots for select using (true);
drop policy if exists slots_write_owner on slots;
create policy slots_write_owner on slots for all
  using (es_owner_de(local_id))
  with check (es_owner_de(local_id));

-- pedidos:
--  - cualquiera puede crear (checkout invitado)
--  - el cliente ve los suyos
--  - el local ve los de su local; admin ve todos
--  Las actualizaciones de estado las hace el server (service_role) o el owner.
drop policy if exists pedidos_insert_any on pedidos;
create policy pedidos_insert_any on pedidos for insert
  with check (true);
drop policy if exists pedidos_select_scoped on pedidos;
create policy pedidos_select_scoped on pedidos for select
  using (
    usuario_id = auth.uid()
    or es_owner_de(local_id)
  );
drop policy if exists pedidos_update_owner on pedidos;
create policy pedidos_update_owner on pedidos for update
  using (es_owner_de(local_id));
