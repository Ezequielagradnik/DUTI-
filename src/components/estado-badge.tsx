import type { EstadoPedido } from "@/lib/types";

const MAP: Record<EstadoPedido, { label: string; cls: string }> = {
  pendiente_pago: { label: "Esperando pago", cls: "bg-zinc-100 text-zinc-600" },
  verificando: { label: "Verificando", cls: "bg-blue-50 text-blue-600" },
  confirmado: { label: "Confirmado", cls: "bg-green-50 text-green-700" },
  sospechoso: { label: "🟡 Sospechoso", cls: "bg-amber-50 text-amber-700" },
  rechazado: { label: "🔴 Rechazado", cls: "bg-red-50 text-red-700" },
  en_preparacion: { label: "En preparación", cls: "bg-copper-50 text-copper-600" },
  listo: { label: "Listo", cls: "bg-emerald-50 text-emerald-700" },
  retirado: { label: "Retirado", cls: "bg-zinc-100 text-zinc-500" },
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const e = MAP[estado] ?? MAP.pendiente_pago;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${e.cls}`}>
      {e.label}
    </span>
  );
}
