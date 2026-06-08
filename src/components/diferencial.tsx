"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CAMPOS = [
  ["Monto", "$13.100,37"],
  ["Destino (alias)", "maxisetton"],
  ["Fecha y hora", "hoy 12:58"],
  ["N° de operación", "#48201993"],
];

export function Diferencial() {
  const [found, setFound] = useState(0); // cuántos campos verificados
  const [stamp, setStamp] = useState(false);
  const [scanKey, setScanKey] = useState(0); // reinicia la animación del láser
  const running = useRef(false);
  const recibo = useRef<HTMLDivElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const run = useCallback(() => {
    if (running.current) return;
    running.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFound(0);
    setStamp(false);
    setScanKey((k) => k + 1);
    CAMPOS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setFound(i + 1), 350 + i * 330));
    });
    timers.current.push(
      setTimeout(() => {
        setStamp(true);
        running.current = false;
      }, 350 + CAMPOS.length * 330 + 150)
    );
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.45 }
    );
    if (recibo.current) io.observe(recibo.current);
    return () => {
      io.disconnect();
      timers.current.forEach(clearTimeout);
    };
  }, [run]);

  return (
    <section className="bg-gradient-to-b from-transparent to-success/[0.06]">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 md:grid-cols-2">
        {/* Comprobante */}
        <div
          ref={recibo}
          className="relative mx-auto max-w-[420px] overflow-hidden rounded-2xl bg-white p-7 font-mono text-[#1a1a1a] shadow-2xl ring-1 ring-brdr"
        >
          {found < CAMPOS.length && (
            <div
              key={scanKey}
              className="animate-scan-big absolute inset-x-0 h-16 bg-gradient-to-b from-success/70 to-transparent"
            />
          )}
          <h5 className="font-sans text-lg font-bold text-navy">Comprobante de transferencia</h5>
          <div className="mb-4 text-[11px] tracking-wide text-zinc-500">BANCO · 08 JUN 2026 · 12:58</div>

          {CAMPOS.map(([lab, val], i) => {
            const ok = found > i;
            return (
              <div
                key={lab}
                className={`flex items-center justify-between py-3 text-sm transition ${
                  ok ? "rounded-lg bg-success/10 px-2" : "border-b border-black/10"
                }`}
              >
                <span className="text-zinc-500">{lab}</span>
                <span className="flex items-center gap-2">
                  <span className="font-bold">{val}</span>
                  <span className={`font-bold text-success transition ${ok ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>✓</span>
                </span>
              </div>
            );
          })}

          {/* Sello */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div
              className={`rounded-2xl border-[3px] border-success bg-cream/85 px-6 py-3.5 text-center font-sans text-xl font-bold text-success ${
                stamp ? "animate-stamp" : "opacity-0"
              }`}
              style={{ transform: "rotate(-8deg) scale(0)" }}
            >
              PAGO VERIFICADO
              <small className="mt-1 block font-mono text-[11px] font-bold tracking-widest">EN 1.8s · POR IA</small>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-copper">
            El diferencial
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-navy md:text-5xl">
            La IA que mira tu comprobante.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-muted">
            Subís la transferencia y, en vez de esperar a que un humano la chequee, la IA de DUTI lee el monto, el destino y la hora, y confirma el pago al instante.
          </p>
          <ul className="mt-7 grid gap-3.5">
            {[
              ["Sin esperas.", "El pedido entra a cocina apenas el pago da OK."],
              ["Sin errores de monto.", "Detecta si transferiste de menos o a otro alias."],
              ["Sin chats con el local.", "No mandás capturas por WhatsApp ni reclamás."],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-3 text-[15.5px]">
                <span className="mt-0.5 font-bold text-success">✓</span>
                <div>
                  <b className="text-navy">{t}</b>
                  <small className="block text-muted">{d}</small>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={run}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:bg-navy-50"
          >
            ↺ Ver de nuevo
          </button>
        </div>
      </div>
    </section>
  );
}
