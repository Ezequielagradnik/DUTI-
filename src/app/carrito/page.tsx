"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatARS } from "@/lib/format";
import type { Local, Slot } from "@/lib/types";

export default function CarritoPage() {
  const { items, localId, subtotal, count, setCantidad, remove, clear } = useCart();
  const router = useRouter();

  const [local, setLocal] = useState<Local | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<string>("");
  const [alias, setAlias] = useState("");
  const [telefono, setTelefono] = useState("");
  const [especificaciones, setEspecificaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!localId) return;
    fetch(`/api/locales/${localId}`)
      .then((r) => r.json())
      .then((d) => {
        setLocal(d.local);
        setSlots(d.slots ?? []);
      })
      .catch(() => {});
  }, [localId]);

  async function pagar() {
    setError(null);
    if (!slot) return setError("Elegí un horario de retiro.");
    if (!alias.trim()) return setError("Ingresá el alias desde el que vas a transferir.");
    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          local_id: localId,
          items: items.map((i) => ({
            plato_id: i.plato_id,
            nombre: i.nombre,
            precio: i.precio,
            cantidad: i.cantidad,
          })),
          subtotal,
          horario_retiro: slot,
          alias_cliente: alias.trim(),
          telefono_cliente: telefono.trim() || null,
          especificaciones: especificaciones.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el pedido.");
      router.push(`/pago/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setLoading(false);
    }
  }

  if (count === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted">Sumá platos desde un local para empezar.</p>
        <Link
          href="/locales"
          className="mt-6 inline-block rounded-full bg-navy px-6 py-3 font-semibold text-cream hover:bg-navy-700"
        >
          Ver locales
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">Tu pedido</h1>
      {local && (
        <p className="mt-1 text-muted">
          en <span className="font-semibold text-navy">{local.nombre}</span>
        </p>
      )}

      {/* Items */}
      <div className="mt-6 space-y-3">
        {items.map((i) => (
          <div
            key={i.plato_id}
            className="flex items-center gap-3 rounded-card border border-brdr bg-white p-3"
          >
            {i.foto_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={i.foto_url}
                alt={i.nombre}
                className="h-14 w-14 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-navy">{i.nombre}</p>
              <p className="text-sm text-muted">{formatARS(i.precio)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCantidad(i.plato_id, i.cantidad - 1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-brdr text-navy hover:bg-navy-50"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold">{i.cantidad}</span>
              <button
                onClick={() => setCantidad(i.plato_id, i.cantidad + 1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-brdr text-navy hover:bg-navy-50"
              >
                +
              </button>
            </div>
            <button
              onClick={() => remove(i.plato_id)}
              className="ml-1 text-muted hover:text-danger"
              aria-label="Quitar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Horario */}
      <div className="mt-8">
        <h2 className="font-semibold text-navy">Horario de retiro</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {slots.length === 0 && (
            <p className="text-sm text-muted">Cargando horarios…</p>
          )}
          {slots.map((s) => {
            const lleno = s.ocupados >= s.capacidad_max;
            const sel = slot === s.hora.slice(0, 5);
            return (
              <button
                key={s.id}
                disabled={lleno}
                onClick={() => setSlot(s.hora.slice(0, 5))}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  sel
                    ? "border-navy bg-navy text-cream"
                    : lleno
                      ? "cursor-not-allowed border-brdr text-muted/50 line-through"
                      : "border-brdr bg-white text-navy hover:border-navy"
                }`}
              >
                {s.hora.slice(0, 5)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Datos */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Tu alias de MP (desde donde transferís) *"
          className="rounded-xl border border-brdr bg-white px-4 py-3 outline-none focus:border-navy"
        />
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Teléfono (opcional)"
          className="rounded-xl border border-brdr bg-white px-4 py-3 outline-none focus:border-navy"
        />
        <textarea
          value={especificaciones}
          onChange={(e) => setEspecificaciones(e.target.value)}
          placeholder="Aclaraciones para el local (ej. sin cebolla, bien cocido…)"
          rows={2}
          className="rounded-xl border border-brdr bg-white px-4 py-3 outline-none focus:border-navy sm:col-span-2"
        />
      </div>

      {/* Total + pagar */}
      <div className="mt-8 rounded-card border border-brdr bg-white p-5">
        <div className="flex items-center justify-between text-lg">
          <span className="font-semibold text-navy">Total</span>
          <span className="font-bold text-navy">{formatARS(subtotal)}</span>
        </div>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <button
          onClick={pagar}
          disabled={loading}
          className="mt-4 w-full rounded-full bg-copper py-3 font-semibold text-white transition hover:bg-copper-light disabled:opacity-60"
        >
          {loading ? "Generando pedido…" : "Pagar"}
        </button>
        <button
          onClick={clear}
          className="mt-2 w-full rounded-full py-2 text-sm text-muted hover:text-danger"
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  );
}
