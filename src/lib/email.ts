import "server-only";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
// Remitente. En prod, verificá el dominio en Resend y usá algo@duti.com.ar.
// Para probar sin dominio: "DUTI <onboarding@resend.dev>" (solo manda a tu mail de Resend).
const EMAIL_FROM = process.env.EMAIL_FROM ?? "DUTI <onboarding@resend.dev>";

/** Envía un mail vía Resend. No-op si no hay API key (no rompe el flujo). */
export async function enviarMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!RESEND_API_KEY || !opts.to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, ...opts }),
    });
  } catch {
    /* el cambio de estado no debe fallar por el mail */
  }
}

function layout(titulo: string, cuerpo: string): string {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#faf8f5;border-radius:16px;overflow:hidden;border:1px solid #e6e1d9">
    <div style="background:#15304f;padding:22px 24px;color:#faf8f5;font-size:20px;font-weight:700;letter-spacing:2px">DUTI</div>
    <div style="padding:28px 24px;color:#15304f">
      <h1 style="margin:0 0 8px;font-size:22px">${titulo}</h1>
      ${cuerpo}
    </div>
    <div style="padding:16px 24px;color:#6b7785;font-size:12px;border-top:1px solid #e6e1d9">DUTI · Pedí, pagá y retirá a horario</div>
  </div>`;
}

export function mailPedidoListo(o: {
  local: string;
  horario: string;
  direccion?: string | null;
}): { subject: string; html: string } {
  return {
    subject: `🎉 Tu pedido en ${o.local} está listo`,
    html: layout(
      "¡Tu pedido está listo! 🎉",
      `<p style="font-size:15px;color:#6b7785">Ya podés pasar a buscarlo por <strong style="color:#15304f">${o.local}</strong>.</p>
       <p style="margin-top:16px;font-size:15px">🕒 Horario de retiro: <strong>${o.horario}</strong></p>
       ${o.direccion ? `<p style="font-size:15px">📍 ${o.direccion}</p>` : ""}
       <p style="margin-top:20px;font-size:13px;color:#6b7785">Mostrá este mail en el mostrador. ¡Buen provecho!</p>`
    ),
  };
}

export function mailPagoConfirmado(o: {
  local: string;
  horario: string;
}): { subject: string; html: string } {
  return {
    subject: `✅ Pago confirmado — ${o.local}`,
    html: layout(
      "Pago confirmado ✅",
      `<p style="font-size:15px;color:#6b7785">Tu pago se verificó y <strong style="color:#15304f">${o.local}</strong> ya está preparando tu pedido.</p>
       <p style="margin-top:16px;font-size:15px">🕒 Lo retirás a las <strong>${o.horario}</strong>. Te avisamos cuando esté listo.</p>`
    ),
  };
}
