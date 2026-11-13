import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DemoStore } from '../../core/demo-store';
import { Icon } from '../../ui/icon';
import { ProductActionsMenu } from '../../ui/product-actions-menu';
import { Toasts } from '../../ui/toast';
import { TutorialModal } from '../../ui/tutorial';

const DEMO_ONLY = 'Nella demo sono consultabili i prodotti con l’etichetta “Demo”';

type Status = 'Bozza' | 'Finalizzato' | 'Cancellato';
type Source = 'GDSN' | 'Immagino' | 'Locale';

interface Row {
  gtin: string;
  type: 'GTIN-13';
  status: Status;
  source: Source;
  description: string;
  /** Data di modifica, ISO, per ordinare. */
  modified: string;
  markets: ('IT' | 'US')[];
}

type SortKey = 'gtin' | 'status' | 'description' | 'modified';
type FilterGroup = 'type' | 'status' | 'source' | 'dl';

/**
 * "Prodotti a peso fisso" (Prodotti › Unità singole), sul modello della pagina di Codifico+.
 * Elenco con ricerca, ordinamento, paginazione e filtri a destra; la novità del GS1 Digital
 * Link compare come etichetta nello stato, come filtro e nel menu ⌄ di ogni riga.
 * I prodotti sono di esempio, tutti su prefissi GS1 Italy.
 */
