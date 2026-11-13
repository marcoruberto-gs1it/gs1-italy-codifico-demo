/**
 * Dati di esempio della demo: quattro prodotti di fantasia, con GTIN su prefissi GS1 Italy
 * (8000000 e 8032089) e cifra di controllo valida. Solo il vino usa Brindo (etichetta
 * elettronica, varianti per annata); gli altri prodotti mostrano il GS1 Digital Link per
 * le aziende che non hanno Brindo.
 */

export interface DigitalLinkEntry {
  id: string;
  linkType: string;
  url: string;
  lang: string;
  /**
   * Stato del link (specifica §3): la "eliminazione" è sempre una disattivazione logica, per
   * tracciabilità. Assente = attivo (compatibilità con i dati salvati prima del campo).
   */
  active?: boolean;
}

/**
 * Link generato da un servizio di GS1 Italy (Brindo, Ecologicamente): compare nella tabella
 * del Digital Link ma non si modifica (requisiti §3.2). Gli indirizzi della demo usano il
 * dominio riservato .example.
 */
export interface GeneratedLink {
  service: 'Brindo' | 'Ecologicamente';
  linkType: string;
  lang: string;
  url: string;
  /** Qualificatore della chiave, es. "22/a00" per la variante Brindo; assente = link sul GTIN. */
  qualifier?: string;
  /** Descrizione breve, es. "variante a00 · annata 2026". */
  note?: string;
}

export interface NutritionRow {
  label: string;
  value: string;
  sub?: boolean;
}

/** Una variante Brindo: l'annata del vino, identificata con l'AI (22). */
export interface WineVariant {
  cpv: string;
  vintage: string;
  producer: string;
  abv: string;
  sugar: string;
  protectiveAtmosphere: string;
  ingredients: string;
  acidityRegulators: string;
  preservatives: string;
  stabilizers: string;
  portionMl: string;
  portionsPerBottle: string;
  energyKj: string;
  energyKcal: string;
  nutrition: NutritionRow[];
}

export interface PackagingComponent {
  component: string;
  material: string;
  code: string;
  disposal: string;
}

/** Una misura della tab Base: valore e unità; vuota = non compilata (mostra "—"). */
export interface Measure {
  value: string;
  unit: string;
}

/** Riepilogo prodotto della tab Base, con le sezioni di Codifico+. */
export interface ProductSummary {
  packagingType: string;
  /** Codice del brick GPC; assente se non verificato (si mostra solo la descrizione). */
  gpcCode?: string;
  gpcName: string;
  language: string;
  subBrand?: string;
  productVariant?: string;
  productType?: string;
  site?: string;
  netWeight?: Measure;
  grossWeight?: Measure;
  depth?: Measure;
  width?: Measure;
  height?: Measure;
  /** Unità del contenuto netto come in Codifico+ ("Millilitri", "Grammi") e valore. */
  netContentUnit: string;
  netContentValue: string;
  salesCountries: string[];
}

/** Un imballo che contiene il prodotto ("Questo prodotto è presente in N imballi"). */
export interface ProductPack {
  gtin: string;
  status: 'Finalizzato';
  /** Numero di unità del prodotto nell'imballo. */
  quantity: number;
  /** Data di ultima modifica (ISO). */
  modified: string;
}

/** Che illustrazione usare per il prodotto. */
export type ProductKind = 'wine' | 'pasta' | 'biscuits' | 'oil';

/** Stato del prodotto in Codifico: Digital Link e QR solo sui prodotti finalizzati. */
export type ProductStatus = 'Finalizzato' | 'Bozza';

export interface Product {
  gtin: string;
  status: ProductStatus;
  kind: ProductKind;
  gtinType: string;
  description: string;
  brand: string;
  category: string;
  netContent: string;
  targetMarket: string;
  origin: string;
  salesName: string;
  certifications: string[];
  /** Avvertenze di consumo responsabile (solo bevande alcoliche). */
  responsibleDrinking: string[];
  createdAt: string;
  /** Data di ultima modifica (ISO), per gli elenchi. */
  modified: string;
  /** Varianti Brindo: presenti solo per il vino. Vuoto = il prodotto non usa Brindo. */
  variants: WineVariant[];
  /** Etichetta ambientale pubblicata con Ecologicamente: genera un link di sostenibilità. */
  ecologicamentePublished?: boolean;
  packaging: PackagingComponent[];
  summary: ProductSummary;
  packs: ProductPack[];
}

