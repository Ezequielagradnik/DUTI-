import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { totalConCentavosUnicos } from "@/lib/format";

interface ItemIn {
  plato_id: string;
  cantidad: number;
}

// Verifica que el pedido sea del usuario logueado y esté pendiente de pago.
async function autorizar(id: string) {
  const sb = await createClient();
  if (!sb) return { error: "No configurado", status: 500 as const };
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "No autenticado", status: 401 as const };

  const admin = createAdminClient();
  const { data: pedido } = await admin
    .from("pedidos")
    .select("id, usuario_id, estado, local_id")
    .eq("id", id)
    .maybeSingle();

  if (!pedido || pedido.usuario_id !== user.id) {
    return { error: "Sin acceso", status: 403 as const };
  }
  if (pedido.estado !== "pendiente_pago") {
    return { error: "El pedido ya no se puede editar.", status: 409 as const };
  }
  return { admin, pedido };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await autorizar(id);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { admin, pedido } = auth;

  const body = await req.json().catch(() => null);
  const items: ItemIn[] = body?.items ?? [];

  // Sin items -> se cancela (borra) el pedido
  if (!Array.isArray(items) || items.length === 0) {
    await admin.from("pedidos").delete().eq("id", id);
    return NextResponse.json({ ok: true, deleted: true });
  }

  // Recalcular precios desde la DB (no confiar en el cliente)
  const { data: platos } = await admin
    .from("platos")
    .select("id, nombre, precio, disponible, local_id")
    .in("id", items.map((i) => i.plato_id));
  const byId = new Map((platos ?? []).map((p) => [p.id, p]));

  const lineItems = [];
  let subtotal = 0;
  for (const it of items) {
    const p = byId.get(it.plato_id);
    const cantidad = Math.max(1, Math.floor(Number(it.cantidad) || 0));
    if (!p || !p.disponible || p.local_id !== pedido.local_id) {
      return NextResponse.json(
        { error: "Hay un producto que ya no está disponible." },
        { status: 409 }
      );
    }
    const precio = Number(p.precio);
    subtotal += precio * cantidad;
    lineItems.push({ plato_id: p.id, nombre: p.nombre, precio, cantidad });
  }

  const total = totalConCentavosUnicos(subtotal, id);

  const { error } = await admin
    .from("pedidos")
    .update({ items: lineItems, subtotal, total })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, items: lineItems, subtotal, total });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await autorizar(id);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  await auth.admin.from("pedidos").delete().eq("id", id);
  return NextResponse.json({ ok: true, deleted: true });
}
