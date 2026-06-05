import { getSession, getLocalDelOwner } from "@/lib/auth";
import { getPedidosDelLocal } from "@/lib/panel-data";
import { PedidosBoard } from "@/components/pedidos-board";

export const dynamic = "force-dynamic";

export default async function PedidosPanelPage() {
  const session = await getSession();
  const local = session ? await getLocalDelOwner(session) : null;
  if (!local) return null; // el layout ya muestra el aviso

  const pedidos = await getPedidosDelLocal(local.id);

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-navy">Pedidos</h1>
        <p className="text-sm text-muted">
          Entran en tiempo real. Tocá un comprobante para verlo.
        </p>
      </header>
      <PedidosBoard localId={local.id} inicial={pedidos} />
    </div>
  );
}
