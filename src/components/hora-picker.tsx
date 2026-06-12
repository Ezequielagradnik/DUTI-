"use client";

import { useMemo } from "react";

// Picker de horario estilo reloj/alarma: HH:MM grande con botones,
// minutos de 5 en 5, acotado al horario del local.

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function HoraPicker({
  value,
  onChange,
  apertura,
  cierre,
}: {
  value: string; // "HH:MM"
  onChange: (v: string) => void;
  apertura: string | null; // "11:00" (o "11:00:00")
  cierre: string | null;
}) {
  const min = useMemo(() => (apertura ? toMin(apertura.slice(0, 5)) : 0), [apertura]);
  const max = useMemo(() => (cierre ? toMin(cierre.slice(0, 5)) : 23 * 60 + 55), [cierre]);

  const cur = toMin(value);

  function step(delta: number) {
    let next = cur + delta;
    if (next < min) next = min;
    if (next > max) next = max;
    // alinear a múltiplos de 5
    next = Math.round(next / 5) * 5;
    onChange(toHHMM(next));
  }

  const [hh, mm] = toHHMM(cur).split(":");

  const btn =
    "grid h-11 w-11 place-items-center rounded-full border border-brdr bg-white text-lg font-bold text-navy transition hover:border-copper hover:text-copper active:scale-95 disabled:opacity-30 disabled:hover:border-brdr disabled:hover:text-navy";

  return (
    <div className="inline-flex flex-col items-center rounded-card border border-brdr bg-white p-5">
      {/* Botones subir */}
      <div className="flex items-center gap-10">
        <button type="button" aria-label="Una hora más" onClick={() => step(60)} disabled={cur + 60 > max} className={btn}>
          ▲
        </button>
        <button type="button" aria-label="Cinco minutos más" onClick={() => step(5)} disabled={cur + 5 > max} className={btn}>
          ▲
        </button>
      </div>

      {/* Display tipo alarma */}
      <div className="my-3 flex items-center gap-1 rounded-2xl bg-navy px-6 py-3 font-mono text-5xl font-bold tracking-tight text-cream tabular-nums">
        <span>{hh}</span>
        <span className="animate-pulse text-copper-light">:</span>
        <span>{mm}</span>
      </div>

      {/* Botones bajar */}
      <div className="flex items-center gap-10">
        <button type="button" aria-label="Una hora menos" onClick={() => step(-60)} disabled={cur - 60 < min} className={btn}>
          ▼
        </button>
        <button type="button" aria-label="Cinco minutos menos" onClick={() => step(-5)} disabled={cur - 5 < min} className={btn}>
          ▼
        </button>
      </div>

      <div className="mt-2.5 flex w-full justify-between px-1 font-mono text-[11px] uppercase tracking-widest text-muted">
        <span>hora</span>
        <span>minutos</span>
      </div>

      {apertura && cierre && (
        <p className="mt-2 text-xs text-muted">
          El local atiende de {apertura.slice(0, 5)} a {cierre.slice(0, 5)}
        </p>
      )}
    </div>
  );
}

/** Hora inicial sugerida: ahora + prep, redondeada a 5', dentro del horario. */
export function horaInicial(prepMin: number, apertura: string | null, cierre: string | null): string {
  const now = new Date();
  let t = now.getHours() * 60 + now.getMinutes() + (prepMin || 20);
  t = Math.ceil(t / 5) * 5;
  const lo = apertura ? toMin(apertura.slice(0, 5)) : 0;
  const hi = cierre ? toMin(cierre.slice(0, 5)) : 23 * 60 + 55;
  if (t < lo) t = lo;
  if (t > hi) t = hi;
  return toHHMM(t);
}
