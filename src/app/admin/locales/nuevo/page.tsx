"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIAS = [
  "Hamburguesas", "Pizza", "Sushi", "Saludable", "Postres", "Cafetería",
  "Milanesas", "Vegetariano", "Otros",
];

export default function NuevoLocal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<{ slug: string; email: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/admin/locales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear.");
      setOk({ slug: data.slug, email: String(payload.owner_email) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-card border border-green-200 bg-green-50 p-6 text-center">
          <p className="text-2xl">✅</p>
          <h1 className="mt-2 text-xl font-bold text-navy">Local creado</h1>
          <p className="mt-2 text-sm text-muted">
            La cuenta del restaurante ya está lista. Pasale estos datos para que
            entre a su panel en <code className="rounded bg-white px-1">/admin-local</code>:
          </p>
          <div className="mt-4 rounded-xl bg-white p-4 text-left text-sm">
            <p><span className="text-muted">Email:</span> <strong>{ok.email}</strong></p>
            <p className="mt-1 text-muted">Contraseña: la que cargaste recién.</p>
          </div>
          <div className="mt-5 flex justify-center gap-2">
            <Link href={`/local/${ok.slug}`} className="rounded-full border border-brdr px-4 py-2 text-sm font-semibold text-navy hover:bg-white">
              Ver local
            </Link>
            <Link href="/admin/locales" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy-700">
              Ir a locales
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/locales" className="text-sm text-muted hover:text-copper">← Locales</Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-navy">Nuevo restaurante</h1>
      <p className="mb-6 text-sm text-muted">
        Creás el local y, de una, su cuenta de login para que entre a su panel.
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <Section titulo="Datos del local">
          <Field label="Nombre" name="nombre" required placeholder="Burger Club" />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-navy">Categoría</span>
              <select name="categoria" className="w-full rounded-xl border border-brdr bg-white px-3 py-2.5 outline-none focus:border-navy">
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <Field label="Tiempo estimado (min)" name="tiempo_estimado_min" type="number" defaultValue="20" />
          </div>
          <Field label="Descripción" name="descripcion" placeholder="Smash burgers y papas rústicas." />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Alias de cobro" name="alias_cobro" placeholder="burger.club.mp" />
            <Field label="Comisión %" name="comision_pct" type="number" defaultValue="10" />
          </div>
        </Section>

        <Section titulo="Cuenta de login del restaurante">
          <Field label="Email" name="owner_email" type="email" required placeholder="local@ejemplo.com" />
          <Field label="Contraseña" name="owner_password" type="text" required placeholder="mín. 6 caracteres" />
        </Section>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-full bg-copper py-3 font-semibold text-white transition hover:bg-copper-light disabled:opacity-60"
        >
          {loading ? "Creando…" : "Crear restaurante + login"}
        </button>
      </form>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-brdr bg-white p-5">
      <h2 className="mb-3 font-semibold text-navy">{titulo}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label, name, type = "text", required, placeholder, defaultValue,
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-navy">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-brdr bg-white px-3 py-2.5 outline-none focus:border-navy"
      />
    </label>
  );
}
