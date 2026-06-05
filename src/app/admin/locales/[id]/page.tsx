import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocalById } from "@/lib/data";
import { getResumenVentas, getPedidosDelLocal } from "@/lib/panel-data";
import { formatARS } from "@/lib/format";
import { PedidosBoard } from "@/components/pedidos-board";

export const dynamic = "force-dynamic";

export default async function AdminLocalDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const local = await getLocalById(id);
  if (!local) notFound();

  const [resumen, pedidos] = await Promise.all([
    getResumenVentas(id),
    getPedidosDelLocal(id),
  ]);

  return (
    <div>
      <Link href="/admin/locales" className="text-sm text-muted hover:text-copper">
        ← Locales
      </Link>
      <header className="mb-5 mt-2">
        <h1 className="text-2xl font-bold text-navy">{local.nombre}</h1>
        <p className="text-sm text-muted">
          Comisión {Number(local.comision_pct)}% · alias {local.alias_cobro}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat titulo="Ventas hoy" valor={formatARS(resumen?.ventas_hoy ?? 0)} acento />
        <Stat titulo="Ventas semana" valor={formatARS(resumen?.ventas_semana ?? 0)} />
        <Stat titulo="Ventas mes" valor={formatARS(resumen?.ventas_mes ?? 0)} />
      </div>

      <h2 className="mt-8 mb-3 font-semibold text-navy">Pedidos</h2>
      <PedidosBoard localId={local.id} inicial={pedidos} />
    </div>
  );
}

function Stat({
  titulo,
  valor,
  acento,
}: {
  titulo: string;
  valor: string;
  acento?: boolean;
}) {
  return (
    <div
      className={`rounded-card border p-5 ${
        acento ? "border-copper/30 bg-copper-50" : "border-brdr bg-white"
      }`}
    >
      <p className="text-sm text-muted">{titulo}</p>
      <p className={`mt-1 text-2xl font-bold ${acento ? "text-copper-600" : "text-navy"}`}>
        {valor}
      </p>
    </div>
  );
}
