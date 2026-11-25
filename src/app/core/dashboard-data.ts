import { DEMO_PRODUCTS, MAIN_PRODUCT } from './demo-data';
import { checkDigit } from './gs1';

/**
 * Dati di esempio della dashboard, tutti in un punto. I conteggi non sono scritti a mano: si
 * ricavano dagli elenchi qui sotto (catalogo, GLN, prefissi), così card, tab e tooltip restano
 * coerenti fra loro. I cinque prodotti della demo sono nel catalogo con i dati di demo-data.ts;
 * il loro stato Digital Link viene dallo store, quindi cambia se si aggiungono link.
 *
 * Lo scenario si sceglie dall'indirizzo, senza controlli in pagina: #/dashboard?scenario=a|b|c.
 * - A: azienda nuova, nessun prodotto finalizzato.
 * - B: azienda attiva con prodotti, Digital Link e GLN (predefinito).
 * - C: come B, con le statistiche di scansione disponibili.
 *
 * Solo prefissi GS1 Italy e descrizioni di fantasia: nessun dato di aziende associate.
 */

export type ScenarioId = 'a' | 'b' | 'c';

export const DEFAULT_SCENARIO: ScenarioId = 'b';

export function parseScenario(value: string | null): ScenarioId {
  const v = value?.toLowerCase();
  return v === 'a' || v === 'b' || v === 'c' ? v : DEFAULT_SCENARIO;
}

export type CatalogStatus = 'Bozza' | 'Finalizzato';

/** Un prodotto a peso fisso del catalogo dell'azienda. */
export interface CatalogItem {
  gtin: string;
  description: string;
  status: CatalogStatus;
  /** Ultima modifica (ISO). */
  modified: string;
  /** È uno dei prodotti della demo: si apre la scheda e il Digital Link viene dallo store. */
  demo: boolean;
  /** Solo per i prodotti non demo: tipologie dei link attivi; vuoto = senza Digital Link. */
  linkTypes: string[];
}

export type GlnType = 'Entità legale' | 'Ubicazione fisica' | 'Funzione';

export interface Gln {
  gln: string;
  description: string;
  type: GlnType;
  /** Pubblicato sul registro GS1 (GS1 Registry Platform). */
  published: boolean;
  modified: string;
}

export interface Prefix {
  code: string;
  label: string;
  /** Cosa si codifica con il prefisso: prodotti (GTIN) o località (GLN). */
  use: 'gtin' | 'gln';
  capacity: number;
}

export interface ScanStats {
  /** Scansioni degli ultimi 30 giorni. */
  total: number;
  /** Variazione percentuale sui 30 giorni precedenti. */
  deltaPct: number;
  topGtin: string;
  topScans: number;
}

export interface Scenario {
  id: ScenarioId;
  company: string;
  prefixes: Prefix[];
  catalog: CatalogItem[];
  glns: Gln[];
  /** Assente = statistiche non ancora disponibili. */
  stats?: ScanStats;
}

/** Definizioni brevi, per i tooltip. */
export const GLN_TYPE_INFO: Record<GlnType, string> = {
  'Entità legale': 'Identifica la tua azienda come soggetto giuridico, ad esempio nelle fatture.',
  'Ubicazione fisica': 'Identifica un luogo, ad esempio un magazzino, uno stabilimento o un punto vendita.',
  Funzione: 'Identifica un reparto o un ufficio, ad esempio l’ufficio acquisti.',
};

export const REGISTRY_INFO =
  'Il registro GS1 rende i dati di base dei tuoi codici verificabili dai partner commerciali di tutto il mondo.';

/* ---- Prefissi ------------------------------------------------------------------------------- */

const P_MASTER: Prefix = { code: '8000000', label: 'GS1 Italy - GCP master', use: 'gtin', capacity: 100000 };
const P_EXAMPLES: Prefix = { code: '8032089', label: 'GS1 Italy - GCP per esempi', use: 'gtin', capacity: 100000 };
const P_EXTRA: Prefix = { code: '8033999', label: 'GS1 Italy - GCP supplementare', use: 'gtin', capacity: 100000 };
const P_GLN: Prefix = { code: '8099999', label: 'GS1 Italy - GLN a noleggio', use: 'gln', capacity: 100000 };

/* ---- Catalogo -------------------------------------------------------------------------------- */

/** Codice GS1 a 13 cifre: prefisso a 7 cifre, riferimento a 5 cifre, cifra di controllo. */
function code13(prefix: string, ref: number): string {
  const body = prefix + String(ref).padStart(5, '0');
  return body + checkDigit(body);
}

/** Data ISO a `days` giorni prima del 28 agosto 2026 (prima di tutti i prodotti della demo). */
function daysBefore(days: number): string {
  return new Date(Date.UTC(2026, 7, 28 - days)).toISOString().slice(0, 10);
}

