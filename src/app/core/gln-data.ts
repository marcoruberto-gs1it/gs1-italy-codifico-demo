import { IconName } from '../ui/icon';
import { checkDigit } from './gs1';

/**
 * Sedi e località: i GLN (Global Location Number) dell'azienda.
 *
 * Nel menu e nelle pagine i GLN si chiamano per quello che identificano, come i GTIN sono
 * "Prodotti". I tipi sono in parole semplici; il termine GS1 resta visibile come riferimento
 * (gs1Term) per chi lo conosce dalla documentazione.
 *
 * Dati di fantasia su un prefisso GS1 Italy: nessun dato di aziende associate.
 */

export type GlnType = 'Azienda' | 'Luogo fisico' | 'Luogo mobile' | 'Luogo digitale' | 'Reparto o funzione' | 'Da specificare';

/** Tipi che si possono scegliere ("Da specificare" esiste solo per i GLN creati in passato). */
export const GLN_TYPES: Exclude<GlnType, 'Da specificare'>[] = [
  'Azienda',
  'Luogo fisico',
  'Reparto o funzione',
  'Luogo digitale',
  'Luogo mobile',
];

export interface GlnTypeInfo {
  /** Termine GS1 (e in Codifico+ di oggi), per chi lo conosce. */
  gs1Term: string;
  /** Una frase: che cosa identifica. */
  short: string;
  /** Esempi già in minuscolo (salvo sigle), da mettere dopo "Per esempio:". */
  examples: string[];
  icon: IconName;
  /** L'indirizzo serve per i luoghi dove arriva o parte merce, e per l'azienda. */
  address: 'obbligatorio' | 'facoltativo' | 'non serve';
}

