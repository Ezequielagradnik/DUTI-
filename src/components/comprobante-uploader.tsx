"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { EstadoPedido } from "@/lib/types";

export function ComprobanteUploader({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const { clear } = useCart();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoPedido | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function onPick(f: File | null) {
    setFile(f);
    setError(null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  async function subir() {
    if (!file) return setError("Elegí una imagen del comprobante.");
    setSubiendo(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/pedidos/${pedidoId}/comprobante`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo subir.");
      setEstado("verificando");
      clear(); // ya tenemos el pedido creado, vaciamos el carrito
      // Poll del estado
      pollRef.current = setInterval(async () => {
        const r = await fetch(`/api/pedidos/${pedidoId}/status`);
        const d = await r.json();
        if (d.estado && d.estado !== "verificando") {
          if (pollRef.current) clearInterval(pollRef.current);
          setEstado(d.estado);
          if (d.estado === "confirmado") {
            router.push(`/confirmacion/${pedidoId}`);
          }
        }
      }, 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setSubiendo(false);
    }
  }

  if (estado === "verificando") {
    return (
      <div className="rounded-card border border-brdr bg-white p-6 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-navy-50 border-t-copper" />
        <p className="mt-4 font-semibold text-navy">Verificando tu pago…</p>
        <p className="mt-1 text-sm text-muted">
          Estamos validando el comprobante con IA. Esto toma unos segundos.
        </p>
      </div>
    );
  }

  if (estado === "sospechoso") {
    return (
      <Estado
        color="warning"
        titulo="Pago en revisión"
        texto="Detectamos algo que necesitamos revisar manualmente. El local va a confirmar tu pedido en breve."
      />
    );
  }

  if (estado === "rechazado") {
    return (
      <Estado
        color="danger"
        titulo="No pudimos validar el comprobante"
        texto="El monto o el comprobante no coinciden con el pedido. Revisá la transferencia e intentá de nuevo."
        retry={() => {
          setEstado(null);
          setSubiendo(false);
          setFile(null);
          setPreview(null);
        }}
      />
    );
  }

  return (
    <div className="rounded-card border border-brdr bg-white p-5">
      <h3 className="font-semibold text-navy">Subí tu comprobante</h3>
      <p className="mt-1 text-sm text-muted">
        Sacá captura de la transferencia y subila acá.
      </p>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brdr bg-navy-50/40 p-6 text-center hover:border-copper">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="comprobante" className="max-h-56 rounded-lg" />
        ) : (
          <>
            <span className="text-2xl">📄</span>
            <span className="text-sm font-medium text-navy">
              Tocá para elegir la imagen
            </span>
            <span className="text-xs text-muted">JPG o PNG</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
      </label>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <button
        onClick={subir}
        disabled={subiendo || !file}
        className="mt-4 w-full rounded-full bg-copper py-3 font-semibold text-white transition hover:bg-copper-light disabled:opacity-60"
      >
        {subiendo ? "Subiendo…" : "Enviar comprobante"}
      </button>
    </div>
  );
}

function Estado({
  color,
  titulo,
  texto,
  retry,
}: {
  color: "warning" | "danger";
  titulo: string;
  texto: string;
  retry?: () => void;
}) {
  return (
    <div className="rounded-card border border-brdr bg-white p-6 text-center">
      <div
        className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-2xl ${
          color === "warning" ? "bg-copper-50" : "bg-red-50"
        }`}
      >
        {color === "warning" ? "🟡" : "🔴"}
      </div>
      <p className="mt-3 font-semibold text-navy">{titulo}</p>
      <p className="mt-1 text-sm text-muted">{texto}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream hover:bg-navy-700"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
