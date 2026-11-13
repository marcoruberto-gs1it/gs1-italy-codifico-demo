import QRCode from 'qrcode';
import { Drawing, Rect, Text } from './drawing';
import { checkDigit } from '../gs1';

/**
 * EAN-13 secondo le GS1 General Specifications (§5.2): 95 moduli fra le guardie, margini chiari
 * di 11 moduli a sinistra e 7 a destra, X = 0,33 mm al 100% di ingrandimento, barre alte
 * 22,85 mm con le guardie che scendono di 5 moduli.
 */
const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

export function ean13(gtin13: string, options: { hri?: boolean } = {}): Drawing {
  const hri = options.hri ?? true;
  if (!/^\d{13}$/.test(gtin13) || checkDigit(gtin13.slice(0, 12)) !== Number(gtin13[12])) {
    throw new Error(`GTIN-13 non valido: ${gtin13}`);
  }
  const X = 0.33;
  const BAR_H = 22.85;
  const GUARD_H = BAR_H + 5 * X;
  const QUIET_L = 11;
  const QUIET_R = 7;

  const digits = gtin13.split('').map(Number);
  const parity = PARITY[digits[0]];
  // Ogni modulo: [nero?, è guardia?]
  const modules: [boolean, boolean][] = [];
  const push = (pattern: string, guard: boolean) => pattern.split('').forEach((b) => modules.push([b === '1', guard]));
  push('101', true);
  for (let i = 1; i <= 6; i++) push((parity[i - 1] === 'L' ? L : G)[digits[i]], false);
  push('01010', true);
  for (let i = 7; i <= 12; i++) push(R[digits[i]], false);
  push('101', true);

  const rects: Rect[] = [];
  for (let i = 0; i < modules.length; ) {
    const [dark, guard] = modules[i];
    let j = i;
    while (j < modules.length && modules[j][0] === dark && modules[j][1] === guard) j++;
    if (dark) rects.push({ x: (QUIET_L + i) * X, y: 0, w: (j - i) * X, h: guard ? GUARD_H : BAR_H });
    i = j;
  }

  const texts: Text[] = [];
  const TEXT_SIZE = 2.75;
  const baseline = BAR_H + TEXT_SIZE + 0.2;
  if (hri) {
    texts.push({ x: (QUIET_L - 4) * X, y: baseline, size: TEXT_SIZE, value: gtin13[0], anchor: 'middle' });
    texts.push({ x: (QUIET_L + 3 + 21) * X, y: baseline, size: TEXT_SIZE, value: gtin13.slice(1, 7), anchor: 'middle' });
    texts.push({ x: (QUIET_L + 50 + 21) * X, y: baseline, size: TEXT_SIZE, value: gtin13.slice(7), anchor: 'middle' });
    // Indicatore di margine chiaro a destra (">"), facoltativo ma consigliato.
    texts.push({ x: (QUIET_L + 95 + 5) * X, y: baseline, size: TEXT_SIZE, value: '>', anchor: 'middle' });
  }
  return {
    width: (QUIET_L + 95 + QUIET_R) * X,
    height: hri ? baseline + 0.6 : GUARD_H,
    rects,
    texts,
  };
}

/**
 * QR Code con l'URI GS1 Digital Link. Correzione d'errore M, margine chiaro di 4 moduli e, se
 * richiesto, il testo in chiaro sotto il simbolo con gli AI codificati.
 */
export function qrCode(content: string, options: { hri?: string[]; module?: number } = {}): Drawing {
  const X = options.module ?? 0.5;
  const QUIET = 4;
  const qr = QRCode.create(content, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const rects: Rect[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; ) {
      if (!qr.modules.get(r, c)) {
        c++;
        continue;
      }
      let end = c;
      while (end < size && qr.modules.get(r, end)) end++;
      rects.push({ x: (QUIET + c) * X, y: (QUIET + r) * X, w: (end - c) * X, h: X });
      c = end;
    }
  }
  const side = (size + 2 * QUIET) * X;
  const texts: Text[] = [];
  let height = side;
  if (options.hri?.length) {
    // Una riga per AI; il corpo si adatta perché la riga più lunga stia nella larghezza del simbolo.
    // Il testo parte sotto il margine chiaro, che deve restare libero da qualunque segno.
    const longest = Math.max(...options.hri.map((l) => l.length));
    const textSize = Math.min(2.2, (side * 0.92) / (longest * 0.6));
    options.hri.forEach((value, i) => {
      texts.push({ x: side / 2, y: side + textSize * (0.8 + 1.15 * i), size: textSize, value, anchor: 'middle' });
    });
    height = side + textSize * (1.1 + 1.15 * (options.hri.length - 1));
  }
  return { width: side, height, rects, texts };
}
