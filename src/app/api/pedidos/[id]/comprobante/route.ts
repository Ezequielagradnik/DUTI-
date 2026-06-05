import { NextResponse } from "next/server";
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

  // Límite razonable para guardar en la fila (base64 infla ~33%)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "La imagen es muy grande (máx 5MB)." },
      { status: 413 }
    );
  }

  const admin = createAdminClient();

  const { data: pedido, error: pErr } = await admin
    .from("pedidos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (pErr || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  // Imagen -> data URL en base64
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  const dataUrl = `data:${mime};base64,${bytes.toString("base64")}`;

  const { error: updErr } = await admin
    .from("pedidos")
    .update({
      comprobante_base64: dataUrl,
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
        comprobante_base64: dataUrl,
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
