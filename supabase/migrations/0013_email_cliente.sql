-- ============================================================
-- DUTI — Email del cliente (confirmación + aviso de pedido listo)
-- ============================================================
alter table pedidos
  add column if not exists email_cliente text;
