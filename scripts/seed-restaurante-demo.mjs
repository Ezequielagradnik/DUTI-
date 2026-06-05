// Crea una cuenta de restaurante demo vinculada a un local existente.
// Uso: node scripts/seed-restaurante-demo.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, key, { auth: { persistSession: false } });

const EMAIL = "napoli@duti.app";
const PASSWORD = "Elcoturcenturion";
const SLUG = "napoli-pizza"; // local con pedidos para el demo

// 1) Local
const { data: local } = await admin.from("locales").select("id, nombre").eq("slug", SLUG).maybeSingle();
if (!local) {
  console.error(`No existe el local '${SLUG}'. Corré el seed primero.`);
  process.exit(1);
}

// 2) Usuario
const { data: created, error: uErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
  user_metadata: { nombre: local.nombre },
});
let userId = created?.user?.id;
if (uErr) {
  if (/already|exists|registered/i.test(uErr.message)) {
    const { data: list } = await admin.auth.admin.listUsers();
    userId = list.users.find((u) => u.email === EMAIL)?.id;
    console.log(`• ${EMAIL} ya existía`);
  } else {
    console.error("error:", uErr.message);
    process.exit(1);
  }
} else {
  console.log(`✓ ${EMAIL} creado`);
}

// 3) Vincular como dueño del local
await admin.from("profiles").update({ rol: "local", local_id: local.id, nombre: local.nombre }).eq("id", userId);
await admin.from("locales").update({ owner_id: userId }).eq("id", local.id);

console.log(`\n✓ Restaurante demo listo:`);
console.log(`  Local: ${local.nombre} (${SLUG})`);
console.log(`  Email: ${EMAIL}`);
console.log(`  Pass:  ${PASSWORD}`);
console.log(`  Entrá por /admin-local/login o /login`);