export const GLN_TYPE_INFO: Record<GlnType, GlnTypeInfo> = {
  Azienda: {
    gs1Term: 'Entità legale (persona giuridica)',
    short: 'La tua azienda come soggetto giuridico: chi compra, vende e fattura.',
    examples: ['la società', 'una consociata con partita IVA propria'],
    icon: 'building',
    address: 'obbligatorio',
  },
  'Luogo fisico': {
    gs1Term: 'Posizione fisica fissa',
    short: 'Un luogo con un indirizzo, dove la merce arriva, parte o viene venduta.',
    examples: ['magazzino', 'stabilimento', 'punto vendita', 'banchina di carico'],
    icon: 'map-pin',
    address: 'obbligatorio',
  },
  'Reparto o funzione': {
    gs1Term: 'Funzione',
    short: 'Un ufficio o un reparto che ha un ruolo preciso verso clienti e fornitori.',
    examples: ['ufficio acquisti', 'amministrazione', 'ricezione fatture'],
    icon: 'users',
    address: 'facoltativo',
  },
  'Luogo digitale': {
    gs1Term: 'Posizione digitale',
    short: 'Un indirizzo digitale a cui arrivano dati e documenti, non merce.',
    examples: ['casella per gli ordini elettronici (EDI)', 'portale fornitori'],
    icon: 'monitor',
    address: 'non serve',
  },
  'Luogo mobile': {
    gs1Term: 'Posizione fisica mobile',
    short: 'Un mezzo che si sposta e di cui serve sapere dove si trova la merce.',
    examples: ['furgone', 'container', 'nave', 'banco di un mercato'],
    icon: 'truck',
    address: 'non serve',
  },
  'Da specificare': {
    gs1Term: 'Non specificato',
    short: 'GLN creato prima che il tipo fosse obbligatorio: indica cosa identifica.',
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

/** Ruoli che un GLN può avere verso i partner (in parole semplici). */
export const GLN_ROLES = [
  'Fatturazione',
  'Pagamenti',
  'Ordini',
  'Consegna merci',
  'Ritiro merci',
  'Produzione',
  'Vendita al pubblico',
] as const;

export type GlnRole = (typeof GLN_ROLES)[number];

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
  roles: GlnRole[];
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
    roles: ['Fatturazione', 'Pagamenti'],
    otherIds: [{ label: 'Codice destinatario fatture', value: 'ABC1234' }],
    created: '2024-03-12',
    modified: '2026-02-10',
  },
  {
    gln: glnCode(11),
    name: 'Sede operativa di Milano',
    type: 'Luogo fisico',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via dell’Esempio 10', '20100', 'Milano', 'MI'),
    roles: ['Ordini'],
    parent: AZIENDA,
    otherIds: [],
    created: '2024-03-12',
    modified: '2025-05-06',
  },
  {
    gln: MAGAZZINO,
    name: 'Magazzino centrale',
    type: 'Luogo fisico',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Strada Provinciale 1, km 4', '26900', 'Lodi', 'LO'),
    roles: ['Consegna merci', 'Ritiro merci'],
    parent: AZIENDA,
    otherIds: [],
    created: '2024-09-30',
    modified: '2026-06-18',
  },
  {
    gln: glnCode(13),
    name: 'Magazzino Sud',
    type: 'Luogo fisico',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via dei Trasporti 22', '70100', 'Bari', 'BA'),
    roles: ['Consegna merci'],
    parent: AZIENDA,
    otherIds: [],
    created: '2025-02-17',
    modified: '2025-02-17',
  },
  {
    gln: glnCode(14),
    name: 'Stabilimento di produzione',
    type: 'Luogo fisico',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via dell’Industria 5', '43100', 'Parma', 'PR'),
    roles: ['Produzione', 'Ritiro merci'],
    parent: AZIENDA,
    otherIds: [],
    created: '2025-06-04',
    modified: '2026-01-20',
  },
  {
    gln: glnCode(15),
    name: 'Punto vendita di Roma',
    type: 'Luogo fisico',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Piazza del Negozio 3', '00100', 'Roma', 'RM'),
    roles: ['Vendita al pubblico', 'Consegna merci'],
    parent: AZIENDA,
    otherIds: [],
    created: '2026-05-21',
    modified: '2026-05-21',
  },
  {
    gln: glnCode(16),
    name: 'Punto vendita di Torino',
    type: 'Luogo fisico',
    status: 'Attivo',
    registry: 'Non pubblicato',
    address: addr('Corso del Commercio 40', '10100', 'Torino', 'TO'),
    roles: ['Vendita al pubblico'],
    parent: AZIENDA,
    otherIds: [],
    created: '2026-10-14',
    modified: '2026-10-14',
  },
  {
    gln: glnCode(17),
    name: 'Nuovo magazzino di Bologna',
    type: 'Luogo fisico',
    status: 'Bozza',
    registry: 'Non pubblicato',
    address: addr('Via della Logistica 8', '40100', 'Bologna', 'BO'),
    roles: [],
    parent: AZIENDA,
    otherIds: [],
    created: '2026-11-18',
    modified: '2026-11-18',
  },
  {
    gln: glnCode(18),
    name: 'Deposito di Verona',
    type: 'Luogo fisico',
    status: 'Non attivo',
    registry: 'Visibile ai partner',
    address: addr('Via del Deposito 2', '37100', 'Verona', 'VR'),
    roles: ['Consegna merci'],
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
    roles: ['Ordini'],
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
    roles: ['Fatturazione'],
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
    roles: ['Consegna merci'],
    parent: MAGAZZINO,
    otherIds: [{ label: 'Targa', value: 'AA000AA' }],
    created: '2025-09-15',
    modified: '2025-09-15',
  },
  {
    gln: glnCode(41),
    name: 'Casella ordini elettronici (EDI)',
    type: 'Luogo digitale',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    roles: ['Ordini'],
    parent: AZIENDA,
    otherIds: [],
    created: '2025-03-03',
    modified: '2025-11-12',
  },
  {
    gln: glnCode(51),
    name: 'Sede di Napoli',
    type: 'Da specificare',
    status: 'Attivo',
    registry: 'Visibile ai partner',
    address: addr('Via del Porto 15', '80100', 'Napoli', 'NA'),
    roles: [],
    parent: AZIENDA,
    otherIds: [],
    created: '2019-06-11',
    modified: '2019-06-11',
  },
];
