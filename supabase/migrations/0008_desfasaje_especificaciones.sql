-- ============================================================
-- DUTI — Desfasaje de precio + especificaciones del cliente
-- ============================================================
alter table pedidos
  add column if not exists desfasaje_precio int not null default 0,
  add column if not exists especificaciones text;
