import Link from "next/link";
import { getVentasPorLocal } from "@/lib/panel-data";
import { formatARS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminLocales() {
  const ventas = await getVentasPorLocal();

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-navy">Locales</h1>
        <p className="text-sm text-muted">Ventas y comisión por local</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {ventas.map((v) => (
          <Link
            key={v.local_id}
            href={`/admin/locales/${v.local_id}`}
            className="rounded-card border border-brdr bg-white p-5 hover:border-navy"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-navy">{v.nombre}</h2>
              <span className="rounded-full bg-copper-50 px-2.5 py-1 text-xs font-semibold text-copper-600">
                {Number(v.comision_pct)}% comisión
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted">Pedidos</p>
                <p className="font-bold text-navy">{v.pedidos}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Ventas</p>
                <p className="font-bold text-navy">{formatARS(Number(v.ventas))}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Comisión</p>
                <p className="font-bold text-copper-600">{formatARS(Number(v.comision))}</p>
              </div>
            </div>
          </Link>
        ))}
        {ventas.length === 0 && (
          <p className="rounded-card border border-dashed border-brdr bg-white p-8 text-center text-muted">
            No hay locales todavía.
          </p>
        )}
      </div>
    </div>
  );
}