@Component({
  selector: 'app-products-page',
  imports: [Icon, ProductActionsMenu, TutorialModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage {
  protected store = inject(DemoStore);
  protected tutorialOpen = signal(false);

  /** Prodotti finalizzati senza link attivi: quelli che possono ancora avere il GS1 Digital Link. */
  protected toConfigure = computed(() => this.rows().filter((r) => r.status === 'Finalizzato' && !this.linkCount(r.gtin)).length);

  /** Barra "Novità": finché nessun prodotto ha link e l'utente non l'ha chiusa. */
  protected showNews = computed(
    () => !this.store.discovery().listHintClosed && this.store.productsWithLinks() === 0 && this.toConfigure() > 0,
  );

  /** Filtra l'elenco sui prodotti finalizzati ancora da configurare. */
  protected showToConfigure(): void {
    this.filters.set({ type: [], status: ['Finalizzato'], source: [], dl: ['Da configurare'] });
  }
  private toasts = inject(Toasts);
  private router = inject(Router);

  protected rows = signal<Row[]>(this.withDemoProducts([
    { gtin: '8032089003216', type: 'GTIN-13', status: 'Cancellato', source: 'Locale', description: 'GS1 Italy Spaghetti Integrali 500 gr', modified: '2026-09-25', markets: [] },
    { gtin: '8032089415217', type: 'GTIN-13', status: 'Bozza', source: 'Locale', description: 'Spumante brut 750 ml', modified: '2026-09-21', markets: ['IT'] },
    { gtin: '8000000000934', type: 'GTIN-13', status: 'Finalizzato', source: 'Locale', description: '', modified: '', markets: [] },
    { gtin: '8032089000840', type: 'GTIN-13', status: 'Bozza', source: 'Locale', description: 'Olio extravergine di oliva 500 ml', modified: '2026-08-07', markets: [] },
    { gtin: '8032089000109', type: 'GTIN-13', status: 'Bozza', source: 'Locale', description: 'Tubo in PVC diametro 10 cm', modified: '2026-07-28', markets: ['IT'] },
    { gtin: '8032089755641', type: 'GTIN-13', status: 'Finalizzato', source: 'GDSN', description: 'Vaschetta porta oggetti 6 pz', modified: '2026-06-18', markets: ['IT'] },
    { gtin: '8032089000093', type: 'GTIN-13', status: 'Finalizzato', source: 'Locale', description: 'Tubo in PVC diametro 10 cm, confezione da 5', modified: '2026-04-30', markets: ['IT'] },
    { gtin: '8032089678957', type: 'GTIN-13', status: 'Finalizzato', source: 'Locale', description: 'Detergente pavimenti 1000 ml', modified: '2026-03-04', markets: [] },
    { gtin: '8032089001106', type: 'GTIN-13', status: 'Finalizzato', source: 'Immagino', description: 'Amaro riserva 70 cl', modified: '2026-02-03', markets: ['IT'] },
    { gtin: '8000000000521', type: 'GTIN-13', status: 'Bozza', source: 'Locale', description: 'Olio di oliva extravergine 50 cl', modified: '2026-01-22', markets: [] },
    { gtin: '8000000000569', type: 'GTIN-13', status: 'Finalizzato', source: 'Locale', description: 'Patate a pasta gialla 2 kg', modified: '2026-01-15', markets: [] },
    { gtin: '8032089000024', type: 'GTIN-13', status: 'Finalizzato', source: 'Locale', description: 'Esempio per QR code', modified: '2025-12-11', markets: [] },
    { gtin: '8032089002028', type: 'GTIN-13', status: 'Finalizzato', source: 'Locale', description: 'GS1 Italy Pasta', modified: '2023-10-20', markets: ['IT', 'US'] },
    { gtin: '8032089001014', type: 'GTIN-13', status: 'Finalizzato', source: 'Locale', description: 'GS1 Italy Phone1 5G', modified: '2023-07-25', markets: ['IT', 'US'] },
    { gtin: '8032089000451', type: 'GTIN-13', status: 'Finalizzato', source: 'Locale', description: 'Acqua minerale naturale 1,5 l', modified: '2023-05-12', markets: ['IT'] },
    { gtin: '8032089000673', type: 'GTIN-13', status: 'Bozza', source: 'Locale', description: 'Biscotti frollini 350 g', modified: '2023-03-02', markets: [] },
  ]));

  protected pageSize = signal(10);
  protected page = signal(0);
  protected query = signal('');
  protected sort = signal<{ key: SortKey; dir: 1 | -1 }>({ key: 'modified', dir: -1 });
  protected filters = signal<Record<FilterGroup, string[]>>({ type: [], status: [], source: [], dl: [] });

  /** I prodotti della demo prendono descrizione, stato e data dallo store. */
  private withDemoProducts(rows: Row[]): Row[] {
    return rows.map((r) => {
      const p = this.store.find(r.gtin);
      return p ? { ...r, status: p.status, description: p.description, modified: p.modified } : r;
    });
  }

  protected isDemo(gtin: string): boolean {
    return this.store.has(gtin);
  }

  protected linkCount(gtin: string): number {
    return this.store.linkCountFor(gtin);
  }

  private dlState(r: Row): string {
    return this.linkCount(r.gtin) ? 'Configurato' : 'Da configurare';
  }

  private valueOf(r: Row, group: FilterGroup): string {
    return group === 'type' ? r.type : group === 'status' ? r.status : group === 'source' ? r.source : this.dlState(r);
  }

  /** Righe dopo ricerca e filtri, ordinate. */
  protected filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filters();
    const { key, dir } = this.sort();
    return this.rows()
      .filter((r) => !q || r.gtin.includes(q) || r.description.toLowerCase().includes(q))
      .filter((r) => (Object.keys(f) as FilterGroup[]).every((g) => !f[g].length || f[g].includes(this.valueOf(r, g))))
      .sort((a, b) => a[key].localeCompare(b[key], 'it') * dir);
  });

  protected pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  protected visible = computed(() => {
    const start = Math.min(this.page(), this.pageCount() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  protected activeFilters = computed(() => Object.values(this.filters()).reduce((n, v) => n + v.length, 0));

  /** Gruppi di filtri con i conteggi sull'intero elenco, come in Codifico+. */
  protected facets = computed(() => {
    const count = (group: FilterGroup, value: string) => this.rows().filter((r) => this.valueOf(r, group) === value).length;
    const groups: { id: FilterGroup; label: string; values: string[]; isNew?: boolean }[] = [
      { id: 'type', label: 'Tipo', values: ['GTIN-13'] },
      { id: 'status', label: 'Stato', values: ['Bozza', 'Finalizzato', 'Cancellato'] },
      { id: 'source', label: 'Fonte', values: ['GDSN', 'Immagino', 'Locale'] },
      { id: 'dl', label: 'GS1 Digital Link', values: ['Configurato', 'Da configurare'], isNew: true },
    ];
    return groups.map((g) => ({ ...g, items: g.values.map((v) => ({ value: v, count: count(g.id, v) })) }));
  });

  protected isOn(group: FilterGroup, value: string): boolean {
    return this.filters()[group].includes(value);
  }

  protected toggleFilter(group: FilterGroup, value: string): void {
    this.filters.update((f) => ({
      ...f,
      [group]: f[group].includes(value) ? f[group].filter((v) => v !== value) : [...f[group], value],
    }));
    this.page.set(0);
  }

  protected clearFilters(): void {
    this.filters.set({ type: [], status: [], source: [], dl: [] });
    this.page.set(0);
  }

  protected sortBy(key: SortKey): void {
    this.sort.update((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  }

  protected sortIcon(key: SortKey): string {
    const s = this.sort();
    return s.key !== key ? '' : s.dir === 1 ? 'asc' : 'desc';
  }

  protected setQuery(value: string): void {
    this.query.set(value);
    this.page.set(0);
  }

  protected setPageSize(value: string): void {
    this.pageSize.set(Number(value));
    this.page.set(0);
  }

  protected date(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  /** Apre la scheda del prodotto: "Visualizza" e il codice portano alla tab Base, i chip Digital Link alla loro tab. */
  protected open(r: Row, tab: 'base' | 'digital-link' = 'base'): void {
    if (this.store.has(r.gtin)) void this.router.navigate(['/prodotti', r.gtin, tab]);
    else this.toasts.show(DEMO_ONLY, 'info');
  }

  protected restore(r: Row): void {
    this.rows.update((rows) => rows.map((x) => (x.gtin === r.gtin ? { ...x, status: 'Bozza' } : x)));
    this.toasts.show(`Prodotto ${r.gtin} ripristinato come bozza`);
  }

  protected remove(r: Row): void {
    this.rows.update((rows) => rows.filter((x) => x.gtin !== r.gtin));
    this.toasts.show(`Prodotto ${r.gtin} eliminato definitivamente`);
  }

  protected notInDemo(): void {
    this.toasts.show('Funzione non inclusa nella demo', 'info');
  }

  /** "Esporta" funziona davvero: CSV dell'elenco filtrato, con la colonna Digital Link. */
  protected exportCsv(): void {
    const head = ['Codice prodotto', 'Tipo', 'Stato', 'Fonte', 'Descrizione', 'Data modifica', 'Mercato', 'GS1 Digital Link'];
    const lines = this.filtered().map((r) =>
      [r.gtin, r.type, r.status, r.source, r.description, this.date(r.modified), r.markets.join(' '), this.linkCount(r.gtin)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(';'),
    );
    const blob = new Blob(['﻿' + [head.join(';'), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prodotti-a-peso-fisso.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toasts.show('Esportato prodotti-a-peso-fisso.csv');
  }
}
