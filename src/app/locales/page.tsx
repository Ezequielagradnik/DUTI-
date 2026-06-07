import { getLocales } from "@/lib/data";
import { LocalesExplorer } from "@/components/locales-explorer";

export const dynamic = "force-dynamic";

export const metadata = { title: "Locales — DUTI" };

export default async function LocalesPage() {
  const locales = await getLocales();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-navy">Locales disponibles</h1>
        <p className="mt-1 text-muted">Elegí dónde querés pedir hoy.</p>
      </header>

      {locales.length === 0 ? (
        <div className="rounded-card border border-dashed border-brdr bg-white p-12 text-center">
          <p className="text-lg font-semibold text-navy">No hay locales todavía</p>
          <p className="mt-2 text-sm text-muted">
            Conectá Supabase y corré el seed para ver los locales de demo.
          </p>
        </div>
      ) : (
        <LocalesExplorer locales={locales} />
      )}
    </div>
  );
}
