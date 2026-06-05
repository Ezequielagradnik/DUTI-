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
