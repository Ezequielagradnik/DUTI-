import Link from "next/link";
import { getLocales } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Locales — DUTI" };

export default async function LocalesPage() {
  const locales = await getLocales();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-navy">Locales disponibles</h1>
        <p className="mt-1 text-muted">Elegí dónde querés pedir hoy.</p>
      </header>

      {locales.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locales.map((l) => (
            <Link
              key={l.id}
              href={`/local/${l.slug}`}
              className="group overflow-hidden rounded-card border border-brdr bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-50">
                {l.portada_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.portada_url}
                    alt={l.nombre}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy">
                  {l.categoria}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-bold text-navy">{l.nombre}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {l.descripcion}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    🕒 {l.tiempo_estimado_min} min
                  </span>
                  {l.horario_apertura && l.horario_cierre && (
                    <span>
                      {l.horario_apertura.slice(0, 5)}–{l.horario_cierre.slice(0, 5)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-brdr bg-white p-12 text-center">
      <p className="text-lg font-semibold text-navy">No hay locales todavía</p>
      <p className="mt-2 text-sm text-muted">
        Conectá Supabase y corré el seed para ver los locales de demo, o cargá
        los tuyos desde el panel del local.
      </p>
    </div>
  );
}
