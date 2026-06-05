"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstadoPedido } from "@/lib/types";

export async function cambiarEstado(pedidoId: string, estado: EstadoPedido) {
  const supabase = await createClient();
  if (!supabase) return { error: "No configurado" };
  // RLS: pedidos_update_owner -> solo el owner/admin del local puede actualizar
  const { error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", pedidoId);
  if (error) return { error: error.message };
  revalidatePath("/admin-local/pedidos");
  revalidatePath("/admin-local");
  return { ok: true };
}
