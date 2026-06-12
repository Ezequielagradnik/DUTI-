-- ============================================================
-- DUTI — Dirección e Instagram del local
-- ============================================================
alter table locales
  add column if not exists direccion text,
  add column if not exists instagram text;  -- handle sin @ (ej: "burgerclub.ba")
