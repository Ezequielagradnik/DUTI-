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
  motivo_revision   text,                      -- nota/motivo de esa revisión
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
-- ============================================================
-- Storage buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('comprobantes', 'comprobantes', false),  -- privados: comprobantes de transferencia
  ('platos',       'platos',       true),   -- públicos: fotos de platos
  ('locales',      'locales',      true)    -- públicos: logos y portadas
on conflict (id) do nothing;

-- Lectura pública de imágenes de platos y locales
drop policy if exists "public read platos" on storage.objects;
create policy "public read platos" on storage.objects for select
  using (bucket_id = 'platos');

drop policy if exists "public read locales" on storage.objects;
create policy "public read locales" on storage.objects for select
  using (bucket_id = 'locales');

-- Comprobantes: cualquiera puede subir (checkout invitado), nadie lee desde el cliente.
-- La lectura la hace el server con service_role (y n8n con service_role).
drop policy if exists "upload comprobantes" on storage.objects;
create policy "upload comprobantes" on storage.objects for insert
  with check (bucket_id = 'comprobantes');
-- ============================================================
-- DUTI — Panel del local: realtime + funciones de ventas
-- ============================================================

-- Realtime: que los pedidos nuevos/actualizados lleguen en vivo al panel
do $$ begin
  alter publication supabase_realtime add table pedidos;
exception when duplicate_object then null; end $$;

-- Estados que cuentan como venta efectiva
-- (confirmado y todo lo que sigue; se excluye pendiente/verificando/sospechoso/rechazado)

-- ------------------------------------------------------------
-- resumen_ventas(local): totales hoy / semana / mes (zona AR)
-- ------------------------------------------------------------
create or replace function resumen_ventas(p_local_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  tz constant text := 'America/Argentina/Buenos_Aires';
  hoy_ini    timestamptz := (date_trunc('day',   timezone(tz, now())));
  sem_ini    timestamptz := (date_trunc('week',  timezone(tz, now())));
  mes_ini    timestamptz := (date_trunc('month', timezone(tz, now())));
  result json;
begin
  if not es_owner_de(p_local_id) then
    raise exception 'No autorizado';
  end if;

  -- Nota: hoy_ini/sem_ini/mes_ini están en hora local; created_at es timestamptz.
  -- Convertimos created_at a hora local para comparar.
  with v as (
    select total, created_at, estado,
           timezone(tz, created_at) as creado_local
    from pedidos
    where local_id = p_local_id
      and estado in ('confirmado','en_preparacion','listo','retirado')
  )
  select json_build_object(
    'ventas_hoy',     coalesce((select sum(total) from v where creado_local >= hoy_ini), 0),
    'ventas_semana',  coalesce((select sum(total) from v where creado_local >= sem_ini), 0),
    'ventas_mes',     coalesce((select sum(total) from v where creado_local >= mes_ini), 0),
    'pedidos_hoy',    (select count(*) from v where creado_local >= hoy_ini),
    'pedidos_mes',    (select count(*) from v where creado_local >= mes_ini),
    'ticket_prom_mes',
        coalesce((select avg(total) from v where creado_local >= mes_ini), 0)
  ) into result;

  return result;
end;
$$;

-- ------------------------------------------------------------
-- top_platos(local, desde): platos más vendidos desde una fecha
-- ------------------------------------------------------------
create or replace function top_platos(p_local_id uuid, p_desde timestamptz)
returns table (nombre text, cantidad bigint, total numeric)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not es_owner_de(p_local_id) then
    raise exception 'No autorizado';
  end if;

  return query
    select
      item->>'nombre' as nombre,
      sum((item->>'cantidad')::int)::bigint as cantidad,
      sum((item->>'precio')::numeric * (item->>'cantidad')::int) as total
    from pedidos p
    cross join lateral jsonb_array_elements(p.items) as item
    where p.local_id = p_local_id
      and p.estado in ('confirmado','en_preparacion','listo','retirado')
      and p.created_at >= p_desde
    group by item->>'nombre'
    order by cantidad desc
    limit 10;
end;
$$;
-- ============================================================
-- DUTI — Rol admin: emails admin, auto-promoción y métricas globales
-- ============================================================

-- Lista de emails que se promueven a admin automáticamente al registrarse
create table if not exists admin_emails (
  email text primary key
);

-- Seguridad: RLS habilitado SIN políticas -> nadie la lee desde anon/authenticated.
-- Solo la usa el trigger handle_new_user (security definer, bypassa RLS).
alter table admin_emails enable row level security;

insert into admin_emails (email) values
  ('eagradnik@gmail.com'),
  ('maxisetton@gmail.com'),
  ('maxiglusman@gmail.com')
on conflict (email) do nothing;

-- handle_new_user: crea el profile y, si el email está en admin_emails,
-- lo marca como admin.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  es_admin_email boolean;
begin
  select exists(select 1 from admin_emails where email = new.email) into es_admin_email;

  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    new.raw_user_meta_data->>'nombre',
    case when es_admin_email then 'admin'::rol_usuario else 'cliente'::rol_usuario end
  )
  on conflict (id) do update set rol = excluded.rol;

  return new;
