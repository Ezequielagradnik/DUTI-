-- ============================================================
-- DUTI — Alias del cliente (el que usa para transferir)
-- Permite comparar el alias de ORIGEN del comprobante contra
-- lo que declaró el cliente (más confiable que el nombre).
-- ============================================================
alter table pedidos
  add column if not exists alias_cliente text;
