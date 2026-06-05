import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Devuelve una URL firmada del comprobante de un pedido.
 * La lectura del pedido pasa por RLS (solo el owner/admin lo ve);
 * si no tenés acceso, Supabase devuelve null -> 403.
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

  // RLS: solo devuelve el pedido si el usuario logueado es owner/admin del local
  const { data: pedido } = await supabase
    .from("pedidos")
    .select("id, comprobante_url")
    .eq("id", pedidoId)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }
  if (!pedido.comprobante_url) {
    return NextResponse.json({ error: "Sin comprobante" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from("comprobantes")
    .createSignedUrl(pedido.comprobante_url, 60 * 10);

  if (error || !signed) {
    return NextResponse.json({ error: "No se pudo firmar" }, { status: 500 });
  }
  return NextResponse.json({ url: signed.signedUrl });
}
