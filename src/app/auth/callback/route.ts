import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Callback de OAuth (Google): canjea el código por sesión y redirige según rol.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  const supabase = await createClient();
  if (!supabase || !code) {
    return NextResponse.redirect(new URL("/login?error=No%20se%20pudo%20iniciar%20sesi%C3%B3n", url.origin));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error?.message ?? "Error de autenticación")}`, url.origin)
    );
  }

  // Destino explícito (ej. venía de un guard)
  if (next) return NextResponse.redirect(new URL(next, url.origin));

  // Según rol
  const { data: prof } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", data.user.id)
    .maybeSingle();

  const destino =
    prof?.rol === "admin" ? "/admin" : prof?.rol === "local" ? "/admin-local" : "/mis-pedidos";
  return NextResponse.redirect(new URL(destino, url.origin));
}
