import Link from "next/link";
import { HeroClock } from "@/components/hero-clock";

const PASOS = [
  { n: "1", titulo: "Elegí tu local", desc: "Mirá los locales disponibles y armá tu pedido desde el menú." },
  { n: "2", titulo: "Pagá por transferencia", desc: "Te mostramos el alias y el monto exacto. Subís el comprobante." },
  { n: "3", titulo: "Verificación automática", desc: "Nuestra IA valida el comprobante al instante. Sin esperas." },
  { n: "4", titulo: "Retirá a tu horario", desc: "Elegís la franja de retiro y la cocina lo tiene listo para esa hora." },
];

export default function Home() {
  return (
    <>
      {/* Bloque con fondo degradé continuo: Hero + Cómo funciona */}
      <div className="relative -mt-[72px] overflow-hidden pt-[72px] md:-mt-[96px] md:pt-[96px]">
        {/* Fondo continuo (cubre detrás del header y se funde hacia abajo) */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_55%_at_80%_-2%,#e7eef6_0%,#faf8f5_45%,#f6ece4_100%)]" />
        {/* Fade final hacia cream para empalmar con la sección siguiente */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-cream" />
        {/* Blobs */}
        <div className="animate-blob absolute -left-24 top-10 -z-10 h-80 w-80 rounded-full bg-copper/20 blur-3xl" />
        <div className="animate-blob absolute -right-10 top-40 -z-10 h-96 w-96 rounded-full bg-navy/10 blur-3xl [animation-delay:-7s]" />

        {/* Hero */}
        <section className="relative">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-20">
            <div className="relative z-10 animate-[fadeUp_0.8s_ease-out]">
              <span className="inline-flex items-center gap-2 rounded-full border border-copper/20 bg-white/70 px-4 py-1.5 text-sm font-semibold text-copper-600 backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-copper" />
                Pedí, pagá y retirá a horario
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-[1.03] tracking-tight text-navy md:text-7xl">
                Tu comida lista{" "}
                <span className="bg-gradient-to-r from-copper via-copper-light to-copper bg-[length:200%_auto] bg-clip-text text-transparent [animation:shine_4s_linear_infinite]">
                  justo cuando la querés.
                </span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted">
                DUTI conecta tus locales favoritos con vos. Pagás por
                transferencia, la IA verifica el pago al toque y elegís la hora
                exacta para pasar a buscarlo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/locales" className="group rounded-full bg-navy px-7 py-3.5 font-semibold text-cream shadow-lg shadow-navy/25 transition hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-xl">
                  Ver locales
                  <span className="ml-2 inline-block transition group-hover:translate-x-1">→</span>
                </Link>
                <Link href="/como-funciona" className="rounded-full border border-navy/15 bg-white/60 px-7 py-3.5 font-semibold text-navy backdrop-blur transition hover:bg-white">
                  Cómo funciona
                </Link>
              </div>
            </div>

            <div className="relative">
              <HeroClock />
            </div>
          </div>
        </section>

        {/* Cómo funciona (mismo fondo) */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-4">
          <h2 className="text-center text-3xl font-bold text-navy">Cómo funciona</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {PASOS.map((p) => (
              <div key={p.n} className="group rounded-card border border-brdr bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-copper text-lg font-bold text-white transition group-hover:scale-110">
                  {p.n}
                </div>
                <h3 className="mt-4 font-semibold text-navy">{p.titulo}</h3>
                <p className="mt-2 text-sm text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy to-navy-700 px-8 py-14 text-center text-cream">
          <div className="animate-blob absolute -right-10 -top-10 h-60 w-60 rounded-full bg-copper/30 blur-3xl" />
          <h2 className="relative text-3xl font-bold">¿Listo para pedir?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-cream/70">
            Explorá los locales disponibles y armá tu pedido en minutos.
          </p>
          <Link href="/locales" className="relative mt-7 inline-block rounded-full bg-copper px-8 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-copper-light">
            Ver locales
          </Link>
        </div>
      </section>
    </>
  );
}
