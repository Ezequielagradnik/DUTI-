"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Local } from "@/lib/types";

const PRECIO_LABEL: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$" };

export function LocalesExplorer({ locales }: { locales: Local[] }) {
  const [categoria, setCategoria] = useState("");
  const [zona, setZona] = useState("");
  const [precio, setPrecio] = useState("");

  // Opciones (de los locales ya cargados, sin pegarle a la base)
  const zonas = useMemo(
    () => [...new Set(locales.map((l) => l.zona).filter(Boolean) as string[])].sort(),
    [locales]
  );
  const categorias = useMemo(
    () => [...new Set(locales.map((l) => l.categoria))].sort(),
    [locales]
  );

  // Filtrado en memoria
  const filtrados = useMemo(
    () =>
      locales.filter(
        (l) =>
          (!categoria || l.categoria === categoria) &&
          (!zona || l.zona === zona) &&
          (!precio || String(l.rango_precio) === precio)
      ),
    [locales, categoria, zona, precio]
  );

  const base =
    "rounded-full border border-brdr bg-white px-4 py-2 text-sm font-medium text-navy outline-none focus:border-navy";
  const hayFiltro = categoria || zona || precio;

  function limpiar() {
    setCategoria("");
    setZona("");
    setPrecio("");
  }

  return (
    <>
      {/* Filtros */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <select className={base} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Tipo de comida</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className={base} value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Zona</option>
          {zonas.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
        <select className={base} value={precio} onChange={(e) => setPrecio(e.target.value)}>
          <option value="">Precio</option>
          <option value="1">$ (económico)</option>
          <option value="2">$$ (medio)</option>
          <option value="3">$$$ (premium)</option>
        </select>
        {hayFiltro && (
          <button onClick={limpiar} className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-danger">
            Limpiar
          </button>
        )}
        <span className="ml-auto text-sm text-muted">
          {filtrados.length} {filtrados.length === 1 ? "local" : "locales"}
        </span>
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div className="rounded-card border border-dashed border-brdr bg-white p-12 text-center">
          <p className="text-lg font-semibold text-navy">No hay locales con esos filtros</p>
          <p className="mt-2 text-sm text-muted">Probá cambiar la zona, el tipo de comida o el precio.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((l) => (
            <Link
              key={l.id}
              href={`/local/${l.slug}`}
              className="group overflow-hidden rounded-card border border-brdr bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-50">
                {l.portada_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.portada_url} alt={l.nombre} className="h-full w-full object-cover transition group-hover:scale-105" />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy">
                  {l.categoria}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-navy/85 px-2.5 py-1 text-xs font-bold text-cream">
                  {PRECIO_LABEL[l.rango_precio] ?? "$$"}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-bold text-navy">{l.nombre}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{l.descripcion}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">🕒 {l.tiempo_estimado_min} min</span>
                  {l.zona && <span className="inline-flex items-center gap-1">📍 {l.zona}</span>}
                  {l.horario_apertura && l.horario_cierre && (
                    <span>{l.horario_apertura.slice(0, 5)}–{l.horario_cierre.slice(0, 5)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
