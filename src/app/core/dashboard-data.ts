import { DEMO_PRODUCTS, MAIN_PRODUCT } from './demo-data';
import { checkDigit } from './gs1';
import { GlnType } from './gln-data';

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

/**
 * Visite ai contenuti: le richieste arrivate al resolver GS1 per i prodotti dell'azienda, da QR
 * code inquadrati, link aperti o app. Non sono persone: chi apre due volte conta due visite.
 */
export interface VisitStats {
  /** Visite degli ultimi 30 giorni. */
  total: number;
  /** Variazione percentuale sui 30 giorni precedenti. */
  deltaPct: number;
  topGtin: string;
  topScans: number;
  /** Visite giorno per giorno (30 valori, il cui totale è `total`). */
  daily: number[];
  /** Ultimo giorno della serie (ISO). */
  end: string;
  /** Visite per contenuto aperto (il totale è `total`); `other` raccoglie il resto. */
  byContent: { label: string; value: number; other?: boolean }[];
}

/**
 * Serie giornaliera di esempio: crescita leggera (coerente con la variazione positiva) e calo
 * nel fine settimana, scalata perché la somma sia esattamente `total`.
 */
function dailySeries(total: number, days = 30): number[] {
  const raw = Array.from({ length: days }, (_, i) => {
    const trend = 1 + (i / days) * 0.35;
    const weekend = i % 7 === 5 || i % 7 === 6 ? 0.7 : 1;
    const wobble = 1 + 0.12 * Math.sin(i * 1.7);
    return trend * weekend * wobble;
  });
  const sum = raw.reduce((a, b) => a + b, 0);
  const values = raw.map((v) => Math.round((v / sum) * total));
  // Arrotondamenti: la differenza va sull'ultimo giorno, così il totale torna.
  values[days - 1] += total - values.reduce((a, b) => a + b, 0);
  return values;
}

/** Richiesta di modifica di un prodotto, in lavorazione presso GS1 Italy. */
export interface ChangeRequest {
  gtin: string;
  description: string;
  /** Invio della richiesta (ISO, con ora). */
  sent: string;
  /** "Da integrare": GS1 Italy chiede dati all'azienda, quindi tocca all'utente. */
  status: 'In verifica' | 'Da integrare';
}

/** Richiesta di un codice per un prodotto a peso variabile. */
export interface VariableWeightRequest {
  description: string;
  category: string;
  created: string;
  status: 'In verifica' | 'Da integrare';
}

/** Un attributo della scheda prodotto e su quanti prodotti è compilato. */
export interface AttributeFill {
  label: string;
  filled: number;
  /** Perché conta, in una frase: compare quando l'attributo è il meno compilato. */
  why: string;
}

export interface Scenario {
  id: ScenarioId;
  company: string;
  prefixes: Prefix[];
  catalog: CatalogItem[];
  /**
   * Quali sedi e località mostra la dashboard (vengono da GlnStore, come la sezione dedicata):
   * tutte, oppure solo il GLN dell'azienda (azienda nuova).
   */
  glnScope: 'tutti' | 'azienda';
  changeRequests: ChangeRequest[];
  variableRequests: VariableWeightRequest[];
  /** Compilazione degli attributi sui prodotti a peso fisso (stesso totale del catalogo). */
  attributes: AttributeFill[];
  /** Assente = statistiche non ancora disponibili. */
  stats?: VisitStats;
}

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

/* ---- Richieste e completezza ----------------------------------------------------------------- */

const WHY = {
  brand: 'La marca permette di ritrovare il prodotto nelle ricerche dei partner.',
  description: 'Una descrizione completa evita errori di anagrafica presso i rivenditori.',
  image: 'Le immagini rendono riconoscibile il prodotto su cataloghi ed e-commerce.',
  gpc: 'La classificazione GPC colloca il prodotto nella categoria giusta.',
  content: 'Il contenuto netto serve per prezzi al kg o al litro e per la logistica.',
  countries: 'I paesi di vendita indicano dove il prodotto è in commercio.',
};

/** Compilazione per attributo, come quota del totale (arrotondata a prodotti interi). */
function attributes(total: number, shares: [number, number, number, number, number, number]): AttributeFill[] {
  const n = (share: number) => Math.round(total * share);
  return [
    { label: 'Marca', filled: n(shares[0]), why: WHY.brand },
    { label: 'Descrizione prodotto', filled: n(shares[1]), why: WHY.description },
    { label: 'Immagine', filled: n(shares[2]), why: WHY.image },
    { label: 'Classificazione GPC', filled: n(shares[3]), why: WHY.gpc },
    { label: 'Contenuto netto', filled: n(shares[4]), why: WHY.content },
    { label: 'Paesi di vendita', filled: n(shares[5]), why: WHY.countries },
  ];
}

const ACTIVE_CATALOG = [...demoItems(['Finalizzato', 'Bozza']), ...generatedCatalog(157, 41, 6)];

const B: Scenario = {
  id: 'b',
  company: 'GS1 Italy',
  prefixes: [P_MASTER, P_EXAMPLES, P_EXTRA, P_GLN],
  catalog: ACTIVE_CATALOG,
  glnScope: 'tutti',
  // Richieste sui prodotti della demo: si aprono dalla dashboard.
  changeRequests: [
    { gtin: '8032089002028', description: 'Spaghetti di semola di grano duro 500 g', sent: '2026-11-20T10:30', status: 'Da integrare' },
    { gtin: '8000000000521', description: 'Olio extravergine di oliva 50 cl', sent: '2026-11-12T17:10', status: 'In verifica' },
    { gtin: '8032089000673', description: 'Biscotti frollini 350 g', sent: '2026-10-30T09:16', status: 'In verifica' },
  ],
  variableRequests: [
    { description: 'Formaggio stagionato a tranci', category: 'Formaggi', created: '2026-10-22', status: 'In verifica' },
  ],
  attributes: attributes(ACTIVE_CATALOG.length, [0.756, 0.756, 0.048, 0.601, 0.637, 0.122]),
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
    glnScope: 'azienda',
    changeRequests: [],
    variableRequests: [],
    attributes: attributes(2, [1, 1, 0, 0.5, 0.5, 0]),
  },
  b: B,
  c: {
    ...B,
    id: 'c',
    stats: {
      total: 3418,
      deltaPct: 12,
      topGtin: MAIN_PRODUCT.gtin,
      topScans: 1027,
      daily: dailySeries(3418),
      end: '2026-11-24',
      byContent: [
        { label: 'Pagina prodotto', value: 1946 },
        { label: 'Sostenibilità', value: 702 },
        { label: 'Allergeni', value: 455 },
        { label: 'Altri contenuti', value: 315, other: true },
      ],
    },
  },
};
