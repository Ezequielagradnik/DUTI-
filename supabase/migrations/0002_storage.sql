-- ============================================================
-- Storage buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('comprobantes', 'comprobantes', false),  -- privados: comprobantes de transferencia
  ('platos',       'platos',       true),   -- públicos: fotos de platos
  ('locales',      'locales',      true)    -- públicos: logos y portadas
on conflict (id) do nothing;

-- Lectura pública de imágenes de platos y locales
drop policy if exists "public read platos" on storage.objects;
create policy "public read platos" on storage.objects for select
  using (bucket_id = 'platos');

drop policy if exists "public read locales" on storage.objects;
create policy "public read locales" on storage.objects for select
  using (bucket_id = 'locales');

-- Comprobantes: cualquiera puede subir (checkout invitado), nadie lee desde el cliente.
-- La lectura la hace el server con service_role (y n8n con service_role).
drop policy if exists "upload comprobantes" on storage.objects;
create policy "upload comprobantes" on storage.objects for insert
  with check (bucket_id = 'comprobantes');
