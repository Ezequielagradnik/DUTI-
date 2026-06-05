import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EstadoPedido } from "@/lib/types";

/**
 * Callback que llama n8n con el resultado de la IA.
 * Protegido con el header x-duti-secret === N8N_CALLBACK_SECRET.
 *
 * Body esperado:
 * {
 *   es_real: boolean, confianza: number (0-100),
 *   monto_detectado: number, alias_destino: string,
 *   fecha_hora: string, senales_sospechosas: string[]
 * }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = process.env.N8N_CALLBACK_SECRET;
  if (secret && req.headers.get("x-duti-secret") !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const v = await req.json().catch(() => null);
  if (!v) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const admin = createAdminClient();
  const { data: pedido } = await admin
    .from("pedidos")
    .select("total")
    .eq("id", id)
    .maybeSingle();
  if (!pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const confianza = Number(v.confianza ?? 0);
  const total = Number(pedido.total);
  // Desfasaje = pagado - total (negativo = pagó de menos)
  const desfasaje =
    v.monto_detectado != null
      ? Math.round(Number(v.monto_detectado) - total)
      : 0;
  const montoOk = v.monto_detectado != null && Math.abs(desfasaje) < 1;

  let estado: EstadoPedido;
  if (v.es_real === true && confianza >= 80 && montoOk) {
    estado = "confirmado";
  } else if (v.es_real === false || confianza < 40) {
    estado = "rechazado";
  } else {
    estado = "sospechoso";
  }

  const { error } = await admin
    .from("pedidos")
    .update({ estado, verificacion: v, desfasaje_precio: desfasaje })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, estado });
}
