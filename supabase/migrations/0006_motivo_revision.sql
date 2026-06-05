-- ============================================================
-- DUTI — Motivo de la revisión manual del comprobante
-- ============================================================
alter table pedidos
  add column if not exists motivo_revision text;
