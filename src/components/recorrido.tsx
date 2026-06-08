"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  { n: "01", titulo: "Elegí tu local", desc: "Mirás los locales disponibles cerca tuyo y armás el pedido desde el menú, sin apuro." },
  { n: "02", titulo: "Pagás por transferencia", desc: "Te mostramos el alias y el monto exacto. Transferís y subís el comprobante. Listo." },
  { n: "03", titulo: "La IA verifica al toque", desc: "Nuestra IA lee el comprobante y valida el pago en segundos. Nadie confirma nada a mano." },
  { n: "04", titulo: "Retirás a tu horario", desc: "Elegís la franja y la cocina lo tiene listo a esa hora. Llegás, lo agarrás y te vas." },
];

export function Recorrido() {
  const [active, setActive] = useState(1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.step));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-copper">
        El recorrido
      </span>
      <h2 className="mt-3 text-4xl font-bold tracking-tight text-navy md:text-5xl">
        Así pedís en DUTI.
      </h2>
      <p className="mt-3 max-w-xl text-lg text-muted">
        Del antojo al mostrador en cuatro pasos. Sin filas, sin esperar a que alguien confirme el pago.
      </p>

      <div className="mt-12 grid gap-14 md:grid-cols-[0.85fr_1fr]">
        {/* Teléfono sticky */}
        <div className="md:sticky md:top-24 md:h-fit">
          <div className="relative mx-auto aspect-[9/16.5] w-full max-w-[320px] rounded-[34px] border border-brdr bg-navy p-3.5 shadow-2xl">
            <div className="relative h-full overflow-hidden rounded-[24px] bg-cream">
              {/* Pantalla 1: menú */}
              <Screen on={active === 1}>
                <h4 className="mb-3.5 font-bold text-navy">Menú · Burger Club</h4>
                {[
                  ["Smash Doble", "$8.900", true],
                  ["Cheeseburger", "$6.500", false],
                  ["Papas Rústicas", "$4.200", true],
                  ["Limonada", "$2.400", false],
                ].map(([n, p, sel]) => (
                  <div
                    key={n as string}
                    className={`mb-2 flex items-center justify-between rounded-xl bg-white px-3 py-3 text-sm ${
                      sel ? "outline outline-2 outline-copper" : ""
                    }`}
                  >
                    <span className="text-navy">{n}</span>
                    <span className="font-mono font-bold text-copper">{p}</span>
                  </div>
                ))}
              </Screen>

              {/* Pantalla 2: pago */}
              <Screen on={active === 2}>
                <h4 className="mb-3.5 font-bold text-navy">Pagá por transferencia</h4>
                <div className="rounded-2xl bg-white p-4 font-mono text-xs">
                  <div className="text-muted">Transferí a</div>
                  <div className="my-1.5 text-base font-bold text-copper">maxisetton</div>
                  <div className="text-muted">Monto exacto</div>
                  <div className="font-sans text-3xl font-bold tracking-tight text-navy">$13.100</div>
                </div>
                <div className="mt-3.5 rounded-xl border border-dashed border-brdr p-4 text-center text-xs text-muted">
                  ⬆︎ Subí el comprobante
                </div>
              </Screen>

              {/* Pantalla 3: verificando */}
              <Screen on={active === 3}>
                <h4 className="mb-3.5 font-bold text-navy">Verificando pago…</h4>
                <div className="relative h-[64%] overflow-hidden rounded-2xl bg-white">
                  {active === 3 && (
                    <div className="animate-scan absolute inset-x-0 h-10 bg-gradient-to-b from-success/50 to-transparent" />
                  )}
                  <div className="grid gap-3 p-5">
                    {["60%", "85%", "45%", "70%", "85%"].map((w, i) => (
                      <div key={i} className="h-2.5 rounded bg-navy-50" style={{ width: w }} />
                    ))}
                  </div>
                </div>
                <div className="mt-3.5 text-center font-mono text-xs font-bold text-success">
                  ● analizando comprobante
                </div>
              </Screen>

              {/* Pantalla 4: listo */}
              <Screen on={active === 4}>
                <div className="mx-auto mt-7 grid h-16 w-16 place-items-center rounded-full border-2 border-success bg-success/10 text-3xl text-success">
                  ✓
                </div>
                <div className="mt-4 text-center text-xs text-muted">Tu pedido está listo</div>
                <div className="mt-2 text-center text-5xl font-bold tracking-tight text-copper">13:30</div>
                <div className="mt-2 text-center text-xs text-muted">Pasá a buscarlo por el mostrador</div>
              </Screen>
            </div>
          </div>
        </div>

        {/* Pasos */}
        <div>
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              ref={(el) => { stepRefs.current[i] = el; }}
              data-step={i + 1}
              className={`ml-1.5 flex min-h-[55vh] flex-col justify-center border-l-2 pl-7 transition md:min-h-[62vh] ${
                active === i + 1 ? "border-copper opacity-100" : "border-brdr opacity-40"
              }`}
            >
              <span className="font-mono text-sm font-bold tracking-widest text-copper">{s.n}</span>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-navy md:text-3xl">{s.titulo}</h3>
              <p className="mt-3 max-w-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Screen({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 p-5 transition-all duration-500 ${
        on ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-[0.98] opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
