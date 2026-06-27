"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { importarPlatos, type PlatoBulk } from "@/app/admin-local/(panel)/menu/actions";

type Campo = "nombre" | "precio" | "descripcion" | "categoria" | "disponible";
const CAMPOS: { key: Campo; label: string; req: boolean }[] = [
  { key: "nombre", label: "Nombre", req: true },
  { key: "precio", label: "Precio", req: true },
  { key: "descripcion", label: "Descripción", req: false },
  { key: "categoria", label: "Categoría", req: false },
  { key: "disponible", label: "Disponible", req: false },
];

const norm = (s: string) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

function parsePrecio(v: unknown): number {
  if (typeof v === "number") return v;
  let s = String(v ?? "").replace(/[^0-9.,]/g, "").trim();
  if (!s) return NaN;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/\./g, ""); // puntos = separador de miles
  return Number(s);
}
function parseDisponible(v: unknown): boolean {
  const s = norm(String(v ?? ""));
  if (["no", "false", "0", "pausado", "n"].includes(s)) return false;
  return true; // default visible
}

export function ImportarPlatos() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [map, setMap] = useState<Record<Campo, number>>({
    nombre: -1, precio: -1, descripcion: -1, categoria: -1, disponible: -1,
  });
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setStep(0); setHeaders([]); setRows([]); setError(null); setResultado(null);
    setMap({ nombre: -1, precio: -1, descripcion: -1, categoria: -1, disponible: -1 });
  }
  function cerrar() { setAbierto(false); reset(); }

  async function onFile(file: File) {
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, blankrows: false, defval: "" });
      if (data.length < 2) throw new Error("El archivo no tiene filas de datos.");
      const hs = (data[0] as unknown[]).map((h) => String(h ?? "").trim());
      const rs = (data.slice(1) as unknown[][]).map((r) => hs.map((_, i) => String(r[i] ?? "").trim()));

      // Auto-mapeo por nombre de columna
      const auto: Record<Campo, number> = { nombre: -1, precio: -1, descripcion: -1, categoria: -1, disponible: -1 };
      hs.forEach((h, i) => {
        const n = norm(h);
        if (auto.nombre < 0 && /(nombre|plato|producto|item|titulo)/.test(n)) auto.nombre = i;
        else if (auto.precio < 0 && /(precio|price|valor|monto|importe)/.test(n)) auto.precio = i;
        else if (auto.descripcion < 0 && /(descrip|detalle|ingredientes)/.test(n)) auto.descripcion = i;
        else if (auto.categoria < 0 && /(categor|rubro|seccion|tipo)/.test(n)) auto.categoria = i;
        else if (auto.disponible < 0 && /(disponible|activo|visible|stock)/.test(n)) auto.disponible = i;
      });
      setHeaders(hs); setRows(rs); setMap(auto); setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    }
  }

  // Filas mapeadas + validez
  const procesadas = useMemo(() => {
    return rows.map((r) => {
      const nombre = map.nombre >= 0 ? r[map.nombre] : "";
      const precio = map.precio >= 0 ? parsePrecio(r[map.precio]) : NaN;
      const ok = Boolean(nombre?.trim()) && Number.isFinite(precio) && precio >= 0;
      return {
        ok,
        plato: {
          nombre: nombre?.trim() ?? "",
          precio,
          descripcion: map.descripcion >= 0 ? r[map.descripcion] : "",
          categoria: map.categoria >= 0 ? r[map.categoria] : "",
          disponible: map.disponible >= 0 ? parseDisponible(r[map.disponible]) : true,
        } as PlatoBulk,
      };
    });
  }, [rows, map]);

  const validos = procesadas.filter((p) => p.ok);
  const invalidos = procesadas.length - validos.length;
  const faltaReq = map.nombre < 0 || map.precio < 0;

  function confirmar() {
    setError(null);
    startTransition(async () => {
      const r = await importarPlatos(validos.map((v) => v.plato));
      if (r?.error) return setError(r.error);
      setResultado(r.count ?? validos.length);
      setStep(2);
      router.refresh();
    });
  }

  function descargarPlantilla() {
    const csv = "nombre,precio,descripcion,categoria,disponible\nSmash Doble,8900,Dos medallones y cheddar,Hamburguesas,si\nLimonada,2400,Con jengibre,Bebidas,si\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "plantilla-platos-duti.csv";
    a.click();
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="rounded-full border border-brdr px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy-50"
      >
        📄 Importar por Excel
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={cerrar}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-card bg-cream p-6" onClick={(e) => e.stopPropagation()}>
        {/* Pasos */}
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold">
          {["1 · Subí el archivo", "2 · Revisá y confirmá", "3 · Listo"].map((t, i) => (
            <span key={t} className={`rounded-full px-3 py-1 ${step === i ? "bg-navy text-cream" : "bg-white text-muted"}`}>{t}</span>
          ))}
        </div>

        {/* PASO 0 */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-navy">Importar platos por primera vez</h2>
            <ol className="mt-3 space-y-1.5 text-sm text-muted">
              <li>1. Armá un Excel (o CSV) con una fila por plato.</li>
              <li>2. Poné estas columnas: <strong className="text-navy">nombre</strong> y <strong className="text-navy">precio</strong> (obligatorias), y si querés <strong className="text-navy">descripcion</strong>, <strong className="text-navy">categoria</strong>, <strong className="text-navy">disponible</strong>.</li>
              <li>3. Subilo acá. Te mostramos una vista previa para que confirmes antes de cargar.</li>
            </ol>
            <p className="mt-3 rounded-lg bg-navy-50 p-3 text-xs text-navy/70">
              📷 Las <strong>fotos</strong> no se cargan por Excel — las subís después desde cada plato, en esta misma sección.
            </p>

            <button onClick={descargarPlantilla} className="mt-4 text-sm font-semibold text-copper hover:underline">
              ↓ Descargar plantilla de ejemplo
            </button>

            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brdr bg-white p-8 text-center hover:border-copper">
              <span className="text-2xl">📄</span>
              <span className="text-sm font-medium text-navy">Tocá para elegir tu archivo .xlsx o .csv</span>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
            </label>
            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          </div>
        )}

        {/* PASO 1 — mapeo + preview */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-navy">Revisá el mapeo</h2>
            <p className="mt-1 text-sm text-muted">Confirmá qué columna de tu archivo va en cada campo de DUTI.</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {CAMPOS.map((c) => (
                <label key={c.key} className="flex items-center justify-between gap-2 rounded-xl border border-brdr bg-white px-3 py-2 text-sm">
                  <span className="font-medium text-navy">{c.label}{c.req && <span className="text-danger"> *</span>}</span>
                  <select
                    value={map[c.key]}
                    onChange={(e) => setMap({ ...map, [c.key]: Number(e.target.value) })}
                    className="rounded-lg border border-brdr bg-white px-2 py-1 text-sm outline-none focus:border-navy"
                  >
                    <option value={-1}>— ninguna —</option>
                    {headers.map((h, i) => <option key={i} value={i}>{h || `Columna ${i + 1}`}</option>)}
                  </select>
                </label>
              ))}
            </div>

            {faltaReq && <p className="mt-3 text-sm text-danger">Asigná las columnas obligatorias (nombre y precio) para continuar.</p>}

            <div className="mt-4 flex items-center gap-3 text-sm">
              <span className="rounded-full bg-success/10 px-3 py-1 font-semibold text-success">{validos.length} válidos</span>
              {invalidos > 0 && <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-danger">{invalidos} se omiten (falta nombre o precio)</span>}
            </div>

            {/* Preview */}
            <div className="mt-3 max-h-60 overflow-auto rounded-xl border border-brdr">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-navy-50 text-left text-xs uppercase text-muted">
                  <tr><th className="px-3 py-2"></th><th className="px-3 py-2">Nombre</th><th className="px-3 py-2">Precio</th><th className="px-3 py-2">Categoría</th></tr>
                </thead>
                <tbody>
                  {procesadas.slice(0, 30).map((p, i) => (
                    <tr key={i} className="border-t border-brdr">
                      <td className="px-3 py-1.5">{p.ok ? "✅" : "⚠️"}</td>
                      <td className="px-3 py-1.5 text-navy">{p.plato.nombre || <span className="text-muted">—</span>}</td>
                      <td className="px-3 py-1.5 text-muted">{Number.isFinite(p.plato.precio) ? p.plato.precio : "—"}</td>
                      <td className="px-3 py-1.5 text-muted">{p.plato.categoria || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {procesadas.length > 30 && <p className="mt-1 text-xs text-muted">…y {procesadas.length - 30} filas más.</p>}

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button onClick={() => setStep(0)} className="rounded-full border border-brdr px-5 py-3 font-semibold text-navy hover:bg-navy-50">← Volver</button>
              <button
                onClick={confirmar}
                disabled={faltaReq || validos.length === 0 || pending}
                className="flex-1 rounded-full bg-copper py-3 font-semibold text-white hover:bg-copper-light disabled:opacity-50"
              >
                {pending ? "Importando…" : `Confirmar e importar ${validos.length} platos`}
              </button>
            </div>
          </div>
        )}

        {/* PASO 2 — listo */}
        {step === 2 && (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-3xl">✅</div>
            <h2 className="mt-4 text-xl font-bold text-navy">¡Importados {resultado} platos!</h2>
            <p className="mt-1 text-sm text-muted">Ya están en tu menú. Ahora podés subirles la foto desde cada plato.</p>
            <button onClick={cerrar} className="mt-5 rounded-full bg-navy px-6 py-3 font-semibold text-cream hover:bg-navy-700">Listo</button>
          </div>
        )}
      </div>
    </div>
  );
}
