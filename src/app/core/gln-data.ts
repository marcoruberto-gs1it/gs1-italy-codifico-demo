import { IconName } from '../ui/icon';
import { checkDigit } from './gs1';

/**
 * Sedi e località: i GLN (Global Location Number) dell'azienda.
 *
 * Tipi e ruoli seguono gli Application Identifier GS1 dei GLN (https://ref.gs1.org/ai/,
 * dataset GS1_Application_Identifiers.jsonld):
 * - il tipo dice quale AI identifica il GLN: 417 "Party GLN" (un soggetto: l'azienda, un
 *   reparto o una funzione) oppure 414 "Identification of a physical location" (un luogo
 *   fisico, fisso o mobile; le sue parti interne si indicano con l'estensione AI 254);
 * I luoghi digitali non hanno un AI nel dataset: per ora non sono tra i tipi selezionabili.
 *
 * Nel menu e nelle pagine i GLN si chiamano "Sedi e località", come i GTIN sono "Prodotti".
 * Dati di fantasia su un prefisso GS1 Italy: nessun dato di aziende associate.
 */

/** AI GS1 che identificano un GLN. */
export type GlnAi = '417' | '414';

export const GLN_AI: Record<GlnAi, { title: string; gs1: string; label: string; short: string }> = {
  '417': {
    title: 'PARTY',
    gs1: 'Party Global Location Number (GLN)',
    label: 'Soggetto',
    short: 'Chi: un soggetto che compra, vende, fattura o ha un ruolo nei documenti con i partner.',
  },
  '414': {
    title: 'LOC No.',
    gs1: 'Identification of a physical location - Global Location Number (GLN)',
    label: 'Luogo fisico',
    short: 'Dove: un luogo in cui la merce arriva, parte, viene prodotta o venduta.',
  },
};

export type GlnType = 'Azienda' | 'Reparto o funzione' | 'Luogo fisso' | 'Luogo mobile' | 'Da specificare';

/** Tipi che si possono scegliere, raggruppati per AI ("Da specificare" solo per i GLN di prima). */
export const GLN_TYPES: Exclude<GlnType, 'Da specificare'>[] = ['Azienda', 'Reparto o funzione', 'Luogo fisso', 'Luogo mobile'];

export interface GlnTypeInfo {
  /** L'AI GS1 che identifica il GLN; null se il tipo non è ancora stato indicato. */
  ai: GlnAi | null;
  /** Una frase: che cosa identifica. */
  short: string;
  /** Esempi già in minuscolo (salvo sigle), da mettere dopo "Per esempio:". */
  examples: string[];
  icon: IconName;
  /** L'indirizzo serve per i luoghi fissi e per l'azienda. */
  address: 'obbligatorio' | 'facoltativo' | 'non serve';
}

export const GLN_TYPE_INFO: Record<GlnType, GlnTypeInfo> = {
  Azienda: {
    ai: '417',
    short: 'La tua azienda come soggetto giuridico: chi compra, vende e fattura.',
    examples: ['la società', 'una consociata con partita IVA propria'],
    icon: 'building',
    address: 'obbligatorio',
  },
  'Reparto o funzione': {
    ai: '417',
    short: 'Un ufficio o un reparto che ha un ruolo preciso verso clienti e fornitori.',
    examples: ['ufficio acquisti', 'amministrazione', 'ricezione fatture'],
    icon: 'users',
    address: 'facoltativo',
  },
  'Luogo fisso': {
    ai: '414',
    short: 'Un luogo con un indirizzo, dove la merce arriva, parte, viene prodotta o venduta.',
    examples: ['magazzino', 'stabilimento', 'punto vendita'],
    icon: 'map-pin',
    address: 'obbligatorio',
  },
  'Luogo mobile': {
    ai: '414',
    short: 'Un mezzo che si sposta e di cui serve sapere dove si trova la merce.',
    examples: ['furgone', 'container', 'nave', 'banco di un mercato'],
    icon: 'truck',
    address: 'non serve',
  },
  'Da specificare': {
    ai: null,
    short: 'GLN creato prima che il tipo fosse obbligatorio: indica se è un soggetto o un luogo.',
    examples: [],
    icon: 'alert-circle',
    address: 'facoltativo',
  },
};

/** Per che cosa i partner usano un GLN. */
export const GLN_USES = [
  {
    icon: 'link' as IconName,
    title: 'Ordini e fatture elettroniche',
    text: 'Nei documenti scambiati con clienti e fornitori il GLN indica chi compra, chi vende e a chi fatturare.',
  },
  {
    icon: 'truck' as IconName,
    title: 'Consegne e logistica',
    text: 'Sui documenti di trasporto e sulle etichette dei colli dice esattamente dove consegnare.',
  },
  {
    icon: 'shield-check' as IconName,
    title: 'Tracciabilità e certificazioni',
    text: 'Identifica in modo univoco stabilimenti e magazzini nei percorsi di certificazione e di filiera.',
  },
];

/** Lo stato del GLN in Codifico: una sola colonna al posto di Bozza/Finalizzato + Attivo/Non attivo. */
export type GlnStatus = 'Bozza' | 'Attivo' | 'Non attivo';

/**
 * Stato sul registro GS1, dal punto di vista dei partner: al posto di "Pubblicato" e "Visibile",
 * che in Codifico+ di oggi si confondono.
 */
export type RegistryState = 'Visibile ai partner' | 'In pubblicazione' | 'Non pubblicato';

export interface GlnAddress {
  street: string;
  zip: string;
  city: string;
  province: string;
  country: string;
}