end; $$;

-- Promueve a admin a cualquier usuario YA existente cuyo email esté en la lista
update profiles p
set rol = 'admin'
from auth.users u
where u.id = p.id
  and u.email in (select email from admin_emails)
  and p.rol <> 'admin';

-- ------------------------------------------------------------
-- resumen_plataforma(): métricas globales (solo admin)
-- ------------------------------------------------------------
create or replace function resumen_plataforma()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  tz constant text := 'America/Argentina/Buenos_Aires';
  hoy_ini timestamptz := date_trunc('day', timezone(tz, now()));
  result json;
begin
  if not es_admin() then
    raise exception 'No autorizado';
  end if;

  with v as (
    select total, timezone(tz, created_at) as creado_local, estado
    from pedidos
    where estado in ('confirmado','en_preparacion','listo','retirado')
  )
  select json_build_object(
    'ventas_total',    coalesce((select sum(total) from v), 0),
    'ventas_hoy',      coalesce((select sum(total) from v where creado_local >= hoy_ini), 0),
    'pedidos_total',   (select count(*) from v),
    'pedidos_hoy',     (select count(*) from v where creado_local >= hoy_ini),
    'locales_activos', (select count(*) from locales where activo),
    'comision_total',  coalesce((
      select sum(p.total * l.comision_pct / 100)
      from pedidos p join locales l on l.id = p.local_id
      where p.estado in ('confirmado','en_preparacion','listo','retirado')
    ), 0)
  ) into result;

  return result;
end;
$$;