const NAMES = [
  'Passata di pomodoro 700 g',
  'Farina di grano tenero tipo 00 1 kg',
  'Riso Carnaroli 1 kg',
  'Caffè macinato 250 g',
  'Tè verde 20 filtri',
  'Miele millefiori 500 g',
  'Confettura di albicocche 340 g',
  'Aceto di vino bianco 1 l',
  'Sugo al basilico 400 g',
  'Crackers integrali 500 g',
  'Fette biscottate 315 g',
  'Cereali al cioccolato 375 g',
  'Acqua frizzante 1,5 l',
  'Succo di arancia 1 l',
  'Latte UHT parzialmente scremato 1 l',
  'Yogurt bianco 500 g',
  'Tonno all’olio di oliva 3 x 80 g',
  'Ceci lessati 400 g',
  'Pesto alla genovese 190 g',
  'Grissini 250 g',
  'Detersivo piatti 1 l',
  'Ammorbidente 2 l',
  'Shampoo neutro 250 ml',
  'Sapone liquido mani 300 ml',
  'Carta da cucina 2 rotoli',
  'Sacchetti gelo 30 pz',
  'Penne rigate 500 g',
  'Fusilli integrali 500 g',
  'Cioccolato fondente 100 g',
  'Taralli all’olio 250 g',
];
const LINES = ['', ' · linea Bio', ' · confezione risparmio', ' · linea Classica', ' · multipack', ' · linea Premium'];

/**
 * Prodotti non demo dello scenario B: 157 finalizzati (41 con Digital Link) e 6 bozze.
 * Con i 4 finalizzati della demo (il vino ha già i link generati da Brindo) si arriva a
 * 161 finalizzati, 42 con Digital Link, come nel brief.
 */
function generatedCatalog(finalized: number, withDl: number, drafts: number): CatalogItem[] {
  const items: CatalogItem[] = [];
  let dl = 0;
  for (let i = 0; i < finalized + drafts; i++) {
    const draft = i >= finalized;
    const prefix = i % 40 === 39 ? P_EXTRA.code : i % 2 ? P_EXAMPLES.code : P_MASTER.code;
    // Un prodotto finalizzato su tre ha il Digital Link, finché non si arriva a withDl.
    const hasDl = !draft && i % 3 === 1 && dl < withDl;
    items.push({
      gtin: code13(prefix, 30000 + i * 7),
      description: NAMES[i % NAMES.length] + LINES[Math.floor(i / NAMES.length) % LINES.length],
      status: draft ? 'Bozza' : 'Finalizzato',
      modified: daysBefore(i * 4),
      demo: false,
      linkTypes: hasDl ? dlTypes(dl++) : [],
    });
  }
  return items;
}

/**
 * Tipologie dei link del k-esimo prodotto con Digital Link: tutti hanno la pagina prodotto;
 * 14 la sostenibilità, 9 gli allergeni, 6 le istruzioni d'uso.
 */
function dlTypes(k: number): string[] {
  const types = ['pip'];
  if (k < 14) types.push('sustainabilityInfo');
  else if (k < 23) types.push('allergenInfo');
  else if (k < 29) types.push('instructions');
  if (k % 5 === 0) types.push('recipeInfo');
  return types;
}

const demoItems = (statuses: CatalogStatus[]): CatalogItem[] =>
  DEMO_PRODUCTS.filter((p) => statuses.includes(p.status)).map((p) => ({
    gtin: p.gtin,
    description: p.description,
    status: p.status,
    modified: p.modified,
    demo: true,
    linkTypes: [],
  }));

/* ---- GLN ------------------------------------------------------------------------------------- */

const gln = (ref: number, description: string, type: GlnType, published: boolean, modified: string): Gln => ({
  gln: code13(P_GLN.code, ref),
  description,
  type,
  published,
  modified,
});

const LEGAL_ENTITY = gln(0, 'GS1 Italy - sede legale', 'Entità legale', true, '2024-03-12');

const ALL_GLNS: Gln[] = [
  LEGAL_ENTITY,
  gln(11, 'Sede operativa di Milano', 'Ubicazione fisica', true, '2024-03-12'),
  gln(12, 'Magazzino centrale', 'Ubicazione fisica', true, '2024-09-30'),
  gln(13, 'Magazzino Sud', 'Ubicazione fisica', true, '2025-02-17'),
  gln(14, 'Stabilimento di produzione', 'Ubicazione fisica', true, '2025-06-04'),
  gln(15, 'Punto vendita di Roma', 'Ubicazione fisica', true, '2026-05-21'),
  gln(16, 'Punto vendita di Torino', 'Ubicazione fisica', false, '2026-10-14'),
  gln(21, 'Ufficio acquisti', 'Funzione', true, '2025-01-09'),
  gln(22, 'Amministrazione - ricezione fatture', 'Funzione', false, '2026-08-26'),
];

/* ---- Scenari --------------------------------------------------------------------------------- */

const ACTIVE_CATALOG = [...demoItems(['Finalizzato', 'Bozza']), ...generatedCatalog(157, 41, 6)];

const B: Scenario = {
  id: 'b',
  company: 'GS1 Italy',
  prefixes: [P_MASTER, P_EXAMPLES, P_EXTRA, P_GLN],
  catalog: ACTIVE_CATALOG,
  glns: ALL_GLNS,
};

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  a: {
    id: 'a',
    company: 'GS1 Italy',
    prefixes: [P_EXAMPLES, P_GLN],
    // Solo bozze: lo spumante della demo e un prodotto appena creato.
    catalog: [
      ...demoItems(['Bozza']),
      {
        gtin: code13(P_EXAMPLES.code, 30001),
        description: 'Passata di pomodoro 700 g',
        status: 'Bozza',
        modified: '2026-11-18',
        demo: false,
        linkTypes: [],
      },
    ],
    glns: [LEGAL_ENTITY],
  },
  b: B,
  c: {
    ...B,
    id: 'c',
    stats: { total: 1284, deltaPct: 18, topGtin: MAIN_PRODUCT.gtin, topScans: 412 },
  },
};
