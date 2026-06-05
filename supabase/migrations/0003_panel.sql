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
