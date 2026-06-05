-- ============================================================
-- DUTI — UPDATE incremental (corré SOLO esto, no el setup completo)
-- Idempotente: seguro de correr aunque ya tengas parte aplicada.
-- ============================================================

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
