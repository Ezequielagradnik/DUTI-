import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-brdr bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="text-cream">
            <Logo />
          </span>
          <p className="mt-3 max-w-xs text-sm text-cream/70">
            Pedí en tus locales favoritos, pagá por transferencia y retirá a la
            hora que vos elijas.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-copper-light">Plataforma</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/locales" className="hover:text-cream">Locales</Link></li>
            <li><Link href="/como-funciona" className="hover:text-cream">Cómo funciona</Link></li>
            <li><Link href="/sumate" className="hover:text-cream">Sumá tu local</Link></li>
            <li><Link href="/admin-local" className="hover:text-cream">Panel del local</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-copper-light">Legal</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/terminos" className="hover:text-cream">Términos</Link></li>
            <li><Link href="/privacidad" className="hover:text-cream">Privacidad</Link></li>
            <li><Link href="/contacto" className="hover:text-cream">Contacto</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} DUTI. Hecho en Argentina.
      </div>
    </footer>
  );
}
