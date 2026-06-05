import { getSession, getLocalDelOwner } from "@/lib/auth";
import { getResumenVentas, getTopPlatos } from "@/lib/panel-data";
import { formatARS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VentasPanel() {
  const session = await getSession();
  const local = session ? await getLocalDelOwner(session) : null;
  if (!local) return null;

  // Top platos del mes
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [resumen, top] = await Promise.all([
    getResumenVentas(local.id),
    getTopPlatos(local.id, inicioMes),
  ]);

  const maxCant = Math.max(1, ...top.map((t) => Number(t.cantidad)));

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-navy">Ventas</h1>
        <p className="text-sm text-muted">{local.nombre}</p>
      </header>

      {/* Totales */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Big titulo="Hoy" valor={formatARS(resumen?.ventas_hoy ?? 0)} acento />
        <Big titulo="Esta semana" valor={formatARS(resumen?.ventas_semana ?? 0)} />
        <Big titulo="Este mes" valor={formatARS(resumen?.ventas_mes ?? 0)} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Mini titulo="Pedidos del mes" valor={String(resumen?.pedidos_mes ?? 0)} />
        <Mini
          titulo="Ticket promedio (mes)"
          valor={formatARS(resumen?.ticket_prom_mes ?? 0)}
        />
      </div>

      {/* Top platos */}
      <h2 className="mt-8 mb-3 font-semibold text-navy">
        Platos más vendidos (este mes)
      </h2>
      <div className="rounded-card border border-brdr bg-white p-5">
        {top.length === 0 ? (
          <p className="text-sm text-muted">
            Todavía no hay ventas este mes.
          </p>
        ) : (
          <ul className="space-y-3">
            {top.map((t) => (
              <li key={t.nombre}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-navy">{t.nombre}</span>
                  <span className="text-muted">
                    {t.cantidad} u · {formatARS(Number(t.total))}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-navy-50">
                  <div
                    className="h-full rounded-full bg-copper"
                    style={{ width: `${(Number(t.cantidad) / maxCant) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Big({
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
      <p
        className={`mt-1 text-2xl font-bold ${
          acento ? "text-copper-600" : "text-navy"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

function Mini({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-card border border-brdr bg-white p-4">
      <p className="text-sm text-muted">{titulo}</p>
      <p className="mt-1 text-xl font-bold text-navy">{valor}</p>
    </div>
  );
}
