"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatARS } from "@/lib/format";
import { EstadoBadge } from "./estado-badge";
import { cambiarEstado, cambiarRevision } from "@/app/admin-local/(panel)/pedidos/actions";
import type { EstadoPedido, EstadoRevision, ItemPedido, Pedido } from "@/lib/types";

const REVISIONES: { v: EstadoRevision; label: string; cls: string }[] = [
  { v: "comprobado", label: "Comprobado", cls: "bg-green-50 text-green-700 border-green-200" },
  { v: "revisado", label: "Revisado", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  { v: "rechazado", label: "Rechazado", cls: "bg-red-50 text-red-700 border-red-200" },
];

const SIGUIENTE: Partial<Record<EstadoPedido, { a: EstadoPedido; label: string }>> = {
  confirmado: { a: "en_preparacion", label: "Marchar" },
  en_preparacion: { a: "listo", label: "Marcar listo" },
  listo: { a: "retirado", label: "Entregado" },
  sospechoso: { a: "confirmado", label: "Aprobar igual" },
};

export function PedidosBoard({
  localId,
  inicial,
}: {
  localId: string;
  inicial: Pedido[];
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>(inicial);
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [cargandoComp, setCargandoComp] = useState(false);
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  // Realtime: nuevos pedidos y cambios de estado
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`pedidos-${localId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos", filter: `local_id=eq.${localId}` },
        (payload) => {
          setPedidos((prev) => {
            const row = payload.new as Pedido;
            if (payload.eventType === "INSERT") return [row, ...prev];
            if (payload.eventType === "UPDATE")
              return prev.map((p) => (p.id === row.id ? row : p));
            if (payload.eventType === "DELETE")
              return prev.filter((p) => p.id !== (payload.old as Pedido).id);
            return prev;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [localId]);

  async function verComprobante(pedidoId: string) {
    setCargandoComp(true);
    setComprobante(null);
    try {
      const r = await fetch(`/api/admin/comprobante/${pedidoId}`);
      const d = await r.json();
      if (d.base64) setComprobante(d.base64);
      else alert(d.error ?? "No se pudo abrir el comprobante");
    } finally {
      setCargandoComp(false);
    }
  }

  function avanzar(p: Pedido) {
    const next = SIGUIENTE[p.estado];
    if (!next) return;
    startTransition(() => {
      cambiarEstado(p.id, next.a);
    });
  }

  function rechazar(p: Pedido) {
    startTransition(() => {
      cambiarEstado(p.id, "rechazado");
    });
  }

  function marcarRevision(p: Pedido, v: EstadoRevision) {
    const motivo = motivos[p.id] ?? p.motivo_revision ?? "";
    // Optimista
    setPedidos((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, estado_revision: v, motivo_revision: motivo || null } : x
      )
    );
    startTransition(() => {
      cambiarRevision(p.id, v, motivo || undefined);
    });
  }

  if (pedidos.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-brdr bg-white p-10 text-center text-muted">
        Todavía no hay pedidos.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {pedidos.map((p) => {
          const items = (p.items ?? []) as ItemPedido[];
          const next = SIGUIENTE[p.estado];
          return (
            <div key={p.id} className="rounded-card border border-brdr bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">
                    #{p.id.slice(0, 8)}
                  </span>
                  <EstadoBadge estado={p.estado} />
                  <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-cream">
                    Retiro {p.horario_retiro}
                  </span>
                </div>
                <span className="font-bold text-navy">
                  {formatARS(Number(p.total))}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-navy/80">
                {items.map((i) => (
                  <span key={i.plato_id}>
                    {i.cantidad}× {i.nombre}
                  </span>
                ))}
              </div>

              {(p.nombre_cliente || p.telefono_cliente) && (
                <p className="mt-2 text-xs text-muted">
                  {p.nombre_cliente}
                  {p.telefono_cliente ? ` · ${p.telefono_cliente}` : ""}
                </p>
              )}

              {p.especificaciones && (
                <p className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy">
                  📝 <span className="font-medium">Aclaraciones:</span>{" "}
                  {p.especificaciones}
                </p>
              )}

              {p.desfasaje_precio !== 0 && (
                <p
                  className={`mt-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    p.desfasaje_precio < 0
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {p.desfasaje_precio < 0
                    ? `⚠️ Pagó ${formatARS(Math.abs(p.desfasaje_precio))} de MENOS`
                    : `Pagó ${formatARS(p.desfasaje_precio)} de más`}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {p.estado !== "pendiente_pago" && (
                  <button
                    onClick={() => verComprobante(p.id)}
                    disabled={cargandoComp}
                    className="rounded-full border border-brdr px-3 py-1.5 text-sm font-medium text-navy hover:bg-navy-50"
                  >
                    📄 Ver comprobante
                  </button>
                )}
                {next && (
                  <button
                    onClick={() => avanzar(p)}
                    className="rounded-full bg-copper px-4 py-1.5 text-sm font-semibold text-white hover:bg-copper-light"
                  >
                    {next.label}
                  </button>
                )}
                {(p.estado === "sospechoso" || p.estado === "verificando") && (
                  <button
                    onClick={() => rechazar(p)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-danger hover:bg-red-50"
                  >
                    Rechazar
                  </button>
                )}
              </div>

              {/* Revisión manual del comprobante */}
              {p.estado !== "pendiente_pago" && (
                <div className="mt-3 border-t border-brdr pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted">Revisión:</span>
                    {REVISIONES.map((r) => {
                      const sel = p.estado_revision === r.v;
                      return (
                        <button
                          key={r.v}
                          onClick={() => marcarRevision(p, r.v)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            sel ? r.cls : "border-brdr text-muted hover:bg-navy-50"
                          }`}
                        >
                          {sel ? "● " : ""}
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={motivos[p.id] ?? p.motivo_revision ?? ""}
                    onChange={(e) =>
                      setMotivos((m) => ({ ...m, [p.id]: e.target.value }))
                    }
                    placeholder="Motivo de la revisión (opcional)…"
                    className="mt-2 w-full rounded-lg border border-brdr bg-white px-3 py-1.5 text-sm outline-none focus:border-navy"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal comprobante */}
      {comprobante && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setComprobante(null)}
        >
          <div
            className="max-h-[90vh] max-w-lg overflow-auto rounded-card bg-white p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={comprobante} alt="Comprobante" className="rounded-lg" />
            <button
              onClick={() => setComprobante(null)}
              className="mt-2 w-full rounded-full bg-navy py-2 text-sm font-semibold text-cream"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
