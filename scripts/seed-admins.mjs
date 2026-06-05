// Crea las cuentas admin de DUTI con contraseña, usando la service_role key.
// Requiere que el setup.sql ya esté aplicado (tablas + trigger handle_new_user,
// que auto-promueve a admin los emails de la tabla admin_emails).
//
// Uso:  node scripts/seed-admins.mjs
// Lee NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY del entorno (.env).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Carga simple de .env
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Elcoturcenturion";
const ADMINS = [
  { email: "eagradnik@gmail.com", nombre: "Eze Agradnik" },
  { email: "maxisetton@gmail.com", nombre: "Maxi Setton" },
  { email: "maxiglusman@gmail.com", nombre: "Maxi Glusman" },
];

for (const a of ADMINS) {
  const { data, error } = await admin.auth.admin.createUser({
    email: a.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { nombre: a.nombre },
  });

  if (error) {
    if (/already.*registered|exists/i.test(error.message)) {
      console.log(`• ${a.email} ya existía`);
    } else {
      console.error(`✗ ${a.email}: ${error.message}`);
      continue;
    }
  } else {
    console.log(`✓ ${a.email} creado (${data.user?.id})`);
  }
}

// Asegura rol admin para todos los emails de la lista (por si ya existían)
const { error: upErr } = await admin
  .from("profiles")
  .update({ rol: "admin" })
  .in(
    "id",
    (
      await admin.auth.admin.listUsers()
    ).data.users
      .filter((u) => ADMINS.some((a) => a.email === u.email))
      .map((u) => u.id)
  );
if (upErr) console.error("update rol:", upErr.message);
else console.log("✓ Roles admin asegurados");

console.log("\nListo. Contraseña de las 3 cuentas:", PASSWORD);