const WINE: Product = {
  gtin: '8000000000934',
  status: 'Finalizzato',
  kind: 'wine',
  gtinType: 'GTIN-13',
  description: 'vino frizzante bianco 1Lt',
  brand: 'Cantina Sociale GS1',
  category: 'Vino frizzante',
  netContent: '1000 ml',
  targetMarket: 'Italia',
  origin: 'Italia',
  salesName: 'Vino bianco frizzante DOC',
  certifications: ['DOC'],
  responsibleDrinking: [
    'Rischi per la salute durante la gravidanza',
    'Non bere e guidare',
    'Non servire a minorenni',
  ],
  createdAt: '14 ottobre 2026',
  modified: '2026-09-09',
  variants: [
    {
      cpv: 'a00',
      vintage: '2026',
      producer: 'cantina sociale GS1',
      abv: '12',
      sugar: '',
      protectiveAtmosphere: '',
      ingredients: '',
      acidityRegulators: '',
      preservatives: '',
      stabilizers: '',
      portionMl: '',
      portionsPerBottle: '',
      energyKj: '',
      energyKcal: '',
      nutrition: [],
    },
    {
      cpv: 'a01',
      vintage: '2022',
      producer: 'cantina sociale GS1',
      abv: '13,5',
      sugar: 'Dosaggio zero',
      protectiveAtmosphere: 'Imbottigliato in atmosfera protettiva',
      ingredients: 'Uve, mosto concentrato rettificato',
      acidityRegulators: 'Acido malico',
      preservatives: 'Metabisolfito di potassio (solfiti)',
      stabilizers: 'Mannoproteine di lieviti',
      portionMl: '125',
      portionsPerBottle: '8',
      energyKj: '335 kJ',
      energyKcal: '80 kcal',
      nutrition: [
        { label: 'Grassi', value: '0 g' },
        { label: 'di cui saturi', value: '0 g', sub: true },
        { label: 'Carboidrati', value: '0,6 g' },
        { label: 'di cui zuccheri', value: '0,3 g', sub: true },
        { label: 'Proteine', value: '0 g' },
        { label: 'Sale', value: '0 g' },
      ],
    },
  ],
  packaging: [
    { component: 'Bottiglia', material: 'Vetro verde', code: 'GL 71', disposal: 'Raccolta vetro' },
    { component: 'Tappo a vite', material: 'Alluminio', code: 'ALU 41', disposal: 'Raccolta metalli' },
    { component: 'Etichetta', material: 'Carta', code: 'PAP 22', disposal: 'Raccolta carta' },
  ],
  summary: {
    packagingType: 'Bottiglia',
    gpcCode: '10000275',
    gpcName: 'Vino - Frizzante',
    language: 'Italiano',
    netWeight: { value: '0,985', unit: 'kg' },
    grossWeight: { value: '1,55', unit: 'kg' },
    depth: { value: '8,5', unit: 'cm' },
    width: { value: '8,5', unit: 'cm' },
    height: { value: '31', unit: 'cm' },
    netContentUnit: 'Millilitri',
    netContentValue: '1000',
    salesCountries: ['Italia'],
  },
  packs: [
    { gtin: '18000000000931', status: 'Finalizzato', quantity: 6, modified: '2026-10-20' },
    { gtin: '28000000000938', status: 'Finalizzato', quantity: 12, modified: '2026-04-30' },
    { gtin: '38000000000935', status: 'Finalizzato', quantity: 72, modified: '2026-04-08' },
  ],
};

const PASTA: Product = {
  gtin: '8032089002028',
  status: 'Finalizzato',
  kind: 'pasta',
  gtinType: 'GTIN-13',
  description: 'Spaghetti di semola di grano duro 500 g',
  brand: 'Pastificio GS1',
  category: 'Pasta secca',
  netContent: '500 g',
  targetMarket: 'Italia',
  origin: 'Italia',
  salesName: 'Pasta di semola di grano duro',
  certifications: [],
  responsibleDrinking: [],
  createdAt: '3 marzo 2026',
  modified: '2026-10-20',
  variants: [],
  packaging: [{ component: 'Sacchetto', material: 'Polipropilene', code: 'PP 5', disposal: 'Raccolta plastica' }],
  summary: {
    packagingType: 'Sacchetto',
    gpcName: 'Pasta secca',
    language: 'Italiano',
    netWeight: { value: '0,5', unit: 'kg' },
    grossWeight: { value: '0,506', unit: 'kg' },
    depth: { value: '3', unit: 'cm' },
    width: { value: '11', unit: 'cm' },
    height: { value: '29', unit: 'cm' },
    netContentUnit: 'Grammi',
    netContentValue: '500',
    salesCountries: ['Italia'],
  },
  packs: [
    { gtin: '18032089002025', status: 'Finalizzato', quantity: 24, modified: '2026-10-20' },
  ],
};

