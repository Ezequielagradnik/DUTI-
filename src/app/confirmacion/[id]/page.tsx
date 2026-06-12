import Link from "next/link";
import { notFound } from "next/navigation";
import { getPedidoById, getLocalById } from "@/lib/data";
import { formatARS } from "@/lib/format";
import type { ItemPedido } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConfirmacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await getPedidoById(id);
  if (!pedido) notFound();
  const local = await getLocalById(pedido.local_id);
  const items = (pedido.items ?? []) as ItemPedido[];

  const confirmado = pedido.estado === "confirmado" || pedido.estado === "en_preparacion" || pedido.estado === "listo";

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-card border border-brdr bg-white p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-3xl">
          {confirmado ? "✅" : "🕒"}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-navy">
          {confirmado ? "¡Pago confirmado!" : "Pedido recibido"}
        </h1>
        <p className="mt-1 text-muted">
          {confirmado
            ? "Tu pedido ya está en la cocina."
            : "Estamos terminando de verificar tu pago."}
        </p>
        <p className="mt-2 font-mono text-xs text-muted">#{pedido.id.slice(0, 8)}</p>
      </div>

      <div className="mt-6 rounded-card border border-brdr bg-white p-5">
        <div className="flex items-center justify-between border-b border-brdr pb-3">
          <span className="font-semibold text-navy">{local?.nombre}</span>
          <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-cream">
            Retiro {pedido.horario_retiro}
          </span>
        </div>

        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.plato_id} className="flex justify-between">
              <span className="text-navy">
                {i.cantidad}× {i.nombre}
              </span>
              <span className="text-muted">{formatARS(i.precio * i.cantidad)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-brdr pt-3 font-bold text-navy">
          <span>Total</span>
          <span>{formatARS(Number(pedido.total))}</span>
        </div>
      </div>

      <Link
        href="/mis-pedidos"
        className="mt-6 block rounded-full bg-navy py-3 text-center font-semibold text-cream hover:bg-navy-700"
      >
        Ver mis pedidos
      </Link>
    </div>
  );
}
