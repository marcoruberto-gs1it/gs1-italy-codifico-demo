import { Injectable, computed, effect, signal } from '@angular/core';
import { DEMO_PRODUCTS, DigitalLinkEntry, GeneratedLink, MAIN_PRODUCT, Product, SAMPLE_LINKS, generatedLinks } from './demo-data';

/**
 * Stato della demo, salvato in sessionStorage: le modifiche sopravvivono al ricaricamento della
 * pagina ma non alla chiusura della scheda, così ogni presentazione riparte pulita.
 * Non c'è backend: le "CRUD" sono operazioni su questi segnali.
 *
 * Ogni prodotto ha il proprio stato (link, destinazione principale, stato del GTIN). Le pagine
 * del prodotto lavorano sul "prodotto corrente", scelto dalla rotta (vedi selectProductGuard).
 */
interface ProductState {
  links: DigitalLinkEntry[];
  /** Id del link scelto come "Destinazione Principale" (defaultLink nel resolver). */
  defaultLinkId: string | null;
  gtinActive: boolean;
}

type State = Record<string, ProductState>;

const STORAGE_KEY = 'codifico-demo:v2';
const DISCOVERY_KEY = 'codifico-demo:novita';

/**
 * Richiami alla novità GS1 Digital Link già visti o chiusi dall'utente. Servono a farla
 * scoprire a chi non l'ha mai usata, senza riproporli a ogni pagina.
 */
export interface Discovery {
  /** L'utente ha aperto almeno una volta la tab Digital Link: via l'etichetta "Nuovo". */
  tabSeen: boolean;
  /** Ha chiuso il riquadro "Novità" nella tab Base. */
  baseHintClosed: boolean;
  /** Ha chiuso la barra "Novità" nell'elenco prodotti. */
  listHintClosed: boolean;
}

const NO_DISCOVERY: Discovery = { tabSeen: false, baseHintClosed: false, listHintClosed: false };

export type LinkInput = Omit<DigitalLinkEntry, 'id'>;

@Injectable({ providedIn: 'root' })
export class DemoStore {
  readonly products = DEMO_PRODUCTS;

  private readonly state = signal<State>(load());
  /** Richiami alla novità già visti o chiusi (sessionStorage, come il resto della demo). */
  readonly discovery = signal<Discovery>(loadDiscovery());
  private readonly currentGtin = signal(MAIN_PRODUCT.gtin);

  /** Il prodotto aperto. */
  readonly product = computed<Product>(() => this.find(this.currentGtin()) ?? MAIN_PRODUCT);
  private readonly current = computed(() => this.state()[this.product().gtin] ?? emptyState());

  readonly links = computed(() => this.current().links);

  /**
   * Destinazione Principale effettiva: quella scelta (un link dell'azienda o uno generato sul
   * GTIN). Se l'azienda non ha ancora link propri, la prende il primo link generato sul GTIN
   * (es. l'etichetta ambientale di Ecologicamente), così il QR code porta già a una pagina utile.
   * Il primo link creato dall'azienda la sostituisce (vedi addLink).
   */
  readonly defaultLink = computed<DigitalLinkEntry | null>(() => {
    const all = this.resolvableLinks();
    const chosen = all.find((l) => l.id === this.current().defaultLinkId);
    if (chosen) return chosen;
    return this.activeLinks()[0] ?? all[0] ?? null;
  });

  /** Link attivi dell'azienda: sono gli unici che il resolver usa (i disattivati restano nello storico). */
  readonly activeLinks = computed(() => this.links().filter(isActive));

  /** Il prodotto è finalizzato: solo così ha la tab Digital Link e il QR code. */
  readonly finalized = computed(() => this.product().status === 'Finalizzato');
  readonly defaultLinkId = computed(() => this.defaultLink()?.id ?? null);
  readonly gtinActive = computed(() => this.current().gtinActive);

  /** Link generati dai servizi (Brindo, Ecologicamente): visibili ma non modificabili. */
  readonly generated = computed<GeneratedLink[]>(() => generatedLinks(this.product()));

  /**
   * Link che il resolver considera per l'URL base (/01/{gtin}): quelli dell'utente più quelli
   * generati sul GTIN. I link Brindo stanno sulle varianti (/22/...) e hanno un URI proprio.
   */
  readonly resolvableLinks = computed<DigitalLinkEntry[]>(() => [
    ...this.activeLinks(),
    ...this.generated()
      .filter((g) => !g.qualifier)
      .map((g) => ({ id: generatedLinkId(g), linkType: g.linkType, url: g.url, lang: g.lang })),
  ]);

  /** Link generati dai servizi sul GTIN (senza qualificatore): stanno nel livello prodotto. */
  readonly gtinGenerated = computed<GeneratedLink[]>(() => this.generated().filter((g) => !g.qualifier));

  /** Quanti prodotti hanno almeno un link (per la home). */
  readonly productsWithLinks = computed(() => this.products.filter((p) => this.linkCountFor(p.gtin) > 0).length);

  constructor() {
    effect(() => save(this.state()));
    effect(() => saveDiscovery(this.discovery()));
  }

  find(gtin: string): Product | undefined {
    return this.products.find((p) => p.gtin === gtin);
  }

  has(gtin: string): boolean {
    return !!this.find(gtin);
  }

