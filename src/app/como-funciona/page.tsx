export const metadata = { title: "Cómo funciona — DUTI" };

const PASOS = [
  ["Elegí tu local", "Explorá los locales disponibles y mirá su menú con fotos y precios."],
  ["Armá tu pedido", "Sumá platos al carrito. Se guarda mientras navegás."],
  ["Elegí tu horario", "Seleccioná la franja de retiro según la disponibilidad del local."],
  ["Pagá por transferencia", "Te mostramos el alias y el monto exacto (con centavos únicos)."],
  ["Subí el comprobante", "Sacás captura de la transferencia y la subís a la página."],
  ["Verificación con IA", "Nuestro sistema valida que el comprobante sea real y el monto correcto."],
  ["Retirá a horario", "Cuando se confirma, la cocina lo prepara para la hora que elegiste."],
];

export default function ComoFunciona() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Cómo funciona DUTI</h1>
      <p className="mt-2 text-muted">
        Pedí, pagá por transferencia y retirá tu comida a la hora exacta. Sin
        apps, sin comisiones de pasarela, con verificación automática.
      </p>
      <ol className="mt-8 space-y-4">
        {PASOS.map(([t, d], i) => (
          <li key={t} className="flex gap-4 rounded-card border border-brdr bg-white p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-copper font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold text-navy">{t}</h2>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
