import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el comprobante (imagen base64) de un pedido.
 * La lectura pasa por RLS: solo el owner/admin del local lo ve.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pedidoId: string }> }
) {
  const { pedidoId } = await params;

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "No configurado" }, { status: 500 });
  }

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, comprobante_base64")
    .eq("id", pedidoId)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }
  if (!pedido.comprobante_base64) {
    return NextResponse.json({ error: "Sin comprobante" }, { status: 404 });
  }

  return NextResponse.json({ base64: pedido.comprobante_base64 });
}