const BISCUITS: Product = {
  gtin: '8032089000673',
  status: 'Finalizzato',
  kind: 'biscuits',
  gtinType: 'GTIN-13',
  description: 'Biscotti frollini 350 g',
  brand: 'Forno GS1',
  category: 'Biscotti dolci',
  netContent: '350 g',
  targetMarket: 'Italia',
  origin: 'Italia',
  salesName: 'Biscotti frollini',
  certifications: [],
  responsibleDrinking: [],
  createdAt: '2 marzo 2026',
  modified: '2026-10-02',
  variants: [],
  ecologicamentePublished: true,
  packaging: [
    { component: 'Astuccio', material: 'Cartoncino', code: 'PAP 21', disposal: 'Raccolta carta' },
    { component: 'Sacchetto interno', material: 'Polipropilene', code: 'PP 5', disposal: 'Raccolta plastica' },
  ],
  summary: {
    packagingType: 'Astuccio',
    gpcName: 'Biscotti dolci',
    language: 'Italiano',
    netWeight: { value: '0,35', unit: 'kg' },
    grossWeight: { value: '0,372', unit: 'kg' },
    depth: { value: '6', unit: 'cm' },
    width: { value: '19', unit: 'cm' },
    height: { value: '24', unit: 'cm' },
    netContentUnit: 'Grammi',
    netContentValue: '350',
    salesCountries: ['Italia'],
  },
  packs: [
    { gtin: '18032089000670', status: 'Finalizzato', quantity: 12, modified: '2026-10-02' },
    { gtin: '28032089000677', status: 'Finalizzato', quantity: 120, modified: '2026-06-15' },
  ],
};

const OIL: Product = {
  gtin: '8000000000521',
  status: 'Finalizzato',
  kind: 'oil',
  gtinType: 'GTIN-13',
  description: 'Olio extravergine di oliva 50 cl',
  brand: 'Frantoio GS1',
  category: "Olio d'oliva",
  netContent: '500 ml',
  targetMarket: 'Italia',
  origin: 'Italia',
  salesName: 'Olio extravergine di oliva',
  certifications: [],
  responsibleDrinking: [],
  createdAt: '22 gennaio 2026',
  modified: '2026-09-28',
  variants: [],
  ecologicamentePublished: true,
  packaging: [
    { component: 'Bottiglia', material: 'Vetro verde', code: 'GL 71', disposal: 'Raccolta vetro' },
    { component: 'Tappo', material: 'Alluminio', code: 'ALU 41', disposal: 'Raccolta metalli' },
    { component: 'Etichetta', material: 'Carta', code: 'PAP 22', disposal: 'Raccolta carta' },
  ],
  summary: {
    packagingType: 'Bottiglia',
    gpcName: "Olio d'oliva",
    language: 'Italiano',
    netWeight: { value: '0,46', unit: 'kg' },
    grossWeight: { value: '0,82', unit: 'kg' },
    depth: { value: '6,5', unit: 'cm' },
    width: { value: '6,5', unit: 'cm' },
    height: { value: '29', unit: 'cm' },
    netContentUnit: 'Millilitri',
    netContentValue: '500',
    salesCountries: ['Italia'],
  },
  packs: [
    { gtin: '18000000000528', status: 'Finalizzato', quantity: 6, modified: '2026-09-28' },
  ],
};

