// Clave opaca única por intento de compra (no por cada tap de "Pagar"): si
// hay que reintentar tras un timeout de red, se reenvía la misma clave para
// que el backend reutilice el PaymentIntent en vez de duplicarlo.
export function generarClaveIdempotencia(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
