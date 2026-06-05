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
