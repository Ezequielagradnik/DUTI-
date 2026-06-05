"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginCliente(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/mis-pedidos");

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20no%20configurado");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect(next);
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
