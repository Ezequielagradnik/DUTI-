import Link from "next/link";

const PASOS = [
  {
    n: "1",
    titulo: "Elegí tu local",
    desc: "Mirá los locales disponibles y armá tu pedido desde el menú.",
  },
  {
    n: "2",
    titulo: "Pagá por transferencia",
    desc: "Te mostramos el alias y el monto exacto. Subís el comprobante.",
  },
  {
    n: "3",
    titulo: "Verificación automática",
    desc: "Nuestra IA valida el comprobante al instante. Sin esperas.",
  },
  {
    n: "4",
    titulo: "Retirá a tu horario",
    desc: "Elegís la franja de retiro y la cocina lo tiene listo para esa hora.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-50 to-cream" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-block rounded-full bg-copper-50 px-3 py-1 text-sm font-semibold text-copper-600">
              Pedí, pagá y retirá a horario
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-navy md:text-6xl">
              Tu comida lista{" "}
              <span className="text-copper">justo cuando la querés.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              DUTI conecta tus locales favoritos con vos. Pagás por
              transferencia, la IA verifica el pago al toque y elegís la hora
              exacta para pasar a buscarlo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/locales"
                className="rounded-full bg-navy px-6 py-3 font-semibold text-cream transition hover:bg-navy-700"
              >
                Ver locales
              </Link>
              <Link
                href="/como-funciona"
                className="rounded-full border border-navy/20 px-6 py-3 font-semibold text-navy transition hover:bg-navy-50"
              >
                Cómo funciona
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square w-full rounded-[2rem] bg-gradient-to-br from-navy to-navy-700 p-2 shadow-2xl">
              <div className="grid h-full place-items-center rounded-[1.6rem] bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="DUTI" className="w-2/3 max-w-[260px]" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-brdr">
              <p className="text-xs text-muted">Pago verificado</p>
              <p className="text-sm font-bold text-success">✓ en segundos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-navy">Cómo funciona</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {PASOS.map((p) => (
            <div
              key={p.n}
              className="rounded-card border border-brdr bg-white p-6 shadow-sm"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-copper text-lg font-bold text-white">
                {p.n}
              </div>
              <h3 className="mt-4 font-semibold text-navy">{p.titulo}</h3>
              <p className="mt-2 text-sm text-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-[2rem] bg-navy px-8 py-14 text-center text-cream">
          <h2 className="text-3xl font-bold">¿Listo para pedir?</h2>
          <p className="mx-auto mt-3 max-w-md text-cream/70">
            Explorá los locales disponibles y armá tu pedido en minutos.
          </p>
          <Link
            href="/locales"
            className="mt-7 inline-block rounded-full bg-copper px-7 py-3 font-semibold text-white transition hover:bg-copper-light"
          >
            Ver locales
          </Link>
        </div>
      </section>
    </>
  );
}
