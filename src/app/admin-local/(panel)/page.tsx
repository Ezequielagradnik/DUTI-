import Link from "next/link";
import { getSession, getLocalDelOwner } from "@/lib/auth";
import { getResumenVentas, getPedidosDelLocal } from "@/lib/panel-data";
import { formatARS } from "@/lib/format";
import { EstadoBadge } from "@/components/estado-badge";

export const dynamic = "force-dynamic";

export default async function DashboardPanel() {
  const session = await getSession();
  const local = session ? await getLocalDelOwner(session) : null;
  if (!local) return null;

  const [resumen, pedidos] = await Promise.all([
    getResumenVentas(local.id),
    getPedidosDelLocal(local.id, 50),
  ]);

  const pendientes = pedidos.filter((p) =>
    ["confirmado", "en_preparacion"].includes(p.estado)
  );
  const sospechosos = pedidos.filter((p) => p.estado === "sospechoso");

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-navy">Resumen de hoy</h1>
        <p className="text-sm text-muted">{local.nombre}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card titulo="Ventas hoy" valor={formatARS(resumen?.ventas_hoy ?? 0)} acento />
        <Card titulo="Pedidos hoy" valor={String(resumen?.pedidos_hoy ?? 0)} />
        <Card
          titulo="Por preparar"
          valor={String(pendientes.length)}
          link="/admin-local/pedidos"
        />
      </div>

      {sospechosos.length > 0 && (
        <div className="mt-5 rounded-card border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-800">
            🟡 {sospechosos.length} pedido(s) sospechoso(s) para revisar
          </p>
          <Link
            href="/admin-local/pedidos"
            className="text-sm font-medium text-amber-700 underline"
          >
            Revisar ahora →
          </Link>
        </div>
      )}

      <h2 className="mt-8 mb-3 font-semibold text-navy">Últimos pedidos</h2>
      <div className="space-y-2">
        {pedidos.slice(0, 8).map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-brdr bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted">#{p.id.slice(0, 8)}</span>
              <EstadoBadge estado={p.estado} />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted">Retiro {p.horario_retiro}</span>
              <span className="font-bold text-navy">{formatARS(Number(p.total))}</span>
            </div>
          </div>
        ))}
        {pedidos.length === 0 && (
          <p className="rounded-card border border-dashed border-brdr bg-white p-6 text-center text-sm text-muted">
            Todavía no hay pedidos.
          </p>
        )}
      </div>
    </div>
  );
}

function Card({
  titulo,
  valor,
  acento,
  link,
}: {
  titulo: string;
  valor: string;
  acento?: boolean;
  link?: string;
}) {
  const inner = (
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
  return link ? <Link href={link}>{inner}</Link> : inner;
}
