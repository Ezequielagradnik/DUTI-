import "server-only";
import { createClient } from "./supabase/server";
import type { Pedido } from "./types";

export interface ResumenVentas {
  ventas_hoy: number;
  ventas_semana: number;
  ventas_mes: number;
  pedidos_hoy: number;
  pedidos_mes: number;
  ticket_prom_mes: number;
}

export interface TopPlato {
  nombre: string;
  cantidad: number;
  total: number;
}

/** Pedidos de un local (RLS: solo el owner/admin los ve). */
export async function getPedidosDelLocal(
  localId: string,
  limit = 100
): Promise<Pedido[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  // Excluimos comprobante_base64 (pesado): se trae bajo demanda al verlo.
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, local_id, usuario_id, items, subtotal, total, horario_retiro, estado, estado_revision, motivo_revision, verificacion, nombre_cliente, telefono_cliente, created_at"
    )
    .eq("local_id", localId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Pedido[];
}

export async function getResumenVentas(
  localId: string
): Promise<ResumenVentas | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("resumen_ventas", {
    p_local_id: localId,
  });
  if (error) throw error;
  return data as ResumenVentas;
}

export async function getTopPlatos(
  localId: string,
  desde: Date
): Promise<TopPlato[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("top_platos", {
    p_local_id: localId,
    p_desde: desde.toISOString(),
  });
  if (error) throw error;
  return (data ?? []) as TopPlato[];
}

// ============================================================
// Admin (plataforma)
// ============================================================

export interface ResumenPlataforma {
  ventas_total: number;
  ventas_hoy: number;
  ventas_semana: number;
  ventas_mes: number;
  pedidos_total: number;
  pedidos_hoy: number;
  pedidos_semana: number;
  pedidos_mes: number;
  locales_activos: number;
  comision_total: number;
}

export interface VentaPorLocal {
  local_id: string;
  nombre: string;
  slug: string;
  comision_pct: number;
  pedidos: number;
  ventas: number;
  comision: number;
}

export async function getResumenPlataforma(): Promise<ResumenPlataforma | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("resumen_plataforma");
  if (error) throw error;
  return data as ResumenPlataforma;
}

export async function getVentasPorLocal(): Promise<VentaPorLocal[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("ventas_por_local");
  if (error) throw error;
  return (data ?? []) as VentaPorLocal[];
}
