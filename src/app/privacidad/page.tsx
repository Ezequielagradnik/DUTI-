export const metadata = { title: "Política de privacidad — DUTI" };

export default function Privacidad() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Política de privacidad</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>
          En DUTI recopilamos los datos mínimos necesarios para procesar tu
          pedido: nombre, teléfono (opcional) y el comprobante de transferencia.
        </p>
        <p>
          Los comprobantes se almacenan de forma privada y se usan únicamente
          para verificar el pago. No se comparten con terceros salvo el local
          correspondiente a tu pedido.
        </p>
        <p>
          Podés solicitar la eliminación de tus datos escribiéndonos a
          hola@duti.app.
        </p>
        <p>Documento preliminar, sujeto a revisión legal.</p>
      </div>
    </div>
  );
}
