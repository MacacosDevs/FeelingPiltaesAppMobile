// Formatea centavos a un precio en pesos sin decimales ("$1,600"), igual al
// catálogo de referencia que tenía PackagesScreen antes de tener backend real.
export function formatPrecio(centavos: number): string {
  const pesos = Math.round(centavos / 100);
  return `$${pesos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatVigencia(dias: number): string {
  return `Vigencia ${dias} días`;
}
