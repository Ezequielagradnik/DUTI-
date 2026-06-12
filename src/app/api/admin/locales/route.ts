import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const SLOTS_DEFAULT = ["12:30", "12:45", "13:00", "13:15", "13:30", "20:00", "20:30", "21:00"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  // Solo admins
  const session = await getSession();
  if (!session || session.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const {
    nombre,
    categoria,
    zona,
    direccion,
    instagram,
    rango_precio,
    descripcion,
    alias_cobro,
    tiempo_estimado_min,
    comision_pct,
    owner_email,
    owner_password,
  } = body;

  if (!nombre || !owner_email || !owner_password) {
    return NextResponse.json(
      { error: "Faltan nombre del local, email o contraseña del dueño." },
      { status: 400 }
    );
  }
  if (String(owner_password).length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const slug = slugify(body.slug || nombre);

  // 1) Crear el local
  const { data: local, error: locErr } = await admin
    .from("locales")
    .insert({
      nombre,
      slug,
      categoria: categoria || "Otros",
      zona: zona || null,
      direccion: direccion || null,
      instagram: instagram ? String(instagram).replace(/^@/, "") : null,
      rango_precio: Number(rango_precio) || 2,
      descripcion: descripcion || null,
      alias_cobro: alias_cobro || null,
      tiempo_estimado_min: Number(tiempo_estimado_min) || 20,
      comision_pct: comision_pct != null ? Number(comision_pct) : 10,
      activo: true,
    })
    .select("id")
    .single();
  if (locErr) {
    const msg = /duplicate key/.test(locErr.message)
      ? "Ya existe un local con ese nombre/slug."
      : locErr.message;
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  // 2) Crear la cuenta de login del restaurante
  const { data: created, error: userErr } = await admin.auth.admin.createUser({
    email: owner_email,
    password: owner_password,
    email_confirm: true,
    user_metadata: { nombre },
  });
  if (userErr || !created.user) {
    // rollback del local
    await admin.from("locales").delete().eq("id", local.id);
    return NextResponse.json(
      { error: `No se pudo crear el usuario: ${userErr?.message}` },
      { status: 409 }
    );
  }
  const ownerId = created.user.id;

  // 3) Vincular: profile rol=local + local_id, y owner del local
  await admin
    .from("profiles")
    .update({ rol: "local", local_id: local.id, nombre })
    .eq("id", ownerId);
  await admin.from("locales").update({ owner_id: ownerId }).eq("id", local.id);

  // 4) Slots por defecto
  await admin.from("slots").insert(
    SLOTS_DEFAULT.map((hora) => ({ local_id: local.id, hora, capacidad_max: 8 }))
  );

  return NextResponse.json({ ok: true, local_id: local.id, slug, owner_id: ownerId });
}
