import "server-only";
import { createClient } from "./supabase/server";
import type { Local } from "./types";

export interface SessionInfo {
  userId: string;
  email: string | null;
  nombre: string | null;
  rol: "cliente" | "local" | "admin";
  localId: string | null;
}

/** Devuelve la sesión + perfil del usuario logueado, o null. */
export async function getSession(): Promise<SessionInfo | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, rol, local_id")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    nombre: profile?.nombre ?? null,
    rol: (profile?.rol as SessionInfo["rol"]) ?? "cliente",
    localId: profile?.local_id ?? null,
  };
}

/**
 * Devuelve el local que administra el usuario logueado.
 * - rol 'local': su local_id
 * - rol 'admin': el primer local (o por query param en el futuro)
 */
export async function getLocalDelOwner(
  session: SessionInfo
): Promise<Local | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  if (session.rol === "local" && session.localId) {
    const { data } = await supabase
      .from("locales")
      .select("*")
      .eq("id", session.localId)
      .maybeSingle();
    return data;
  }

  if (session.rol === "admin") {
    const { data } = await supabase
      .from("locales")
      .select("*")
      .order("nombre")
      .limit(1)
      .maybeSingle();
    return data;
  }

  return null;
}
