export const metadata = { title: "Términos y condiciones — DUTI" };

export default function Terminos() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Términos y condiciones</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>
          DUTI es una plataforma que conecta a usuarios con locales de comida
          para realizar pedidos y retirarlos en el horario elegido. El pago se
          realiza por transferencia bancaria directa al local.
        </p>
        <p>
          DUTI no procesa pagos: actúa como intermediario tecnológico y verifica
          los comprobantes de transferencia. La preparación y entrega del pedido
          es responsabilidad exclusiva de cada local.
        </p>
        <p>
          El uso de comprobantes falsos o adulterados está prohibido y puede
          derivar en la cancelación del pedido y la suspensión de la cuenta.
        </p>
        <p>Documento preliminar, sujeto a revisión legal.</p>
      </div>
    </div>
  );
}
