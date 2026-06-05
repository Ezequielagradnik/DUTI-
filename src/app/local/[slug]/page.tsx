import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocalBySlug, getPlatosByLocal } from "@/lib/data";
import { PlatoCard } from "@/components/plato-card";

export const dynamic = "force-dynamic";

export default async function LocalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const local = await getLocalBySlug(slug);
  if (!local) notFound();

  const platos = await getPlatosByLocal(local.id);

  // Agrupar por categoría
  const grupos = new Map<string, typeof platos>();
  for (const p of platos) {
    const k = p.categoria ?? "Menú";
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k)!.push(p);
  }

  return (
    <div>
      {/* Portada */}
      <div className="relative h-56 w-full overflow-hidden bg-navy md:h-72">
        {local.portada_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={local.portada_url}
            alt={local.nombre}
            className="h-full w-full object-cover opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full">
          <div className="mx-auto max-w-4xl px-4 pb-5">
            <span className="rounded-full bg-copper px-3 py-1 text-xs font-semibold text-white">
              {local.categoria}
            </span>
            <h1 className="mt-2 text-3xl font-bold text-white">{local.nombre}</h1>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              {local.descripcion}
            </p>
            <div className="mt-2 flex gap-4 text-xs text-white/70">
              <span>🕒 {local.tiempo_estimado_min} min</span>
              {local.horario_apertura && local.horario_cierre && (
                <span>
                  Abierto {local.horario_apertura.slice(0, 5)}–
                  {local.horario_cierre.slice(0, 5)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menú */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/locales" className="text-sm text-muted hover:text-copper">
          ← Volver a locales
        </Link>

        {platos.length === 0 ? (
          <p className="mt-8 rounded-card border border-dashed border-brdr bg-white p-8 text-center text-muted">
            Este local todavía no cargó su menú.
          </p>
        ) : (
          <div className="mt-6 space-y-10">
            {[...grupos.entries()].map(([cat, items]) => (
              <section key={cat}>
                <h2 className="mb-4 text-xl font-bold text-navy">{cat}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((p) => (
                    <PlatoCard key={p.id} plato={p} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
