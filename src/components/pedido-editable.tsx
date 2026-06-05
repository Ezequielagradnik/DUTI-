"use client";

import { useState } from "react";
import Link from "next/link";
import { formatARS } from "@/lib/format";
import { EstadoBadge } from "./estado-badge";
import type { ItemPedido, Pedido, Plato } from "@/lib/types";

export function PedidoEditable({ pedido }: { pedido: Pedido }) {
  const [items, setItems] = useState<ItemPedido[]>(pedido.items ?? []);
  const [total, setTotal] = useState<number>(Number(pedido.total));
  const [eliminado, setEliminado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState<Plato[] | null>(null);
  const [abrirMenu, setAbrirMenu] = useState(false);

  async function persistir(next: ItemPedido[]) {
    setSaving(true);
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: next.map((i) => ({ plato_id: i.plato_id, cantidad: i.cantidad })),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No se pudo actualizar.");
      if (d.deleted) {
        setEliminado(true);
        return;
      }
      setItems(d.items);
      setTotal(d.total);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  function setCantidad(platoId: string, cantidad: number) {
    const next = items
      .map((i) => (i.plato_id === platoId ? { ...i, cantidad } : i))
      .filter((i) => i.cantidad > 0);
    persistir(next);
  }

  function agregar(p: Plato) {
    const existe = items.find((i) => i.plato_id === p.id);
    const next = existe
      ? items.map((i) => (i.plato_id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...items, { plato_id: p.id, nombre: p.nombre, precio: Number(p.precio), cantidad: 1 }];
    setAbrirMenu(false);
    persistir(next);
  }

  async function toggleMenu() {
    setAbrirMenu((v) => !v);
    if (!menu) {
      const r = await fetch(`/api/locales/${pedido.local_id}`);
      const d = await r.json();
      setMenu(d.platos ?? []);
    }
  }

  if (eliminado) {
    return (
      <div className="rounded-card border border-dashed border-brdr bg-white p-4 text-center text-sm text-muted">
        Pedido cancelado.
      </div>
    );
  }

  return (
    <div className="rounded-card border border-copper/40 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted">#{pedido.id.slice(0, 8)}</span>
          <EstadoBadge estado={pedido.estado} />
        </div>
        <span className="font-bold text-navy">{formatARS(total)}</span>
      </div>

      {/* Items editables */}
      <div className="mt-3 space-y-2">
        {items.map((i) => (
          <div key={i.plato_id} className="flex items-center gap-3 text-sm">
            <span className="flex-1 text-navy">{i.nombre}</span>
            <span className="text-muted">{formatARS(i.precio)}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCantidad(i.plato_id, i.cantidad - 1)}
                disabled={saving}
                className="grid h-7 w-7 place-items-center rounded-full border border-brdr text-navy hover:bg-navy-50 disabled:opacity-50"
              >
                −
              </button>
              <span className="w-5 text-center font-semibold">{i.cantidad}</span>
              <button
                onClick={() => setCantidad(i.plato_id, i.cantidad + 1)}
                disabled={saving}
                className="grid h-7 w-7 place-items-center rounded-full border border-brdr text-navy hover:bg-navy-50 disabled:opacity-50"
              >
                +
              </button>
            </div>
            <button
              onClick={() => setCantidad(i.plato_id, 0)}
              disabled={saving}
              className="text-muted hover:text-danger"
              aria-label="Quitar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Agregar plato */}
      <div className="mt-3">
        <button
          onClick={toggleMenu}
          className="rounded-full border border-brdr px-4 py-1.5 text-sm font-semibold text-navy hover:bg-navy-50"
        >
          + Agregar plato
        </button>
        {abrirMenu && (
          <div className="mt-2 max-h-52 overflow-auto rounded-xl border border-brdr">
            {!menu && <p className="p-3 text-sm text-muted">Cargando menú…</p>}
            {menu?.map((p) => (
              <button
                key={p.id}
                onClick={() => agregar(p)}
                className="flex w-full items-center justify-between border-b border-brdr px-3 py-2 text-left text-sm last:border-0 hover:bg-navy-50"
              >
                <span className="text-navy">{p.nombre}</span>
                <span className="text-muted">{formatARS(Number(p.precio))}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="mt-4 flex items-center gap-2 border-t border-brdr pt-3">
        <Link
          href={`/pago/${pedido.id}`}
          className="rounded-full bg-copper px-5 py-2 text-sm font-semibold text-white hover:bg-copper-light"
        >
          Ir a pagar →
        </Link>
        <button
          onClick={() => persistir([])}
          disabled={saving}
          className="rounded-full px-3 py-2 text-sm text-muted hover:text-danger"
        >
          Cancelar pedido
        </button>
      </div>
    </div>
  );
}
