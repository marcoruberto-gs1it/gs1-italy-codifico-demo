import { Injectable, computed, inject, signal } from '@angular/core';
import { generatedLinks } from '../../core/demo-data';
import { DemoStore } from '../../core/demo-store';
import { CatalogItem, Gln, GlnType, SCENARIOS, ScenarioId, DEFAULT_SCENARIO } from '../../core/dashboard-data';
import { linkTypeLabel } from '../../core/vocabulary';

/** Un prodotto del catalogo con il suo stato Digital Link, già calcolato. */
export interface CatalogRow extends CatalogItem {
  /** Link attivi: dell'azienda più quelli generati dai servizi (es. Brindo). 0 = senza DL. */
  linkCount: number;
  /** Tipologie dei link attivi, senza ripetizioni. */
  types: string[];
  /** Etichette per il tooltip, es. "Pagina informativa di prodotto (Brindo)". */
  typeLabels: string[];
}

/** Gli indicatori "Contenuti collegati" della card Digital Link. */
const CONTENT_INDICATORS = [
  { type: 'sustainabilityInfo', label: 'Sostenibilità' },
  { type: 'allergenInfo', label: 'Allergeni' },
  { type: 'instructions', label: 'Istruzioni d’uso' },
] as const;

const GLN_TYPES: GlnType[] = ['Entità legale', 'Ubicazione fisica', 'Funzione'];

/**
 * Tutti i numeri della dashboard, ricavati dallo scenario e dallo store della demo.
 * Regole Digital Link: il perimetro sono i prodotti a peso fisso finalizzati; un prodotto ha il
 * DL se ha almeno un link attivo, compresi quelli generati da un servizio come Brindo; non ci
 * sono stati intermedi, quindi con DL + senza DL = perimetro.
 */
@Injectable()
export class DashboardModel {
  private store = inject(DemoStore);

  readonly scenarioId = signal<ScenarioId>(DEFAULT_SCENARIO);
  readonly scenario = computed(() => SCENARIOS[this.scenarioId()]);
  readonly company = computed(() => this.scenario().company);

  /** Catalogo con lo stato DL: per i prodotti demo dallo store, per gli altri dai mock. */
  readonly catalog = computed<CatalogRow[]>(() =>
    this.scenario().catalog.map((item) => {
      if (!item.demo) {
        return { ...item, linkCount: item.linkTypes.length, types: item.linkTypes, typeLabels: item.linkTypes.map(linkTypeLabel) };
      }
      const product = this.store.find(item.gtin)!;
      const own = this.store.activeLinksFor(item.gtin);
      const services = generatedLinks(product);
      const types = [...new Set([...own.map((l) => l.linkType), ...services.map((g) => g.linkType)])];
      const typeLabels = [
        ...new Set([
          ...own.map((l) => linkTypeLabel(l.linkType)),
          ...services.map((g) => `${linkTypeLabel(g.linkType)} (${g.service})`),
        ]),
      ];
      return { ...item, linkCount: own.length + services.length, types, typeLabels };
    }),
  );

  /* ---- Prodotti ---- */

  readonly products = computed(() => {
    const all = this.catalog();
    const capacity = this.scenario()
      .prefixes.filter((p) => p.use === 'gtin')
      .reduce((s, p) => s + p.capacity, 0);
    return {
      total: all.length,
      drafts: all.filter((p) => p.status === 'Bozza').length,
      capacity,
      saturation: capacity ? all.length / capacity : 0,
    };
  });

  /* ---- Digital Link ---- */

  /** Il perimetro: prodotti a peso fisso finalizzati, dal più recente. */
  readonly finalized = computed(() =>
    this.catalog()
      .filter((p) => p.status === 'Finalizzato')
      .sort((a, b) => b.modified.localeCompare(a.modified)),
  );

  readonly dl = computed(() => {
    const scope = this.finalized();
    const withDl = scope.filter((p) => p.linkCount > 0);
    return {
      scope: scope.length,
      withDl: withDl.length,
      without: scope.length - withDl.length,
      coverage: scope.length ? withDl.length / scope.length : 0,
      contents: CONTENT_INDICATORS.map((c) => ({
        label: c.label,
        count: withDl.filter((p) => p.types.includes(c.type)).length,
      })),
    };
  });

  readonly stats = computed(() => {
    const s = this.scenario().stats;
    if (!s) return null;
    const top = this.catalog().find((p) => p.gtin === s.topGtin);
    return { ...s, topDescription: top?.description ?? s.topGtin };
  });

  /* ---- GLN ---- */

  readonly glns = computed<Gln[]>(() => [...this.scenario().glns].sort((a, b) => b.modified.localeCompare(a.modified)));

  readonly glnSummary = computed(() => {
    const all = this.scenario().glns;
    return {
      total: all.length,
      published: all.filter((g) => g.published).length,
      byType: GLN_TYPES.map((type) => ({ type, count: all.filter((g) => g.type === type).length })).filter((t) => t.count),
    };
  });

  readonly legalEntity = computed(() => this.scenario().glns.find((g) => g.type === 'Entità legale') ?? null);

  /** Prefissi con l'utilizzo calcolato da catalogo e GLN. */
  readonly prefixes = computed(() =>
    this.scenario().prefixes.map((p) => {
      const codes = p.use === 'gtin' ? this.catalog().map((c) => c.gtin) : this.scenario().glns.map((g) => g.gln);
      return { ...p, used: codes.filter((c) => c.startsWith(p.code)).length };
    }),
  );

  /* ---- Ultimi codici censiti ---- */

  readonly recentProducts = computed(() =>
    [...this.catalog()].sort((a, b) => b.modified.localeCompare(a.modified)).slice(0, 5),
  );

  readonly recentGlns = computed(() => this.glns().slice(0, 5));
}
