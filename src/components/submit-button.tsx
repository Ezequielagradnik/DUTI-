"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Cargando…",
  variant = "navy",
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "navy" | "copper";
}) {
  const { pending } = useFormStatus();
  const base =
    variant === "copper"
      ? "bg-copper hover:bg-copper-light"
      : "bg-navy hover:bg-navy-700";
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-70 ${base}`}
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pending ? pendingText : children}
    </button>
  );
}
