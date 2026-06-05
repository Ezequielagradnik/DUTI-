import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el comprobante." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Traer el pedido
  const { data: pedido, error: pErr } = await admin
    .from("pedidos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (pErr || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");

  // Anti-reuso: ¿ya existe ese comprobante en otro pedido?
  const { data: dup } = await admin
    .from("pedidos")
    .select("id")
    .eq("comprobante_hash", hash)
    .neq("id", id)
    .maybeSingle();
  if (dup) {
    return NextResponse.json(
      { error: "Este comprobante ya fue usado en otro pedido." },
      { status: 409 }
    );
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${id}/${hash.slice(0, 16)}.${ext}`;

  const { error: upErr } = await admin.storage
    .from("comprobantes")
    .upload(path, bytes, { contentType: file.type || "image/jpeg", upsert: true });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  // URL firmada (privada) para que la IA pueda leerla
  const { data: signed } = await admin.storage
    .from("comprobantes")
    .createSignedUrl(path, 60 * 30);

  const { error: updErr } = await admin
    .from("pedidos")
    .update({
      comprobante_url: path,
      comprobante_hash: hash,
      estado: "verificando",
    })
    .eq("id", id);
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  // Disparar verificación en n8n (si está configurado)
  const webhook = process.env.N8N_WEBHOOK_URL;
  if (webhook) {
    const { data: local } = await admin
      .from("locales")
      .select("nombre, alias_cobro")
      .eq("id", pedido.local_id)
      .maybeSingle();

    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pedido_id: id,
        comprobante_url: signed?.signedUrl,
        monto_esperado: Number(pedido.total),
        alias_esperado: local?.alias_cobro,
        local: local?.nombre,
        creado_en: pedido.created_at,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/pedidos/${id}/verificacion`,
      }),
    }).catch(() => {
      /* n8n no disponible: queda en 'verificando' para revisión manual */
    });
  }

  return NextResponse.json({ ok: true, estado: "verificando" });
}
