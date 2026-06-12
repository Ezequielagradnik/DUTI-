import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { totalConCentavosUnicos } from "@/lib/format";

interface ItemIn {
  plato_id: string;
  cantidad: number;
}

export async function POST(req: Request) {
  let body: {
    local_id?: string;
    items?: ItemIn[];
    horario_retiro?: string;
    nombre_cliente?: string;
    telefono_cliente?: string | null;
    alias_cliente?: string | null;
    email_cliente?: string | null;
    especificaciones?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { local_id, items, horario_retiro, nombre_cliente, telefono_cliente, alias_cliente, email_cliente, especificaciones } = body;

  if (!local_id || !Array.isArray(items) || items.length === 0 || !horario_retiro) {
    return NextResponse.json({ error: "Faltan datos del pedido." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Recalcular precios desde la DB (no confiar en el cliente)
  const platoIds = items.map((i) => i.plato_id);
  const { data: platos, error: pErr } = await admin
    .from("platos")
    .select("id, nombre, precio, disponible, local_id")
    .in("id", platoIds);
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const byId = new Map((platos ?? []).map((p) => [p.id, p]));
  const lineItems = [];
  let subtotal = 0;
  for (const it of items) {
    const p = byId.get(it.plato_id);
    const cantidad = Math.max(1, Math.floor(Number(it.cantidad) || 0));
    if (!p || !p.disponible || p.local_id !== local_id) {
      return NextResponse.json(
        { error: "Hay un producto que ya no está disponible." },
        { status: 409 }
      );
    }
    const precio = Number(p.precio);
    subtotal += precio * cantidad;
    lineItems.push({ plato_id: p.id, nombre: p.nombre, precio, cantidad });
  }

  const id = crypto.randomUUID();
  const total = totalConCentavosUnicos(subtotal, id);

  // Si el usuario está logueado, asociamos el pedido a su cuenta.
  let usuarioId: string | null = null;
  const sb = await createClient();
  if (sb) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    usuarioId = user?.id ?? null;
  }

  const { error: insErr } = await admin.from("pedidos").insert({
    id,
    local_id,
    usuario_id: usuarioId,
    items: lineItems,
    subtotal,
    total,
    horario_retiro,
    estado: "pendiente_pago",
    nombre_cliente: nombre_cliente ?? null,
    telefono_cliente: telefono_cliente ?? null,
    alias_cliente: alias_cliente ?? null,
    email_cliente: email_cliente ?? null,
    especificaciones: especificaciones ?? null,
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ id, total });
}
