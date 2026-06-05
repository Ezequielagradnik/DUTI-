"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatARS } from "@/lib/format";
import type { Plato } from "@/lib/types";

export function PlatoCard({ plato }: { plato: Plato }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(plato.local_id, {
      plato_id: plato.id,
      nombre: plato.nombre,
      precio: Number(plato.precio),
      foto_url: plato.foto_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="flex gap-4 rounded-card border border-brdr bg-white p-3 shadow-sm">
      {plato.foto_url && (
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-navy-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={plato.foto_url}
            alt={plato.nombre}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <h3 className="font-semibold text-navy">{plato.nombre}</h3>
        {plato.descripcion && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted">
            {plato.descripcion}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-navy">
            {formatARS(Number(plato.precio))}
          </span>
          <button
            onClick={handleAdd}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white transition ${
              added ? "bg-success" : "bg-copper hover:bg-copper-light"
            }`}
          >
            {added ? "✓ Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