/** Prodotto in bozza: la tab Digital Link e il QR code non sono disponibili (specifica §4.1, §5). */
const SPUMANTE: Product = {
  gtin: '8032089415217',
  status: 'Bozza',
  kind: 'wine',
  gtinType: 'GTIN-13',
  description: 'Spumante brut 750 ml',
  brand: 'Cantina Sociale GS1',
  category: 'Vino spumante',
  netContent: '750 ml',
  targetMarket: 'Italia',
  origin: 'Italia',
  salesName: 'Vino spumante brut',
  certifications: [],
  responsibleDrinking: [
    'Rischi per la salute durante la gravidanza',
    'Non bere e guidare',
    'Non servire a minorenni',
  ],
  createdAt: '21 settembre 2026',
  modified: '2026-09-21',
  variants: [],
  packaging: [{ component: 'Bottiglia', material: 'Vetro verde', code: 'GL 71', disposal: 'Raccolta vetro' }],
  summary: {
    packagingType: 'Bottiglia',
    gpcName: 'Vino spumante',
    language: 'Italiano',
    netContentUnit: 'Millilitri',
    netContentValue: '750',
    salesCountries: ['Italia'],
  },
  packs: [],
};

/** I link generati dai servizi per un prodotto: uno per variante Brindo. */
export function generatedLinks(p: Product): GeneratedLink[] {
  const gtin14 = p.gtin.padStart(14, '0');
  const links: GeneratedLink[] = p.variants.map((v) => ({
    service: 'Brindo',
    linkType: 'pip',
    lang: 'it',
    url: `https://brindo.example/etichetta/01/${gtin14}/22/${v.cpv}`,
    qualifier: `22/${v.cpv}`,
    note: `variante ${v.cpv} · annata ${v.vintage}`,
  }));
  // Ecologicamente per ora non genera link (fuori perimetro della release 1, come da specifica).
  return links;
}

/** I prodotti della demo, nell'ordine in cui compaiono negli elenchi. */
export const DEMO_PRODUCTS: readonly Product[] = [WINE, PASTA, BISCUITS, OIL, SPUMANTE];

/** Il prodotto del Figma, su cui si apre la demo. */
export const MAIN_PRODUCT = WINE;

/**
 * Link di esempio per ogni prodotto ("Carica l'esempio completo"). Per il vino sono quelli
 * dell'ultima schermata del Figma.
 */
export const SAMPLE_LINKS: Record<string, Omit<DigitalLinkEntry, 'id'>[]> = {
  [WINE.gtin]: [
    { linkType: 'pip', url: 'https://brand.com/product/it/12345', lang: 'it' },
    { linkType: 'pip', url: 'https://brand.com/product/en/12345', lang: 'en' },
    { linkType: 'allergenInfo', url: 'https://brand.com/product/it/12345/allergens', lang: 'it' },
    { linkType: 'sustainabilityInfo', url: 'https://brand.com/product/it/12345/sustainability', lang: 'it' },
  ],
  [PASTA.gtin]: [
    { linkType: 'pip', url: 'https://brand.com/pasta/it/spaghetti-500', lang: 'it' },
    { linkType: 'pip', url: 'https://brand.com/pasta/en/spaghetti-500', lang: 'en' },
    { linkType: 'recipeInfo', url: 'https://brand.com/pasta/it/ricette/spaghetti', lang: 'it' },
    { linkType: 'nutritionalInfo', url: 'https://brand.com/pasta/it/spaghetti-500/valori-nutrizionali', lang: 'it' },
    { linkType: 'sustainabilityInfo', url: 'https://brand.com/pasta/it/spaghetti-500/riciclo', lang: 'it' },
  ],
  [BISCUITS.gtin]: [
    { linkType: 'pip', url: 'https://brand.com/forno/it/frollini-350', lang: 'it' },
    { linkType: 'allergenInfo', url: 'https://brand.com/forno/it/frollini-350/allergeni', lang: 'it' },
    { linkType: 'allergenInfo', url: 'https://brand.com/forno/en/frollini-350/allergens', lang: 'en' },
    { linkType: 'ingredientsInfo', url: 'https://brand.com/forno/it/frollini-350/ingredienti', lang: 'it' },
    { linkType: 'promotion', url: 'https://brand.com/forno/it/concorso', lang: 'it' },
  ],
  [OIL.gtin]: [
    { linkType: 'pip', url: 'https://brand.com/frantoio/it/evo-50cl', lang: 'it' },
    { linkType: 'traceability', url: 'https://brand.com/frantoio/it/evo-50cl/tracciabilita', lang: 'it' },
    { linkType: 'recipeInfo', url: 'https://brand.com/frantoio/it/ricette', lang: 'it' },
  ],
};
