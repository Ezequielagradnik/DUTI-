import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";
import { login } from "./actions";

export const metadata = { title: "Ingresar — Panel DUTI" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; msg?: string }>;
}) {
  const { error, msg } = await searchParams;

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="w-full max-w-sm rounded-card border border-brdr bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center text-xl font-bold text-navy">Panel del local</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Ingresá para ver tus pedidos y ventas.
        </p>

        <form action={login} className="mt-6 space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-xl border border-brdr px-4 py-3 outline-none focus:border-navy"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Contraseña"
            className="w-full rounded-xl border border-brdr px-4 py-3 outline-none focus:border-navy"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <SubmitButton pendingText="Ingresando…">Ingresar</SubmitButton>
        </form>
        <p className="mt-4 text-center text-xs text-muted">
          ¿Tu local todavía no está en DUTI?{" "}
          <a href="/sumate" className="font-semibold text-copper hover:underline">
            Sumate
          </a>{" "}
          y te damos de alta.
        </p>
      </div>
    </div>
  );
}
