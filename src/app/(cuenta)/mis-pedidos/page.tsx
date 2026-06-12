import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { formatARS } from "@/lib/format";
import { EstadoBadge } from "@/components/estado-badge";
import { PedidoEditable } from "@/components/pedido-editable";
import { logoutCliente } from "../actions";
import type { ItemPedido, Pedido } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mis pedidos — DUTI" };

export default async function MisPedidos() {
  const session = await getSession();
  if (!session) redirect("/login?next=/mis-pedidos");

  const supabase = await createClient();
  const { data } = await supabase!
    .from("pedidos")
    .select("*")
    .eq("usuario_id", session.userId)
    .order("created_at", { ascending: false });
  const pedidos = (data ?? []) as Pedido[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Mis pedidos</h1>
          <p className="text-sm text-muted">{session.email}</p>
        </div>
        <form action={logoutCliente}>
          <button className="text-sm text-muted hover:text-danger">Salir</button>
        </form>
      </div>

      {pedidos.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-brdr bg-white p-10 text-center">
          <p className="text-muted">
            Todavía no hiciste ningún pedido. Entrá al link de tu local favorito
            para hacer el primero.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {pedidos.map((p) => {
            // Pendiente de pago -> editable (sumar/sacar platos, ir a pagar)
            if (p.estado === "pendiente_pago") {
              return <PedidoEditable key={p.id} pedido={p} />;
            }
            const items = (p.items ?? []) as ItemPedido[];
            return (
              <Link
                key={p.id}
                href={`/confirmacion/${p.id}`}
                className="block rounded-card border border-brdr bg-white p-4 hover:border-navy"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">#{p.id.slice(0, 8)}</span>
                    <EstadoBadge estado={p.estado} />
                  </div>
                  <span className="font-bold text-navy">{formatARS(Number(p.total))}</span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {items.map((i) => `${i.cantidad}× ${i.nombre}`).join(" · ")}
                </p>
                <p className="mt-1 text-xs text-muted">Retiro {p.horario_retiro}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
