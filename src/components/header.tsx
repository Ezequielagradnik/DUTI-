"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { Logo } from "./logo";

type Rol = "cliente" | "local" | "admin";

export function Header({
  rol,
  email,
}: {
  rol: Rol | null;
  email: string | null;
}) {
  const { count } = useCart();
  const logueado = Boolean(email);

  // Acceso al panel según rol
  const panel =
    rol === "admin"
      ? { href: "/admin", label: "Panel admin" }
      : rol === "local"
        ? { href: "/admin-local", label: "Mi panel" }
        : null;

  return (
    <header className="sticky top-3 z-40 px-3 md:top-5 md:px-6">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-white/60 bg-cream/70 pl-5 pr-2 shadow-lg shadow-navy/10 ring-1 ring-navy/5 backdrop-blur-xl md:h-16 md:pr-3">
        <Link href="/" aria-label="DUTI inicio">
          <Logo />
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm font-medium text-navy/80 md:flex">
          <Link href="/como-funciona" className="hover:text-copper">Cómo funciona</Link>
          <Link href="/sumate" className="hover:text-copper">Sumá tu local</Link>
          <Link href="/contacto" className="hover:text-copper">Contacto</Link>
          {panel && (
            <Link href={panel.href} className="font-semibold text-copper hover:underline">
              {panel.label}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={logueado ? "/mis-pedidos" : "/login"}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
              <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">
              {logueado ? "Mi cuenta" : "Ingresar"}
            </span>
          </Link>

          <Link
            href="/carrito"
            className="relative inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-cream transition hover:bg-navy-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L20 8H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" />
              <circle cx="17" cy="20" r="1.4" fill="currentColor" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
