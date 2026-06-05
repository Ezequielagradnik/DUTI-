import { notFound } from "next/navigation";
import { getPedidoById, getLocalById } from "@/lib/data";
import { ComprobanteUploader } from "@/components/comprobante-uploader";
import { formatARS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PagoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await getPedidoById(id);
  if (!pedido) notFound();
  const local = await getLocalById(pedido.local_id);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">Pagá tu pedido</h1>
      <p className="mt-1 text-muted">
        Transferí el monto exacto al alias y subí el comprobante.
      </p>

      {/* Datos de pago */}
      <div className="mt-6 rounded-card border border-brdr bg-white p-5">
        <div className="flex items-center justify-between border-b border-brdr pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Transferir a</p>
            <p className="text-lg font-bold text-navy">{local?.nombre}</p>
          </div>
          <span className="rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold text-copper-600">
            {pedido.estado === "pendiente_pago" ? "Esperando pago" : pedido.estado}
          </span>
        </div>

        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Alias">
            <CopyValue value={local?.alias_cobro ?? "—"} />
          </Row>
          <Row label="Monto exacto">
            <span className="text-lg font-bold text-copper">
              {formatARS(Number(pedido.total))}
            </span>
          </Row>
          <Row label="Horario de retiro">
            <span className="font-semibold text-navy">{pedido.horario_retiro}</span>
          </Row>
        </dl>

        <p className="mt-4 rounded-lg bg-navy-50 p-3 text-xs text-navy/70">
          ⚠️ Transferí el <strong>monto exacto</strong> (con los centavos). Así
          identificamos tu pago automáticamente.
        </p>
      </div>

      {/* Uploader */}
      <div className="mt-6">
        <ComprobanteUploader pedidoId={pedido.id} />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function CopyValue({ value }: { value: string }) {
  return (
    <span className="rounded-lg bg-navy-50 px-3 py-1 font-mono font-semibold text-navy">
      {value}
    </span>
  );
}
