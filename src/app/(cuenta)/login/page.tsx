import Link from "next/link";
import { Logo } from "@/components/logo";
import { loginCliente } from "../actions";

export const metadata = { title: "Ingresar — DUTI" };

export default async function LoginCliente({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="w-full max-w-sm rounded-card border border-brdr bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center text-xl font-bold text-navy">Ingresá a tu cuenta</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Para ver el historial de tus pedidos.
        </p>
        <form action={loginCliente} className="mt-6 space-y-3">
          <input type="hidden" name="next" value={next ?? "/mis-pedidos"} />
          <input name="email" type="email" required placeholder="Email"
            className="w-full rounded-xl border border-brdr px-4 py-3 outline-none focus:border-navy" />
          <input name="password" type="password" required placeholder="Contraseña"
            className="w-full rounded-xl border border-brdr px-4 py-3 outline-none focus:border-navy" />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button className="w-full rounded-full bg-navy py-3 font-semibold text-cream hover:bg-navy-700">
            Ingresar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-semibold text-copper hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
