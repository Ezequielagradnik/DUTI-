"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatARS } from "@/lib/format";
import { HoraPicker, horaInicial } from "@/components/hora-picker";
import type { Local } from "@/lib/types";

export default function CarritoPage() {
  const { items, localId, subtotal, count, setCantidad, remove, clear } = useCart();
  const router = useRouter();

  const [local, setLocal] = useState<Local | null>(null);
  const [hora, setHora] = useState<string>("");
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
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
        if (d.local) {
          setHora(
            horaInicial(
              d.local.tiempo_estimado_min,
              d.local.horario_apertura,
              d.local.horario_cierre
            )
          );
        }
      })
      .catch(() => {});
  }, [localId]);

  async function pagar() {
    setError(null);
    if (!hora) return setError("Elegí un horario de retiro.");
    if (!alias.trim()) return setError("Ingresá el alias desde el que vas a transferir.");
    if (!email.trim() || !email.includes("@")) return setError("Ingresá un email válido.");
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
          horario_retiro: hora,
          alias_cliente: alias.trim(),
          email_cliente: email.trim(),
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
        <p className="mt-2 text-muted">
          Entrá al link de tu local favorito y sumá platos para empezar.
        </p>
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

      {/* Horario de retiro (reloj tipo alarma, de 5 en 5) */}
      <div className="mt-8">
        <h2 className="font-semibold text-navy">¿A qué hora lo pasás a buscar?</h2>
        <div className="mt-3 flex justify-center sm:justify-start">
          {hora ? (
            <HoraPicker
              value={hora}
              onChange={setHora}
              apertura={local?.horario_apertura ?? null}
              cierre={local?.horario_cierre ?? null}
            />
          ) : (
            <p className="text-sm text-muted">Cargando horarios…</p>
          )}
        </div>
      </div>

      {/* Datos */}
      <div className="mt-8 space-y-3">
        <div>
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Tu alias de Mercado Pago *"
            className="w-full rounded-xl border border-brdr bg-white px-4 py-3 outline-none focus:border-navy"
          />
          <p className="mt-1 px-1 text-xs text-muted">
            El alias de <strong>tu</strong> cuenta (desde donde vas a transferir).
            Lo usamos para verificar que el pago sea tuyo.
          </p>
        </div>
        <div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Tu email *"
            className="w-full rounded-xl border border-brdr bg-white px-4 py-3 outline-none focus:border-navy"
          />
          <p className="mt-1 px-1 text-xs text-muted">
            Te mandamos la confirmación y te avisamos cuando tu pedido esté listo.
          </p>
        </div>
        <div>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono (opcional)"
            className="w-full rounded-xl border border-brdr bg-white px-4 py-3 outline-none focus:border-navy"
          />
          <p className="mt-1 px-1 text-xs text-muted">
            Opcional: por si el local necesita contactarte por tu pedido.
          </p>
        </div>
        <textarea
          value={especificaciones}
          onChange={(e) => setEspecificaciones(e.target.value)}
          placeholder="Aclaraciones para el local (ej. sin cebolla, bien cocido…)"
          rows={2}
          className="w-full rounded-xl border border-brdr bg-white px-4 py-3 outline-none focus:border-navy"
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
