import Link from "next/link";

export const metadata = { title: "Sumá tu local — DUTI" };

const MAXI_EMAIL = "maxiglusman@gmail.com";
const MAXI_WSP = "5491134307269"; // +54 9 11 3430-7269

const BENEFICIOS = [
  ["💰", "Cobrás el 100%", "La plata va directo a tu alias por transferencia. Sin comisión de pasarela de pago."],
  ["🤖", "Verificación automática", "La IA chequea cada comprobante (monto, alias, fecha y si es real). Vos solo cociná."],
  ["🕒", "Pedidos a horario", "Tus clientes eligen la franja de retiro. Organizás la cocina y evitás filas."],
  ["📊", "Panel completo", "Pedidos en tiempo real, ventas del día/semana/mes y tus platos más vendidos."],
  ["🚫", "Sin trámites de MP", "No dependés de aprobaciones de marketplace ni esperas de una semana."],
  ["🔒", "Anti-fraude", "Detectamos comprobantes falsos o reusados antes de que prepares el pedido."],
];

export default function Sumate() {
  return (
    <div className="relative -mt-[72px] overflow-hidden pt-[72px] md:-mt-[96px] md:pt-[96px]">
      {/* Degradé celeste que cubre también detrás del header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(100%_70%_at_50%_0%,#e7eef6_0%,#faf8f5_70%,transparent_100%)]" />
      {/* Hero */}
      <section className="relative px-4 pb-16 pt-16 text-center md:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-copper/20 bg-white/70 px-4 py-1.5 text-sm font-semibold text-copper-600 backdrop-blur">
          Para restaurantes
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-navy md:text-6xl">
          Sumá tu local al{" "}
          <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
            equipo DUTI
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Vendé tu comida online, cobrá el 100% por transferencia y dejá que la
          IA verifique los pagos por vos. Hay un montón de beneficios en sumarte.
        </p>
        <a
          href={`https://wa.me/${MAXI_WSP}?text=${encodeURIComponent("Hola Maxi! Quiero sumar mi local a DUTI 🍽️")}`}
          className="mt-8 inline-block rounded-full bg-copper px-8 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-copper-light"
        >
          Quiero sumarme
        </a>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-navy">
          Beneficios de estar en DUTI
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map(([icon, t, d]) => (
            <div key={t} className="rounded-card border border-brdr bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-50 text-xl">{icon}</span>
              <h3 className="mt-4 font-semibold text-navy">{t}</h3>
              <p className="mt-1.5 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-[2rem] bg-gradient-to-br from-navy to-navy-700 p-10 text-center text-cream">
          <h2 className="text-3xl font-bold">¡Contactanos!</h2>
          <p className="mx-auto mt-3 max-w-md text-cream/70">
            Escribinos y te damos de alta tu local en DUTI. Te creamos tu usuario
            y empezás a recibir pedidos.
          </p>
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
            <a
              href={`https://wa.me/${MAXI_WSP}?text=${encodeURIComponent("Hola Maxi! Quiero sumar mi local a DUTI 🍽️")}`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#1ebe5b]"
            >
              <span className="text-lg">💬</span> WhatsApp
            </a>
            <a
              href={`mailto:${MAXI_EMAIL}?subject=${encodeURIComponent("Quiero sumar mi local a DUTI")}`}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-white/10 px-5 py-4 text-sm font-semibold text-cream ring-1 ring-white/20 transition hover:bg-white/20 sm:text-base"
            >
              <span className="text-lg">✉️</span> {MAXI_EMAIL}
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tenés tu local en DUTI?{" "}
          <Link href="/admin-local" className="font-semibold text-copper hover:underline">
            Entrá a tu panel
          </Link>
        </p>
      </section>
    </div>
  );
}
