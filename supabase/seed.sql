-- ============================================================
-- DUTI — Seed data (locales y platos de demo)
-- Idempotente: se puede correr varias veces.
-- ============================================================

insert into locales (id, nombre, slug, portada_url, descripcion, categoria, zona, rango_precio, tiempo_estimado_min, alias_cobro, activo, horario_apertura, horario_cierre)
values
  ('11111111-1111-1111-1111-111111111111', 'Burger Club',  'burger-club',  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80', 'Smash burgers, papas rústicas y cerveza artesanal.', 'Hamburguesas', 'Palermo',  2, 20, 'burger.club.mp',  true, '11:00', '23:30'),
  ('22222222-2222-2222-2222-222222222222', 'Sakura Sushi', 'sakura-sushi', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80', 'Rolls, niguiris y combinados frescos del día.',       'Sushi',        'Belgrano', 3, 30, 'sakura.sushi.ar', true, '12:00', '23:00'),
  ('33333333-3333-3333-3333-333333333333', 'Verde Bowl',   'verde-bowl',   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80', 'Bowls, ensaladas y jugos prensados en frío.',        'Saludable',    'Palermo',  2, 15, 'verde.bowl',      true, '09:00', '20:00'),
  ('44444444-4444-4444-4444-444444444444', 'Nápoli Pizza', 'napoli-pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', 'Pizza a la piedra, masa madre, horno de leña.',      'Pizza',        'Caballito', 2, 25, 'napoli.pizza.mp', true, '19:00', '23:59')
on conflict (id) do update set
  nombre = excluded.nombre, portada_url = excluded.portada_url, descripcion = excluded.descripcion,
  categoria = excluded.categoria, zona = excluded.zona, rango_precio = excluded.rango_precio,
  tiempo_estimado_min = excluded.tiempo_estimado_min, alias_cobro = excluded.alias_cobro;

insert into platos (id, local_id, nombre, descripcion, precio, foto_url, categoria, disponible) values
  ('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Smash Doble',          'Dos medallones, cheddar, cebolla caramelizada y salsa de la casa.', 8900, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80', 'Hamburguesas',   true),
  ('a1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Cheeseburger Clásica', 'Medallón simple, cheddar, lechuga, tomate y pickles.',              6500, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80', 'Hamburguesas',   true),
  ('a1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Papas Rústicas',       'Con cheddar y panceta crocante.',                                   4200, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80', 'Acompañamientos', true),
  ('a2000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Combinado 30 piezas',  'Variedad de rolls, niguiris y sashimi.',                           15400, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80', 'Combinados',     true),
  ('a2000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Philadelphia Roll x8', 'Salmón, queso crema y palta.',                                      7800, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80', 'Rolls',          true),
  ('a3000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Bowl Poke Salmón',     'Base de arroz, salmón, palta, edamame y mango.',                    9200, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', 'Bowls',          true),
  ('a3000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Jugo Detox Verde',     'Manzana, apio, jengibre y limón.',                                  3500, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80', 'Bebidas',        true),
  ('a4000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Pizza Margherita',     'Salsa de tomate, mozzarella fior di latte y albahaca.',             8700, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80', 'Pizzas',         true),
  ('a4000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'Pizza Pepperoni',      'Doble pepperoni y mozzarella.',                                     9900, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80', 'Pizzas',         true)
on conflict (id) do update set
  nombre = excluded.nombre, descripcion = excluded.descripcion, precio = excluded.precio, foto_url = excluded.foto_url;

-- Slots de retiro por local
insert into slots (local_id, hora, capacidad_max)
select l.id, h.hora::time, 8
from locales l
cross join (values ('12:30'),('12:45'),('13:00'),('13:15'),('13:30'),('20:00'),('20:30'),('21:00')) as h(hora)
on conflict (local_id, hora) do nothing;
