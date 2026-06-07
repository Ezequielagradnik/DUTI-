-- ============================================================
-- DUTI — Zona y rango de precio en locales (para filtros)
-- ============================================================
alter table locales
  add column if not exists zona text,
  add column if not exists rango_precio smallint not null default 2; -- 1=$, 2=$$, 3=$$$

-- Datos de los locales demo
update locales set zona = 'Palermo',  rango_precio = 2 where slug = 'burger-club';
update locales set zona = 'Belgrano', rango_precio = 3 where slug = 'sakura-sushi';
update locales set zona = 'Palermo',  rango_precio = 2 where slug = 'verde-bowl';
update locales set zona = 'Caballito', rango_precio = 2 where slug = 'napoli-pizza';