-- ------------------------------------------------------------
-- ventas_por_local(): ranking de locales con ventas y comisión (solo admin)
-- ------------------------------------------------------------
create or replace function ventas_por_local()
returns table (
  local_id uuid,
  nombre text,
  slug text,
  comision_pct numeric,
  pedidos bigint,
  ventas numeric,
  comision numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not es_admin() then
    raise exception 'No autorizado';
  end if;

  return query
    select
      l.id, l.nombre, l.slug, l.comision_pct,
      count(p.id) filter (where p.estado in ('confirmado','en_preparacion','listo','retirado'))::bigint,
      coalesce(sum(p.total) filter (where p.estado in ('confirmado','en_preparacion','listo','retirado')), 0),
      coalesce(sum(p.total) filter (where p.estado in ('confirmado','en_preparacion','listo','retirado')), 0) * l.comision_pct / 100
    from locales l
    left join pedidos p on p.local_id = l.id
    group by l.id
    order by ventas desc;
end;
$$;
-- ============================================================
-- DUTI — Comprobante en base64 + estado de revisión manual
-- ============================================================

-- Estado de revisión manual del comprobante (lo setea el local/admin)
do $$ begin
  create type revision_estado as enum ('revisado', 'rechazado', 'comprobado');
exception when duplicate_object then null; end $$;

alter table pedidos
  add column if not exists comprobante_base64 text,
  add column if not exists estado_revision revision_estado;

-- Sacamos el hash y la url de storage (ahora la imagen va en base64 en la fila)
drop index if exists uq_pedidos_comprobante_hash;
alter table pedidos drop column if exists comprobante_hash;
alter table pedidos drop column if exists comprobante_url;
-- ============================================================
-- DUTI — Motivo de la revisión manual del comprobante
-- ============================================================
alter table pedidos
  add column if not exists motivo_revision text;
-- ============================================================
-- DUTI — Métricas globales con día / semana / mes (admin)
-- ============================================================
create or replace function resumen_plataforma()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  tz constant text := 'America/Argentina/Buenos_Aires';
  hoy_ini timestamptz := date_trunc('day',   timezone(tz, now()));
  sem_ini timestamptz := date_trunc('week',  timezone(tz, now()));
  mes_ini timestamptz := date_trunc('month', timezone(tz, now()));
  result json;
begin
  if not es_admin() then
    raise exception 'No autorizado';
  end if;

  with v as (
    select total, timezone(tz, created_at) as creado_local
    from pedidos
    where estado in ('confirmado','en_preparacion','listo','retirado')
  )
  select json_build_object(
    'ventas_total',    coalesce((select sum(total) from v), 0),
    'ventas_hoy',      coalesce((select sum(total) from v where creado_local >= hoy_ini), 0),
    'ventas_semana',   coalesce((select sum(total) from v where creado_local >= sem_ini), 0),
    'ventas_mes',      coalesce((select sum(total) from v where creado_local >= mes_ini), 0),
    'pedidos_total',   (select count(*) from v),
    'pedidos_hoy',     (select count(*) from v where creado_local >= hoy_ini),
    'pedidos_semana',  (select count(*) from v where creado_local >= sem_ini),
    'pedidos_mes',     (select count(*) from v where creado_local >= mes_ini),
    'locales_activos', (select count(*) from locales where activo),
    'comision_total',  coalesce((
      select sum(p.total * l.comision_pct / 100)
      from pedidos p join locales l on l.id = p.local_id
      where p.estado in ('confirmado','en_preparacion','listo','retirado')
    ), 0)
  ) into result;

  return result;
end;
$$;
-- ============================================================
-- DUTI — Seed data (locales y platos de demo)
-- Idempotente: se puede correr varias veces.
-- ============================================================

insert into locales (id, nombre, slug, portada_url, descripcion, categoria, tiempo_estimado_min, alias_cobro, activo, horario_apertura, horario_cierre)
values
  ('11111111-1111-1111-1111-111111111111', 'Burger Club',  'burger-club',  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80', 'Smash burgers, papas rústicas y cerveza artesanal.', 'Hamburguesas', 20, 'burger.club.mp',  true, '11:00', '23:30'),
  ('22222222-2222-2222-2222-222222222222', 'Sakura Sushi', 'sakura-sushi', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80', 'Rolls, niguiris y combinados frescos del día.',       'Sushi',        30, 'sakura.sushi.ar', true, '12:00', '23:00'),
  ('33333333-3333-3333-3333-333333333333', 'Verde Bowl',   'verde-bowl',   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80', 'Bowls, ensaladas y jugos prensados en frío.',        'Saludable',    15, 'verde.bowl',      true, '09:00', '20:00'),
  ('44444444-4444-4444-4444-444444444444', 'Nápoli Pizza', 'napoli-pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', 'Pizza a la piedra, masa madre, horno de leña.',      'Pizza',        25, 'napoli.pizza.mp', true, '19:00', '23:59')
on conflict (id) do update set
  nombre = excluded.nombre, portada_url = excluded.portada_url, descripcion = excluded.descripcion,
  categoria = excluded.categoria, tiempo_estimado_min = excluded.tiempo_estimado_min, alias_cobro = excluded.alias_cobro;

insert into platos (id, local_id, nombre, descripcion, precio, foto_url, categoria, disponible) values
  ('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Smash Doble',          'Dos medallones, cheddar, cebolla caramelizada y salsa de la casa.', 8900, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80', 'Hamburguesas',   true),
  ('a1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Cheeseburger Clásica', 'Medallón simple, cheddar, lechuga, tomate y pickles.',              6500, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80', 'Hamburguesas',   true),
  ('a1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Papas Rústicas',       'Con cheddar y panceta crocante.',                                   4200, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80', 'Acompañamientos', true),
  ('a2000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Combinado 30 piezas',  'Variedad de rolls, niguiris y sashimi.',                           15400, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80', 'Combinados',     true),
  ('a2000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Philadelphia Roll x8', 'Salmón, queso crema y palta.',                                      7800, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80', 'Rolls',          true),
  ('a3000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Bowl Poke Salmón',     'Base de arroz, salmón, palta, edamame y mango.',                    9200, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', 'Bowls',          true),
  ('a3000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Jugo Detox Verde',     'Manzana, apio, jengibre y limón.',                                  3500, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80', 'Bebidas',        true),
  ('a4000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Pizza Margherita',     'Salsa de tomate, mozzarella fior di latte y albahaca.',             8700, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80', 'Pizzas',         true),
  ('a4000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'Pizza Pepperoni',      'Doble pepperoni y mozzarella.',                                     9900, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80', 'Pizzas',         true)
on conflict (id) do update set
  nombre = excluded.nombre, descripcion = excluded.descripcion, precio = excluded.precio, foto_url = excluded.foto_url;

-- Slots de retiro por local
insert into slots (local_id, hora, capacidad_max)
select l.id, h.hora::time, 8
from locales l
cross join (values ('12:30'),('12:45'),('13:00'),('13:15'),('13:30'),('20:00'),('20:30'),('21:00')) as h(hora)
on conflict (local_id, hora) do nothing;
