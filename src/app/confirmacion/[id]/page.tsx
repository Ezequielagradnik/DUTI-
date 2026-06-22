import Link from "next/link";
import { notFound } from "next/navigation";
import { getPedidoById, getLocalById } from "@/lib/data";
import { formatARS } from "@/lib/format";
import { PedidosRealtime } from "@/components/pedidos-realtime";
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

  const listo = pedido.estado === "listo";
  const confirmado = pedido.estado === "confirmado" || pedido.estado === "en_preparacion";

  const icono = listo ? "🎉" : confirmado ? "✅" : "🕒";
  const titulo = listo
    ? "¡Tu pedido está listo!"
    : confirmado
      ? "¡Pago confirmado!"
      : "Pedido recibido";
  const bajada = listo
    ? `Pasá a buscarlo por ${local?.nombre ?? "el local"}.`
    : confirmado
      ? "Tu pedido ya está en la cocina."
      : "Estamos terminando de verificar tu pago.";

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      {/* Actualiza esta página en vivo cuando el local marca "listo" */}
      <PedidosRealtime pedidoId={pedido.id} />

      <div
        className={`rounded-card border p-6 text-center ${
          listo ? "border-success/40 bg-success/5" : "border-brdr bg-white"
        }`}
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-3xl">
          {icono}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-navy">{titulo}</h1>
        <p className="mt-1 text-muted">{bajada}</p>

        <div className="mx-auto mt-5 inline-block rounded-xl border border-dashed border-copper/50 bg-copper-50/60 px-6 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Código de retiro</p>
          <p className="font-mono text-2xl font-bold text-copper">#{pedido.id.slice(0, 8)}</p>
        </div>
        <p className="mt-2 text-xs text-muted">Mostrá este código al pasar a buscar tu pedido.</p>
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

        {local?.direccion && (
          <div className="mt-4 border-t border-brdr pt-4">
            <p className="text-sm font-semibold text-navy">📍 {local.direccion}</p>
            <iframe
              title={`Ubicación de ${local.nombre}`}
              className="mt-3 h-48 w-full rounded-xl border border-brdr"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(local.direccion)}&output=embed`}
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local.direccion)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-copper hover:underline"
            >
              Cómo llegar →
            </a>
          </div>
        )}
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
