"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Refresca la vista en vivo cuando cambia el estado de un pedido.
// Pasá userId (todos los pedidos del usuario) o pedidoId (uno solo).
export function PedidosRealtime({ userId, pedidoId }: { userId?: string; pedidoId?: string }) {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const filter = pedidoId ? `id=eq.${pedidoId}` : userId ? `usuario_id=eq.${userId}` : null;
    if (!filter) return;
    const channel = supabase
      .channel(`pedidos-rt-${pedidoId ?? userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedidos", filter },
        () => router.refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, pedidoId, router]);
  return null;
}
