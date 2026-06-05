import Link from "next/link";

export const metadata = { title: "Cómo funciona — DUTI" };

const PASOS = [
  {
    icon: "🍔",
    titulo: "Elegí tu local",
    desc: "Explorá los locales disponibles y mirá su menú con fotos y precios reales.",
  },
  {
    icon: "🛒",
    titulo: "Armá tu pedido",
    desc: "Sumá platos al carrito. Se guarda solo mientras navegás, sin apps ni descargas.",
  },
  {
    icon: "🕒",
    titulo: "Elegí tu horario",
    desc: "Seleccioná la franja de retiro según la capacidad de la cocina. Sin filas.",
  },
  {
    icon: "💸",
    titulo: "Pagá por transferencia",
    desc: "Te mostramos el alias y el monto exacto con centavos únicos para identificar tu pago.",
  },
  {
    icon: "📸",
    titulo: "Subí el comprobante",
    desc: "Sacás captura de la transferencia y la subís. Listo, nada más que hacer.",
  },
  {
    icon: "🤖",
    titulo: "La IA verifica",
    desc: "En segundos validamos que el comprobante sea real y el monto correcto. Sin esperas humanas.",
  },
  {
    icon: "✅",
    titulo: "Retirá a horario",
    desc: "Cuando se confirma, la cocina lo prepara para la hora exacta que elegiste.",
  },
];

export default function ComoFunciona() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(100%_80%_at_50%_0%,#eaf0f6,transparent)]" />
        <span className="inline-flex items-center gap-2 rounded-full border border-copper/20 bg-white/70 px-4 py-1.5 text-sm font-semibold text-copper-600 backdrop-blur">
          Simple de verdad
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-navy md:text-6xl">
          De antojo a{" "}
          <span className="bg-gradient-to-r from-copper to-copper-light bg-clip-text text-transparent">
            comida en mano
          </span>{" "}
          en 7 pasos
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          Sin apps, sin comisiones de pasarela, con verificación de pago
          automática.
        </p>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-3xl px-4 pb-12">
        <div className="relative">
          {/* Línea central */}
          <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-copper via-copper/40 to-transparent md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-8">
            {PASOS.map((p, i) => (
              <div
                key={p.titulo}
                className={`relative flex items-start gap-5 md:gap-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Nodo */}
                <div className="z-10 grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-navy to-navy-700 text-2xl shadow-lg ring-4 ring-cream md:absolute md:left-1/2 md:-translate-x-1/2">
                  {p.icon}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 rounded-card border border-brdr bg-white p-5 shadow-sm md:max-w-[42%] ${
                    i % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-copper">
                    Paso {i + 1}
                  </span>
                  <h2 className="mt-1 text-lg font-bold text-navy">{p.titulo}</h2>
                  <p className="mt-1 text-sm text-muted">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-[2rem] bg-gradient-to-br from-navy to-navy-700 px-8 py-14 text-center text-cream">
          <h2 className="text-3xl font-bold">¿Lo probamos?</h2>
          <p className="mx-auto mt-3 max-w-md text-cream/70">
            Mirá los locales y hacé tu primer pedido en un par de minutos.
          </p>
          <Link
            href="/locales"
            className="mt-7 inline-block rounded-full bg-copper px-8 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-copper-light"
          >
            Ver locales
          </Link>
        </div>
      </section>
    </div>
  );
}
