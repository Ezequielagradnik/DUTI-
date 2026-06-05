import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { logoutCliente } from "../(cuenta)/actions";

const NAV = [
  { href: "/admin", label: "Global", icon: "🌐" },
  { href: "/admin/locales", label: "Locales", icon: "🏪" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.rol !== "admin") {
    redirect("/login?error=Necesit%C3%A1s%20una%20cuenta%20admin");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
      <aside className="h-max rounded-card border border-brdr bg-white p-4">
        <Logo />
        <div className="mt-4 rounded-lg bg-copper-50 px-3 py-2">
          <p className="text-xs text-copper-600">Panel admin</p>
          <p className="truncate text-sm font-semibold text-navy">{session.email}</p>
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
        <form action={logoutCliente} className="mt-4 border-t border-brdr pt-3">
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:text-danger">
            ↩ Salir
          </button>
        </form>
      </aside>
      <section>{children}</section>
    </div>
  );
}
