-- ============================================================
-- DUTI — Registro de nº de operación (dedup de comprobantes para n8n)
-- ============================================================
create table if not exists operaciones (
  numero      text primary key,          -- nº de operación extraído del comprobante por la IA
  pedido_id   uuid references pedidos(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Cerrada al cliente: solo la usa n8n / el server con service_role (bypassa RLS).
alter table operaciones enable row level security;
