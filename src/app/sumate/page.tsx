import Link from "next/link";

export const metadata = { title: "Sumá tu local — DUTI" };

const VENTAJAS = [
  ["100% de tu venta", "Cobrás directo a tu alias por transferencia. Sin comisión de pasarela de pago."],
  ["Verificación automática", "La IA valida cada comprobante. Vos solo cociná."],
  ["Pedidos a horario", "Tus clientes eligen franjas de retiro. Organizás mejor la cocina."],
  ["Panel en tiempo real", "Mirá los pedidos entrar y cambiá su estado con un toque."],
];

export default function Sumate() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <span className="rounded-full bg-copper-50 px-3 py-1 text-sm font-semibold text-copper-600">
        Para restaurantes
      </span>
      <h1 className="mt-4 text-4xl font-bold text-navy">
        Sumá tu local a DUTI
      </h1>
      <p className="mt-3 max-w-xl text-lg text-muted">
        Vendé tu comida online, cobrá por transferencia sin perder comisión y
        dejá que la IA verifique los pagos por vos.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {VENTAJAS.map(([t, d]) => (
          <div key={t} className="rounded-card border border-brdr bg-white p-5">
            <h2 className="font-semibold text-navy">{t}</h2>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-card bg-navy p-8 text-center text-cream">
        <h2 className="text-2xl font-bold">¿Querés empezar?</h2>
        <p className="mt-2 text-cream/70">
          Escribinos y te damos de alta tu local en DUTI.
        </p>
        <Link
          href="/contacto"
          className="mt-5 inline-block rounded-full bg-copper px-6 py-3 font-semibold text-white hover:bg-copper-light"
        >
          Contactar
        </Link>
      </div>
    </div>
  );
}
