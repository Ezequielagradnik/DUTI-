-- ============================================================
-- Vincular tu usuario a un local (para entrar al panel)
-- ============================================================
-- 1) Primero creá tu cuenta desde /admin-local/login -> "Crear cuenta"
--    (o desde Supabase Dashboard -> Authentication -> Add user).
-- 2) Reemplazá el email y el slug del local de abajo.
-- 3) Corré esto en el SQL Editor.
-- ============================================================

-- Marca tu perfil como dueño del local
update profiles p
set rol = 'local',
    local_id = l.id
from locales l
where p.id = (select id from auth.users where email = 'TU_EMAIL@ejemplo.com')
  and l.slug = 'burger-club';

-- Asigna el owner del local (para las políticas de seguridad)
update locales
set owner_id = (select id from auth.users where email = 'TU_EMAIL@ejemplo.com')
where slug = 'burger-club';

-- Verificación
select p.rol, p.local_id, l.nombre
from profiles p join locales l on l.id = p.local_id
where p.id = (select id from auth.users where email = 'TU_EMAIL@ejemplo.com');
