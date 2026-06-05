import Link from "next/link";
import { getResumenPlataforma, getVentasPorLocal } from "@/lib/panel-data";
import { formatARS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [resumen, ventas] = await Promise.all([
    getResumenPlataforma(),
    getVentasPorLocal(),
  ]);

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-navy">Dashboard global</h1>
        <p className="text-sm text-muted">Toda la plataforma DUTI</p>
      </header>

      {/* Ventas por período */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat titulo="Ventas hoy" valor={formatARS(resumen?.ventas_hoy ?? 0)} acento />
        <Stat titulo="Esta semana" valor={formatARS(resumen?.ventas_semana ?? 0)} />
        <Stat titulo="Este mes" valor={formatARS(resumen?.ventas_mes ?? 0)} />
        <Stat titulo="Ventas totales" valor={formatARS(resumen?.ventas_total ?? 0)} acento />
      </div>
      {/* Pedidos por período */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat titulo="Pedidos hoy" valor={String(resumen?.pedidos_hoy ?? 0)} />
        <Stat titulo="Pedidos semana" valor={String(resumen?.pedidos_semana ?? 0)} />
        <Stat titulo="Pedidos mes" valor={String(resumen?.pedidos_mes ?? 0)} />
        <Stat titulo="Comisión generada" valor={formatARS(resumen?.comision_total ?? 0)} acento />
      </div>
      <div className="mt-4">
        <Stat titulo="Locales activos" valor={String(resumen?.locales_activos ?? 0)} />
      </div>

      <h2 className="mt-8 mb-3 font-semibold text-navy">Ventas por local</h2>
      <div className="overflow-hidden rounded-card border border-brdr bg-white">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3 text-right">Pedidos</th>
              <th className="px-4 py-3 text-right">Ventas</th>
              <th className="px-4 py-3 text-right">Comisión</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.local_id} className="border-t border-brdr">
                <td className="px-4 py-3 font-medium text-navy">{v.nombre}</td>
                <td className="px-4 py-3 text-right text-muted">{v.pedidos}</td>
                <td className="px-4 py-3 text-right font-semibold text-navy">
                  {formatARS(Number(v.ventas))}
                </td>
                <td className="px-4 py-3 text-right text-copper-600">
                  {formatARS(Number(v.comision))}{" "}
                  <span className="text-xs text-muted">({Number(v.comision_pct)}%)</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/locales/${v.local_id}`}
                    className="text-sm font-medium text-copper hover:underline"
                  >
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
            {ventas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  Sin datos todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
