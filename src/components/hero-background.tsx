"use client";

import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("./hero-canvas"), {
  ssr: false,
  loading: () => null,
});

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <HeroCanvas />
    </div>
  );
}
