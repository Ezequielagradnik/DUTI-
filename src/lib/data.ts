import "server-only";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import type { Local, Plato, Slot, Pedido } from "./types";

// ============================================================
// Lecturas públicas (anon + RLS)
// ============================================================

export async function getLocales(): Promise<Local[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("locales")
    .select("*")
    .eq("activo", true)
    .order("nombre");
  if (error) throw error;
  return data ?? [];
}

export async function getLocalBySlug(slug: string): Promise<Local | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("locales")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLocalById(id: string): Promise<Local | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("locales")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPlatosByLocal(localId: string): Promise<Plato[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("platos")
    .select("*")
    .eq("local_id", localId)
    .eq("disponible", true)
    .order("orden")
    .order("nombre");
  if (error) throw error;
  return data ?? [];
}

export async function getSlotsByLocal(localId: string): Promise<Slot[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .eq("local_id", localId)
    .eq("activo", true)
    .order("hora");
  if (error) throw error;
  // ocupados se calcula aparte; por ahora 0 (lo refina el panel del local).
  return (data ?? []).map((s) => ({ ...s, ocupados: 0 }));
}

// ============================================================
// Pedidos (service_role, server-only)
// ============================================================

export async function getPedidoById(id: string): Promise<Pedido | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pedidos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Pedido | null;
}