  /** Imposta il prodotto corrente; false se il GTIN non è nella demo. */
  select(gtin: string): boolean {
    if (!this.has(gtin)) return false;
    this.currentGtin.set(gtin);
    return true;
  }

  /** Link attivi di un prodotto (per home ed elenco). */
  linkCountFor(gtin: string): number {
    return this.state()[gtin]?.links.filter(isActive).length ?? 0;
  }

  gtinActiveFor(gtin: string): boolean {
    return this.state()[gtin]?.gtinActive ?? true;
  }

  addLink(input: LinkInput): DigitalLinkEntry {
    const entry: DigitalLinkEntry = { ...input, id: newId(), active: true };
    this.patch((s) => {
      const currentDefault = s.links.find((l) => l.id === s.defaultLinkId);
      return {
        ...s,
        links: [...s.links, entry],
        // Il primo link attivo diventa la destinazione principale.
        defaultLinkId: currentDefault && isActive(currentDefault) ? s.defaultLinkId : entry.id,
      };
    });
    return entry;
  }

  updateLink(id: string, input: LinkInput): void {
    this.patch((s) => ({ ...s, links: s.links.map((l) => (l.id === id ? { ...l, ...input, id } : l)) }));
  }

  /**
   * Disattiva o riattiva un link (disattivazione logica, specifica §3). Se si disattiva la
   * destinazione principale, subentra il primo link attivo rimasto; riattivando un link quando
   * non c'è una destinazione principale attiva, diventa lui la principale.
   */
  setLinkActive(id: string, active: boolean): void {
    this.patch((s) => {
      const links = s.links.map((l) => (l.id === id ? { ...l, active } : l));
      const current = links.find((l) => l.id === s.defaultLinkId);
      let defaultLinkId = s.defaultLinkId;
      if (!current || !isActive(current)) defaultLinkId = links.find(isActive)?.id ?? null;
      return { ...s, links, defaultLinkId };
    });
  }

  setDefaultLink(id: string): void {
    this.patch((s) => ({ ...s, defaultLinkId: id }));
  }

  setGtinActive(active: boolean): void {
    this.patch((s) => ({ ...s, gtinActive: active }));
  }

  /**
   * Esiste già un link con la stessa tipologia e lingua (escluso quello in modifica)?
   * Restituisce chi lo ha creato: 'utente' o il servizio che lo ha generato; null se è libero.
   */
  duplicateOf(input: Pick<LinkInput, 'linkType' | 'lang'>, exceptId?: string): 'utente' | GeneratedLink['service'] | null {
    const same = (l: { linkType: string; lang: string }) =>
      l.linkType === input.linkType && l.lang.toLowerCase() === input.lang.toLowerCase();
    if (this.activeLinks().some((l) => l.id !== exceptId && same(l))) return 'utente';
    return this.generated().find((g) => !g.qualifier && same(g))?.service ?? null;
  }

  /** Riporta la demo allo stato iniziale: nessun link su nessun prodotto. */
  reset(): void {
    this.state.set({});
    this.discovery.set(NO_DISCOVERY);
  }

  /** Segna un richiamo alla novità come visto o chiuso. */
  markDiscovery(key: keyof Discovery): void {
    if (!this.discovery()[key]) this.discovery.update((d) => ({ ...d, [key]: true }));
  }

  /** Carica i link di esempio su tutti i prodotti. */
  loadSample(): void {
    const next: State = {};
    for (const p of this.products) {
      const links = (SAMPLE_LINKS[p.gtin] ?? []).map((l) => ({ ...l, id: newId(), active: true }));
      next[p.gtin] = { links, defaultLinkId: links[0]?.id ?? null, gtinActive: true };
    }
    this.state.set(next);
  }

  private patch(fn: (s: ProductState) => ProductState): void {
    const gtin = this.product().gtin;
    this.state.update((all) => ({ ...all, [gtin]: fn(all[gtin] ?? emptyState()) }));
  }
}

function emptyState(): ProductState {
  return { links: [], defaultLinkId: null, gtinActive: true };
}

function load(): State {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    // Storage non disponibile o dati corrotti: si riparte dallo stato iniziale.
  }
  return {};
}

function save(state: State): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Navigazione privata o quota piena: la demo funziona comunque, solo senza persistenza.
  }
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/** Id stabile di un link generato, usabile come Destinazione Principale. */
export function generatedLinkId(g: Pick<GeneratedLink, 'service' | 'linkType' | 'lang'>): string {
  return `gen:${g.service}:${g.linkType}:${g.lang}`;
}

/** Un link senza il campo active (dati salvati prima) conta come attivo. */
export function isActive(l: Pick<DigitalLinkEntry, 'active'>): boolean {
  return l.active !== false;
}

function loadDiscovery(): Discovery {
  try {
    const raw = sessionStorage.getItem(DISCOVERY_KEY);
    if (raw) return { ...NO_DISCOVERY, ...(JSON.parse(raw) as Partial<Discovery>) };
  } catch {
    // Storage non disponibile: i richiami ripartono da capo.
  }
  return NO_DISCOVERY;
}

function saveDiscovery(d: Discovery): void {
  try {
    sessionStorage.setItem(DISCOVERY_KEY, JSON.stringify(d));
  } catch {
    // Navigazione privata o quota piena: nessuna persistenza, la demo funziona comunque.
  }
}
