"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarMail, mailPedidoListo, mailPagoConfirmado } from "@/lib/email";
import type { EstadoPedido, EstadoRevision } from "@/lib/types";

export async function cambiarEstado(pedidoId: string, estado: EstadoPedido) {
  const supabase = await createClient();
  if (!supabase) return { error: "No configurado" };
  // RLS: pedidos_update_owner -> solo el owner/admin del local puede actualizar
  const { error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", pedidoId);
  if (error) return { error: error.message };

  // Aviso por mail al cliente (listo / pago confirmado)
  if (estado === "listo" || estado === "confirmado") {
    await notificarPorMail(pedidoId, estado);
  }

  revalidatePath("/admin-local/pedidos");
  revalidatePath("/admin-local");
  return { ok: true };
}

async function notificarPorMail(pedidoId: string, estado: "listo" | "confirmado") {
  try {
    const admin = createAdminClient();
    const { data: ped } = await admin
      .from("pedidos")
      .select("email_cliente, horario_retiro, local_id")
      .eq("id", pedidoId)
      .maybeSingle();
    if (!ped?.email_cliente) return;

    const { data: local } = await admin
      .from("locales")
      .select("nombre, direccion")
      .eq("id", ped.local_id)
      .maybeSingle();
    const nombreLocal = local?.nombre ?? "el local";

    const mail =
      estado === "listo"
        ? mailPedidoListo({ local: nombreLocal, horario: ped.horario_retiro, direccion: local?.direccion })
        : mailPagoConfirmado({ local: nombreLocal, horario: ped.horario_retiro });

    await enviarMail({ to: ped.email_cliente, ...mail });
  } catch {
    /* no bloquear el cambio de estado por un fallo de mail */
  }
}

export async function cambiarRevision(
  pedidoId: string,
  estado_revision: EstadoRevision,
  motivo_revision?: string
) {
  const supabase = await createClient();
  if (!supabase) return { error: "No configurado" };
  const { error } = await supabase
    .from("pedidos")
    .update({ estado_revision, motivo_revision: motivo_revision ?? null })
    .eq("id", pedidoId);
  if (error) return { error: error.message };
  revalidatePath("/admin-local/pedidos");
  return { ok: true };
}
