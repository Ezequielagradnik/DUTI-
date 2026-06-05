"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  if (!supabase) redirect("/admin-local/login?error=Supabase%20no%20configurado");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin-local/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin-local");
}

export async function registro(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  if (!supabase) redirect("/admin-local/login?error=Supabase%20no%20configurado");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/admin-local/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin-local/login?msg=Cuenta%20creada.%20Ingres%C3%A1%20para%20continuar.");
}

export async function logout() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin-local/login");
}