export interface GlnRecord {
  gln: string;
  name: string;
  type: GlnType;
  status: GlnStatus;
  registry: RegistryState;
  address?: GlnAddress;
  /** GLN di cui fa parte (es. il magazzino fa parte dell'azienda). */
  parent?: string;
  /** Altri codici dello stesso soggetto o luogo. */
  otherIds: { label: string; value: string }[];
  created: string;
  modified: string;
}

/** Prefisso GS1 Italy usato per i GLN della demo. */
export const GLN_PREFIX = '8099999';

export function glnCode(ref: number, prefix = GLN_PREFIX): string {
  const body = prefix + String(ref).padStart(12 - prefix.length, '0');
  return body + checkDigit(body);
}

/** Il primo numero libero sul prefisso: il codice si assegna da solo, senza scriverlo a mano. */
export function nextGln(existing: string[], prefix = GLN_PREFIX): string {
  const used = new Set(existing);
  for (let ref = 1; ref < 10 ** (12 - prefix.length); ref++) {
    const code = glnCode(ref, prefix);
    if (!used.has(code)) return code;
  }
  throw new Error('Prefisso esaurito');
}

const addr = (street: string, zip: string, city: string, province: string): GlnAddress => ({
  street,
  zip,
  city,
  province,
  country: 'Italia',
});

const AZIENDA = glnCode(0);
const MAGAZZINO = glnCode(12);

export const SEED_GLNS: GlnRecord[] = [
  {
    gln: AZIENDA,
    name: 'GS1 Italy',
    type: 'Azienda',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via dell’Esempio 10', '20100', 'Milano', 'MI'),
    otherIds: [{ label: 'Codice destinatario fatture', value: 'ABC1234' }],
    created: '2024-03-12',
    modified: '2026-02-10',
  },
  {
    gln: glnCode(11),
    name: 'Sede operativa di Milano',
    type: 'Luogo fisso',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via dell’Esempio 10', '20100', 'Milano', 'MI'),
    parent: AZIENDA,
    otherIds: [],
    created: '2024-03-12',
    modified: '2025-05-06',
  },
  {
    gln: MAGAZZINO,
    name: 'Magazzino centrale',
    type: 'Luogo fisso',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Strada Provinciale 1, km 4', '26900', 'Lodi', 'LO'),
    parent: AZIENDA,
    otherIds: [],
    created: '2024-09-30',
    modified: '2026-06-18',
  },
  {
    gln: glnCode(13),
    name: 'Magazzino Sud',
    type: 'Luogo fisso',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via dei Trasporti 22', '70100', 'Bari', 'BA'),
    parent: AZIENDA,
    otherIds: [],
    created: '2025-02-17',
    modified: '2025-02-17',
  },
  {
    gln: glnCode(14),
    name: 'Stabilimento di produzione',
    type: 'Luogo fisso',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via dell’Industria 5', '43100', 'Parma', 'PR'),
    parent: AZIENDA,
    otherIds: [],
    created: '2025-06-04',
    modified: '2026-01-20',
  },
  {
    gln: glnCode(15),
    name: 'Punto vendita di Roma',
    type: 'Luogo fisso',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Piazza del Negozio 3', '00100', 'Roma', 'RM'),
    parent: AZIENDA,
    otherIds: [],
    created: '2026-05-21',
    modified: '2026-05-21',
  },
  {
    gln: glnCode(16),
    name: 'Punto vendita di Torino',
    type: 'Luogo fisso',
    status: 'Attivo',
    registry: 'Non pubblicato',
    address: addr('Corso del Commercio 40', '10100', 'Torino', 'TO'),
    parent: AZIENDA,
    otherIds: [],
    created: '2026-10-14',
    modified: '2026-10-14',
  },
  {
    gln: glnCode(17),
    name: 'Nuovo magazzino di Bologna',
    type: 'Luogo fisso',
    status: 'Bozza',
    registry: 'Non pubblicato',
    address: addr('Via della Logistica 8', '40100', 'Bologna', 'BO'),
    parent: AZIENDA,
    otherIds: [],
    created: '2026-11-18',
    modified: '2026-11-18',
  },
  {
    gln: glnCode(18),
    name: 'Deposito di Verona',
    type: 'Luogo fisso',
    status: 'Non attivo',
    registry: 'Visibile ai partner',
    address: addr('Via del Deposito 2', '37100', 'Verona', 'VR'),
    parent: AZIENDA,
    otherIds: [],
    created: '2024-04-02',
    modified: '2026-03-31',
  },
  {
    gln: glnCode(21),
    name: 'Ufficio acquisti',
    type: 'Reparto o funzione',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    parent: AZIENDA,
    otherIds: [],
    created: '2025-01-09',
    modified: '2025-01-09',
  },
  {
    gln: glnCode(22),
    name: 'Amministrazione - ricezione fatture',
    type: 'Reparto o funzione',
    status: 'Attivo',
    registry: 'In pubblicazione',
    parent: AZIENDA,
    otherIds: [],
    created: '2026-08-26',
    modified: '2026-11-24',
  },
  {
    gln: glnCode(31),
    name: 'Furgone consegne 01',
    type: 'Luogo mobile',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    parent: MAGAZZINO,
    otherIds: [{ label: 'Targa', value: 'AA000AA' }],
    created: '2025-09-15',
    modified: '2025-09-15',
  },
  {
    gln: glnCode(51),
    name: 'Sede di Napoli',
    type: 'Da specificare',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via del Porto 15', '80100', 'Napoli', 'NA'),
    parent: AZIENDA,
    otherIds: [],
    created: '2019-06-11',
    modified: '2019-06-11',
  },
];
