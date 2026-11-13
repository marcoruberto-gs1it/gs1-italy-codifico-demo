/**
 * Un codice a barre descritto come disegno vettoriale in millimetri: rettangoli neri e testi.
 * Da qui escono l'anteprima SVG e i file EPS e PDF da scaricare, tutti vettoriali come chiede
 * la stampa (nessuna immagine raster).
 */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Text {
  x: number;
  /** Linea di base del testo, misurata dall'alto. */
  y: number;
  size: number;
  value: string;
  anchor: 'start' | 'middle' | 'end';
}

export interface Drawing {
  width: number;
  height: number;
  rects: Rect[];
  texts: Text[];
}

const MM_TO_PT = 72 / 25.4;
const fmt = (n: number) => (Math.round(n * 1000) / 1000).toString();

export function toSvg(d: Drawing, className = ''): string {
  const rects = d.rects.map((r) => `<rect x="${fmt(r.x)}" y="${fmt(r.y)}" width="${fmt(r.w)}" height="${fmt(r.h)}"/>`).join('');
  const texts = d.texts
    .map(
      (t) =>
        `<text x="${fmt(t.x)}" y="${fmt(t.y)}" font-size="${fmt(t.size)}" text-anchor="${t.anchor}">${escapeXml(t.value)}</text>`,
    )
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" viewBox="0 0 ${fmt(d.width)} ${fmt(d.height)}" ` +
    `width="${fmt(d.width)}mm" height="${fmt(d.height)}mm" shape-rendering="crispEdges">` +
    `<rect width="100%" height="100%" fill="#fff"/>` +
    `<g fill="#000">${rects}</g>` +
    `<g fill="#000" font-family="'OCR-B', 'OCR B', Consolas, 'Courier New', monospace">${texts}</g></svg>`
  );
}

/** EPS (Encapsulated PostScript) con origine in basso a sinistra, unità in punti tipografici. */
export function toEps(d: Drawing, title: string): string {
  const W = d.width * MM_TO_PT;
  const H = d.height * MM_TO_PT;
  const lines = [
    '%!PS-Adobe-3.0 EPSF-3.0',
    `%%BoundingBox: 0 0 ${Math.ceil(W)} ${Math.ceil(H)}`,
    `%%HiResBoundingBox: 0 0 ${fmt(W)} ${fmt(H)}`,
    `%%Title: ${title}`,
    '%%Creator: GS1 Italy Codifico+ (demo)',
    '%%EndComments',
    'gsave',
    '0 setgray',
  ];
  for (const r of d.rects) {
    lines.push(`${fmt(r.x * MM_TO_PT)} ${fmt((d.height - r.y - r.h) * MM_TO_PT)} ${fmt(r.w * MM_TO_PT)} ${fmt(r.h * MM_TO_PT)} rectfill`);
  }
  for (const t of d.texts) {
    const size = t.size * MM_TO_PT;
    const move =
      t.anchor === 'middle' ? 'dup stringwidth pop 2 div neg 0 rmoveto ' : t.anchor === 'end' ? 'dup stringwidth pop neg 0 rmoveto ' : '';
    lines.push(
      `/Helvetica findfont ${fmt(size)} scalefont setfont ${fmt(t.x * MM_TO_PT)} ${fmt((d.height - t.y) * MM_TO_PT)} moveto (${escapePs(t.value)}) ${move}show`,
    );
  }
  lines.push('grestore', 'showpage', '%%EOF', '');
  return lines.join('\n');
}

/** PDF 1.4 di una pagina, grande quanto il codice, scritto a mano: rettangoli e Helvetica. */
export function toPdf(d: Drawing, title: string): string {
  const W = d.width * MM_TO_PT;
  const H = d.height * MM_TO_PT;
  const ops: string[] = ['0 g'];
  for (const r of d.rects) {
    ops.push(`${fmt(r.x * MM_TO_PT)} ${fmt((d.height - r.y - r.h) * MM_TO_PT)} ${fmt(r.w * MM_TO_PT)} ${fmt(r.h * MM_TO_PT)} re`);
  }
  if (d.rects.length) ops.push('f');
  for (const t of d.texts) {
    const size = t.size * MM_TO_PT;
    const width = helveticaWidth(t.value) * size;
    const x = t.x * MM_TO_PT - (t.anchor === 'middle' ? width / 2 : t.anchor === 'end' ? width : 0);
    ops.push(`BT /F1 ${fmt(size)} Tf ${fmt(x)} ${fmt((d.height - t.y) * MM_TO_PT)} Td (${escapePs(t.value)}) Tj ET`);
  }
  const stream = ops.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(W)} ${fmt(H)}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Title (${escapePs(title)}) /Producer (GS1 Italy Codifico+ demo) >>`,
  ];
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}

/** Larghezze Helvetica (unità di 1/1000 em) per i caratteri che compaiono nei testi in chiaro. */
function helveticaWidth(text: string): number {
  let w = 0;
  for (const ch of text) {
    if (/[0-9a-z]/.test(ch)) w += 556;
    else if (ch === '(' || ch === ')') w += 333;
    else if (ch === ' ') w += 278;
    else if (ch === '>' || ch === '<') w += 584;
    else w += 600;
  }
  return w / 1000;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!);
}

function escapePs(s: string): string {
  return s.replace(/[\\()]/g, (c) => `\\${c}`);
}
