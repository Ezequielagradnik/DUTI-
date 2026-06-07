-- ============================================================
-- DUTI — estado_revision como texto libre + sync automático del estado
-- ============================================================

-- 1) estado_revision pasa a texto (n8n usa su propio vocabulario: aprobado/revisar)
alter table pedidos
  alter column estado_revision type text using estado_revision::text;

-- 2) Trigger: deriva el `estado` (ciclo del pedido) según la revisión.
--    Así n8n solo escribe estado_revision y el pedido se confirma/marca solo.
create or replace function sync_estado_por_revision()
returns trigger language plpgsql as $$
begin
  if new.estado_revision is distinct from old.estado_revision
     and new.estado_revision is not null then
    case lower(new.estado_revision)
      when 'aprobado'   then new.estado := 'confirmado';
      when 'comprobado' then new.estado := 'confirmado';
      when 'revisar'    then new.estado := 'sospechoso';
      when 'rechazado'  then new.estado := 'rechazado';
      else null; -- 'revisado' u otros: no cambia el estado
    end case;
  end if;
  return new;
end; $$;

drop trigger if exists trg_sync_estado_revision on pedidos;
create trigger trg_sync_estado_revision before update on pedidos
  for each row execute function sync_estado_por_revision();
