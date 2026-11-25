/**
 * Numeri all'italiana con il punto delle migliaia anche a 4 cifre (3.418), come nei testi di
 * GS1 Italy. Intl in italiano raggruppa solo da 5 cifre (10.000), quindi lo facciamo a mano.
 */
export function formatNumber(n: number): string {
  const [int, dec] = String(Math.abs(n)).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (n < 0 ? '-' : '') + grouped + (dec ? ',' + dec : '');
}
