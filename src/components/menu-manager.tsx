"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatARS } from "@/lib/format";
import { guardarPlato, togglePlato, borrarPlato, type PlatoInput } from "@/app/admin-local/(panel)/menu/actions";
import type { Plato } from "@/lib/types";

const VACIO: PlatoInput = {
  nombre: "",
  descripcion: "",
  precio: 0,
  categoria: "",
  foto_url: "",
  disponible: true,
};

export function MenuManager({ platosIniciales }: { platosIniciales: Plato[] }) {
  const router = useRouter();
  const [form, setForm] = useState<PlatoInput | null>(null); // null = form cerrado
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function abrirNuevo() {
    setError(null);
    setForm({ ...VACIO });
  }
  function abrirEditar(p: Plato) {
    setError(null);
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precio: Number(p.precio),
      categoria: p.categoria ?? "",
      foto_url: p.foto_url ?? "",
      disponible: p.disponible,
    });
  }

  async function subirFoto(file: File) {
    setSubiendo(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/platos/foto", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No se pudo subir la foto.");
      setForm((f) => (f ? { ...f, foto_url: d.url } : f));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir.");
    } finally {
      setSubiendo(false);
    }
  }

  function guardar() {
    if (!form) return;
    setError(null);
    startTransition(async () => {
      const r = await guardarPlato(form);
      if (r?.error) return setError(r.error);
      setForm(null);
      router.refresh();
    });
  }

  function toggle(p: Plato) {
    startTransition(async () => {
      await togglePlato(p.id, !p.disponible);
      router.refresh();
    });
  }

  function borrar(p: Plato) {
    if (!confirm(`¿Borrar "${p.nombre}"? No se puede deshacer.`)) return;
    startTransition(async () => {
      await borrarPlato(p.id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button
          onClick={abrirNuevo}
          className="rounded-full bg-copper px-5 py-2.5 text-sm font-semibold text-white hover:bg-copper-light"
        >
          + Nuevo plato
        </button>
      </div>

      {platosIniciales.length === 0 && !form && (
        <div className="rounded-card border border-dashed border-brdr bg-white p-10 text-center text-muted">
          Todavía no cargaste platos. Tocá <strong>+ Nuevo plato</strong> para empezar.
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {platosIniciales.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-4 rounded-card border border-brdr bg-white p-3 ${
              !p.disponible ? "opacity-60" : ""
            }`}
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy-50">
              {p.foto_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.foto_url} alt={p.nombre} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-navy">{p.nombre}</p>
                {!p.disponible && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                    Pausado
                  </span>
                )}
              </div>
              {p.descripcion && <p className="truncate text-sm text-muted">{p.descripcion}</p>}
              <p className="text-sm font-bold text-copper">{formatARS(Number(p.precio))}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => toggle(p)} disabled={pending} className="rounded-full border border-brdr px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy-50">
                {p.disponible ? "Pausar" : "Activar"}
              </button>
              <button onClick={() => abrirEditar(p)} className="rounded-full border border-brdr px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy-50">
                Editar
              </button>
              <button onClick={() => borrar(p)} disabled={pending} className="rounded-full px-2 py-1.5 text-xs font-semibold text-muted hover:text-danger">
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form (modal) */}
      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setForm(null)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-card bg-cream p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-navy">{form.id ? "Editar plato" : "Nuevo plato"}</h2>

            <div className="mt-4 space-y-3">
              {/* Foto */}
              <div>
                <span className="mb-1 block text-sm font-medium text-navy">Foto</span>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-brdr bg-white p-3 hover:border-copper">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-navy-50 text-xl">
                    {form.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.foto_url} alt="" className="h-full w-full object-cover" />
                    ) : ("📷")}
                  </div>
                  <span className="text-sm text-muted">{subiendo ? "Subiendo…" : "Tocá para subir una foto (JPG/PNG)"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) subirFoto(f); }} />
                </label>
              </div>

              <Field label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} placeholder="Smash Doble" />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-navy">Descripción</span>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                  placeholder="Dos medallones, cheddar, cebolla…"
                  className="w-full rounded-xl border border-brdr bg-white px-3 py-2.5 outline-none focus:border-navy"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-navy">Precio ($)</span>
                  <input
                    type="number"
                    value={form.precio || ""}
                    onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                    className="w-full rounded-xl border border-brdr bg-white px-3 py-2.5 outline-none focus:border-navy"
                  />
                </label>
                <Field label="Categoría" value={form.categoria} onChange={(v) => setForm({ ...form, categoria: v })} placeholder="Hamburguesas" />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-navy">
                <input type="checkbox" checked={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })} />
                Disponible (visible en el menú)
              </label>

              {error && <p className="text-sm text-danger">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button onClick={guardar} disabled={pending || subiendo} className="flex-1 rounded-full bg-copper py-3 font-semibold text-white hover:bg-copper-light disabled:opacity-60">
                  {pending ? "Guardando…" : "Guardar"}
                </button>
                <button onClick={() => setForm(null)} className="rounded-full border border-brdr px-5 py-3 font-semibold text-navy hover:bg-navy-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-navy">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brdr bg-white px-3 py-2.5 outline-none focus:border-navy"
      />
    </label>
  );
}
