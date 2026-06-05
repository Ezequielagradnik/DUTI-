// Formato de moneda argentina
export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

/**
 * Agrega centavos únicos (deterministas según el id del pedido) al subtotal,
 * para que cada transferencia tenga un monto identificable.
 * Ej: $12.900 -> $12.900,37
 */
export function totalConCentavosUnicos(subtotal: number, pedidoId: string): number {
  let h = 0;
  for (let i = 0; i < pedidoId.length; i++) {
    h = (h * 31 + pedidoId.charCodeAt(i)) % 100;
  }
  const centavos = h / 100;
  return Math.round((Math.floor(subtotal) + centavos) * 100) / 100;
}
