import { getSession, getLocalDelOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MenuManager } from "@/components/menu-manager";
import type { Plato } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MenuPanel() {
  const session = await getSession();
  const local = session ? await getLocalDelOwner(session) : null;
  if (!local) return null; // el layout ya muestra el aviso

  const supabase = await createClient();
  const { data } = await supabase!
    .from("platos")
    .select("*")
    .eq("local_id", local.id)
    .order("orden")
    .order("nombre");
  const platos = (data ?? []) as Plato[];

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-navy">Menú</h1>
        <p className="text-sm text-muted">{local.nombre} · {platos.length} platos</p>
      </header>
      <MenuManager platosIniciales={platos} />
    </div>
  );
}
