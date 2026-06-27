"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession, getLocalDelOwner } from "@/lib/auth";

async function localIdDelOwner(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  const local = await getLocalDelOwner(session);
  return local?.id ?? null;
}

export interface PlatoInput {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  foto_url: string;
  disponible: boolean;
}

export async function guardarPlato(input: PlatoInput) {
  const supabase = await createClient();
  if (!supabase) return { error: "No configurado" };
  const localId = await localIdDelOwner();
  if (!localId) return { error: "Tu cuenta no está vinculada a un local." };

  if (!input.nombre.trim()) return { error: "El plato necesita un nombre." };
  if (!(input.precio >= 0)) return { error: "Precio inválido." };

  const fila = {
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim() || null,
    precio: input.precio,
    categoria: input.categoria.trim() || null,
    foto_url: input.foto_url.trim() || null,
    disponible: input.disponible,
  };

  // RLS (platos_write_owner) garantiza que solo el dueño del local edite.
  const { error } = input.id
    ? await supabase.from("platos").update(fila).eq("id", input.id).eq("local_id", localId)
    : await supabase.from("platos").insert({ ...fila, local_id: localId });

  if (error) return { error: error.message };
  revalidatePath("/admin-local/menu");
  return { ok: true };
}

export async function togglePlato(id: string, disponible: boolean) {
  const supabase = await createClient();
  if (!supabase) return { error: "No configurado" };
  const { error } = await supabase.from("platos").update({ disponible }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin-local/menu");
  return { ok: true };
}

export async function borrarPlato(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "No configurado" };
  const { error } = await supabase.from("platos").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin-local/menu");
  return { ok: true };
}

export interface PlatoBulk {
  nombre: string;
  precio: number;
  descripcion?: string;
  categoria?: string;
  disponible?: boolean;
}

export async function importarPlatos(platos: PlatoBulk[]) {
  const supabase = await createClient();
  if (!supabase) return { error: "No configurado" };
  const localId = await localIdDelOwner();
  if (!localId) return { error: "Tu cuenta no está vinculada a un local." };

  const filas = (platos || [])
    .filter((p) => p && p.nombre?.trim() && Number.isFinite(p.precio) && p.precio >= 0)
    .map((p) => ({
      local_id: localId,
      nombre: p.nombre.trim(),
      precio: p.precio,
      descripcion: p.descripcion?.trim() || null,
      categoria: p.categoria?.trim() || null,
      disponible: p.disponible ?? true,
    }));

  if (filas.length === 0) return { error: "No hay filas válidas para importar." };

  // RLS (platos_write_owner) garantiza que se carguen solo en el local del dueño.
  const { error } = await supabase.from("platos").insert(filas);
  if (error) return { error: error.message };
  revalidatePath("/admin-local/menu");
  return { ok: true, count: filas.length };
}
