/**
 * Regole GS1 di base usate dalla demo: check digit, GTIN-14, URI GS1 Digital Link e testo in
 * chiaro (HRI). Riferimenti: GS1 General Specifications §7.9 (check digit) e
 * GS1 Digital Link URI Syntax 1.4. Gli URI usano il dominio del resolver di GS1 Italy.
 */

/** Dominio del resolver GS1 di GS1 Italy, usato in tutti gli URI GS1 Digital Link della demo. */
export const GS1_RESOLVER_HOST = 'id.gs1it.org';
export const GS1_RESOLVER = `https://${GS1_RESOLVER_HOST}`;

/** Check digit modulo 10 GS1 sulle cifre fornite (senza la cifra di controllo). */
export function checkDigit(digitsWithoutCheck: string): number {
  let sum = 0;
  // Da destra verso sinistra i pesi si alternano 3, 1, 3, 1...
  for (let i = digitsWithoutCheck.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) {
    sum += Number(digitsWithoutCheck[i]) * w;
  }
  return (10 - (sum % 10)) % 10;
}

/** Vero se il GTIN (8, 12, 13 o 14 cifre) ha una cifra di controllo corretta. */
export function isValidGtin(gtin: string): boolean {
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(gtin)) return false;
  return checkDigit(gtin.slice(0, -1)) === Number(gtin.at(-1));
}

/** Nel GS1 Digital Link il GTIN va sempre scritto su 14 cifre, con zeri a sinistra. */
export function toGtin14(gtin: string): string {
  return gtin.padStart(14, '0');
}

export interface DigitalLinkKeys {
  gtin: string;
  /** AI (22) Consumer Product Variant: la variante usata da Brindo per l'annata. */
  cpv?: string;
}

/** URI GS1 Digital Link sul resolver di GS1 Italy: https://id.gs1it.org/01/{gtin14}[/22/{cpv}]. */
export function digitalLinkUri({ gtin, cpv }: DigitalLinkKeys): string {
  let uri = `${GS1_RESOLVER}/01/${toGtin14(gtin)}`;
  if (cpv) uri += `/22/${encodeURIComponent(cpv)}`;
  return uri;
}

/** Testo in chiaro con gli AI tra parentesi, es. "(01) 08000000000934 (22) a00". */
export function hriText({ gtin, cpv }: DigitalLinkKeys): string {
  let text = `(01) ${toGtin14(gtin)}`;
  if (cpv) text += ` (22) ${cpv}`;
  return text;
}
