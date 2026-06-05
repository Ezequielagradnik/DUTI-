"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginCliente(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20no%20configurado");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  // Si vino un destino explícito (ej. desde un guard), lo respetamos.
  if (next) redirect(next);

  // Si no, redirigimos según el rol.
  const { data: prof } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", data.user!.id)
    .maybeSingle();

  if (prof?.rol === "admin") redirect("/admin");
  if (prof?.rol === "local") redirect("/admin-local");
  redirect("/mis-pedidos");
}

export async function registroCliente(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();

  const supabase = await createClient();
  if (!supabase) redirect("/registro?error=Supabase%20no%20configurado");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });
  if (error) redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  redirect("/mis-pedidos");
}

export async function logoutCliente() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
