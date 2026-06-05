import Link from "next/link";
import { Logo } from "@/components/logo";
import { registroCliente } from "../actions";

export const metadata = { title: "Crear cuenta — DUTI" };

export default async function RegistroCliente({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="w-full max-w-sm rounded-card border border-brdr bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center text-xl font-bold text-navy">Creá tu cuenta</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Pedí más rápido y guardá tu historial.
        </p>
        <form action={registroCliente} className="mt-6 space-y-3">
          <input name="nombre" type="text" required placeholder="Tu nombre"
            className="w-full rounded-xl border border-brdr px-4 py-3 outline-none focus:border-navy" />
          <input name="email" type="email" required placeholder="Email"
            className="w-full rounded-xl border border-brdr px-4 py-3 outline-none focus:border-navy" />
          <input name="password" type="password" required minLength={6} placeholder="Contraseña (mín. 6)"
            className="w-full rounded-xl border border-brdr px-4 py-3 outline-none focus:border-navy" />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button className="w-full rounded-full bg-copper py-3 font-semibold text-white hover:bg-copper-light">
            Crear cuenta
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-semibold text-copper hover:underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
