// Visual del hero: reloj de marca (campana + cubiertos) con aguja girando.
// SVG puro + SMIL, sin librerías. Evoca el logo de DUTI (comida a horario).

const TICKS = Array.from({ length: 12 });
const ORBITERS = [
  { emoji: "🍔", cls: "left-2 top-6", delay: "0s" },
  { emoji: "🍕", cls: "right-0 top-20", delay: "-1.5s" },
  { emoji: "🍣", cls: "right-6 bottom-10", delay: "-3s" },
  { emoji: "🥗", cls: "left-0 bottom-16", delay: "-2.2s" },
];

export function HeroClock() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      {/* Glow */}
      <div className="animate-blob absolute inset-8 -z-10 rounded-full bg-gradient-to-br from-copper/30 via-copper-light/20 to-navy/20 blur-3xl" />

      <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-xl">
        <defs>
          <radialGradient id="face" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3efe9" />
          </radialGradient>
          <linearGradient id="cobre" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d99a72" />
            <stop offset="100%" stopColor="#a86945" />
          </linearGradient>
        </defs>

        {/* Cara */}
        <circle cx="200" cy="200" r="172" fill="url(#face)" stroke="#15304f" strokeWidth="8" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="#15304f" strokeOpacity="0.08" strokeWidth="2" />

        {/* Ticks */}
        {TICKS.map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const r1 = 158;
          const r2 = i % 3 === 0 ? 142 : 150;
          const x1 = 200 + r1 * Math.sin(a);
          const y1 = 200 - r1 * Math.cos(a);
          const x2 = 200 + r2 * Math.sin(a);
          const y2 = 200 - r2 * Math.cos(a);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#15304f"
              strokeOpacity={i % 3 === 0 ? 0.8 : 0.35}
              strokeWidth={i % 3 === 0 ? 5 : 3}
              strokeLinecap="round"
            />
          );
        })}

        {/* Campana (cloche) */}
        <path
          d="M132 214 A68 68 0 0 1 268 214 Z"
          fill="none"
          stroke="url(#cobre)"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <line x1="118" y1="214" x2="282" y2="214" stroke="url(#cobre)" strokeWidth="9" strokeLinecap="round" />
        <circle cx="200" cy="150" r="6" fill="url(#cobre)" />

        {/* Aguja que barre (segundero) */}
        <g>
          <line x1="200" y1="200" x2="200" y2="78" stroke="#bd7b54" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 200 200"
            to="360 200 200"
            dur="8s"
            repeatCount="indefinite"
          />
        </g>

        {/* Cubiertos como agujas (marca) */}
        <line x1="200" y1="200" x2="200" y2="120" stroke="#15304f" strokeWidth="7" strokeLinecap="round" />
        <line x1="200" y1="200" x2="252" y2="246" stroke="#15304f" strokeWidth="7" strokeLinecap="round" />
        <circle cx="200" cy="200" r="9" fill="#15304f" />
        <circle cx="200" cy="200" r="4" fill="#bd7b54" />
      </svg>

    
    </div>
  );
}
