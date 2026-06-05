import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, getLocalDelOwner } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { logout } from "../login/actions";

const NAV = [
  { href: "/admin-local", label: "Resumen", icon: "📊" },
  { href: "/admin-local/pedidos", label: "Pedidos", icon: "🧾" },
  { href: "/admin-local/ventas", label: "Ventas", icon: "💰" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin-local/login");
  if (session.rol !== "local" && session.rol !== "admin") {
    redirect("/admin-local/login?error=Tu%20cuenta%20no%20tiene%20acceso%20al%20panel");
  }

  const local = await getLocalDelOwner(session);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
      {/* Sidebar */}
      <aside className="h-max rounded-card border border-brdr bg-white p-4">
        <Logo />
        <div className="mt-4 rounded-lg bg-navy-50 px-3 py-2">
          <p className="text-xs text-muted">Local</p>
          <p className="truncate text-sm font-semibold text-navy">
            {local?.nombre ?? "Sin local asignado"}
          </p>
        </div>
        <nav className="mt-4 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy/80 hover:bg-navy-50"
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-4 border-t border-brdr pt-3">
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:text-danger">
            ↩ Salir
          </button>
        </form>
      </aside>

      <section>
        {!local ? (
          <div className="rounded-card border border-dashed border-brdr bg-white p-8 text-center">
            <p className="font-semibold text-navy">
              Tu cuenta todavía no está vinculada a un local
            </p>
            <p className="mt-2 text-sm text-muted">
              Pedile a un admin que asocie tu usuario a un local (rol{" "}
              <code className="rounded bg-navy-50 px-1">local</code>).
            </p>
          </div>
        ) : (
          children
        )}
      </section>
    </div>
  );
}
