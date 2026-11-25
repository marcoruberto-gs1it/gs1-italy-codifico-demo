import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GLN_AI, GLN_TYPE_INFO, GLN_TYPES, GLN_USES, GlnAi, GlnRecord, GlnType } from '../../core/gln-data';
import { GlnStore } from '../../core/gln-store';
import { FilterOverview, OverviewGroup } from '../../ui/filter-overview';
import { Icon } from '../../ui/icon';
import { Toasts } from '../../ui/toast';
import { RegistryBadge } from './registry-badge';

type SortKey = 'gln' | 'name' | 'modified';
type FilterGroup = 'type' | 'status' | 'registry';

/**
 * "Sedi e località" (ex "I miei GLN"): l'elenco dei GLN dell'azienda, con la stessa struttura
 * di Prodotti a peso fisso (ricerca, ordinamento, paginazione, filtri a destra).
 * Rispetto a oggi: un'introduzione che spiega cosa sono e a cosa servono, tipi in parole
 * semplici, una sola colonna di stato e una per il registro GS1 al posto di tre badge, un
 * invito a completare i GLN con il tipo da specificare.
 */
@Component({
  selector: 'app-places-page',
  imports: [Icon, RouterLink, RegistryBadge, FilterOverview],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './places-page.html',
  styleUrls: ['../products/products-page.css', './places-page.css'],
})
export class PlacesPage {
  protected store = inject(GlnStore);
  private router = inject(Router);
  private toasts = inject(Toasts);

  protected readonly info = GLN_TYPE_INFO;
  protected readonly types = GLN_TYPES;
  protected readonly ai = GLN_AI;
  /** I tipi raggruppati per AI, per l'introduzione. */
  protected readonly families = (['417', '414'] as GlnAi[]).map((ai) => ({
    ai,
    ...GLN_AI[ai],
    types: GLN_TYPES.filter((t) => GLN_TYPE_INFO[t].ai === ai),
  }));
  protected readonly uses = GLN_USES;

  protected pageSize = signal(10);
  protected page = signal(0);
  protected query = signal('');
  protected sort = signal<{ key: SortKey; dir: 1 | -1 }>({ key: 'modified', dir: -1 });
  protected filters = signal<Record<FilterGroup, string[]>>({ type: [], status: [], registry: [] });

  protected toSpecify = computed(() => this.store.all().filter((g) => g.type === 'Da specificare'));

  private valueOf(g: GlnRecord, group: FilterGroup): string {
    return group === 'type' ? g.type : group === 'status' ? g.status : g.registry;
  }

  protected filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filters();
    const { key, dir } = this.sort();
    return this.store
      .all()
      .filter((g) => !q || g.gln.includes(q) || g.name.toLowerCase().includes(q) || (g.address?.city ?? '').toLowerCase().includes(q))
      .filter((g) => (Object.keys(f) as FilterGroup[]).every((k) => !f[k].length || f[k].includes(this.valueOf(g, k))))
      .sort((a, b) => a[key].localeCompare(b[key], 'it') * dir);
  });

  protected pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  protected visible = computed(() => {
    const start = Math.min(this.page(), this.pageCount() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  /**
   * Riepilogo e filtri in alto. Tipo: la barra raggruppa per AI (417 soggetto, 414 luogo fisico)
   * e i filtri hanno l'icona del tipo; Stato e Registro usano i colori di badge e icone in tabella.
   */
  protected overview = computed<OverviewGroup[]>(() => {
    const all = this.store.all();
    const count = (group: FilterGroup, value: string) => all.filter((g) => this.valueOf(g, group) === value).length;
    const familyColor = (t: GlnType) => (GLN_TYPE_INFO[t].ai === '417' ? '#2e5eaa' : GLN_TYPE_INFO[t].ai === '414' ? '#018dbd' : '#b77400');
    const types: GlnType[] = [...GLN_TYPES, 'Da specificare'];
    const byAi = (ai: string | null) => all.filter((g) => GLN_TYPE_INFO[g.type].ai === ai).length;
    return [
      {
        id: 'type',
        label: 'Tipo',
        items: types
          .map((t) => ({ value: t, count: count('type', t), color: familyColor(t), icon: GLN_TYPE_INFO[t].icon }))
          .filter((i) => i.count || this.isOn('type', i.value)),
        bar: [
          { label: 'AI 417 · Soggetto', count: byAi('417'), color: '#2e5eaa' },
          { label: 'AI 414 · Luogo fisico', count: byAi('414'), color: '#018dbd' },
          { label: 'Da specificare', count: byAi(null), color: '#b77400' },
        ],
      },
      {
        id: 'status',
        label: 'Stato',
        items: [
          { value: 'Attivo', count: count('status', 'Attivo'), color: '#6dbb3c' },
          { value: 'Bozza', count: count('status', 'Bozza'), color: '#0f6fb5' },
          { value: 'Non attivo', count: count('status', 'Non attivo'), color: '#a8b3bd' },
        ],
      },
      {
        id: 'registry',
        label: 'Registro GS1',
        items: [
          { value: 'Visibile ai partner', count: count('registry', 'Visibile ai partner'), color: '#3f7a1a', icon: 'check-circle' },
          { value: 'In pubblicazione', count: count('registry', 'In pubblicazione'), color: '#0b5f9c', icon: 'clock' },
          { value: 'Non pubblicato', count: count('registry', 'Non pubblicato'), color: '#7d8c99', icon: 'minus-circle' },
        ],
      },
    ];
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

  protected showToSpecify(): void {
    this.filters.set({ type: ['Da specificare'], status: [], registry: [] });
    this.page.set(0);
  }

  protected clearFilters(): void {
    this.filters.set({ type: [], status: [], registry: [] });
    this.page.set(0);
  }

  protected sortBy(key: SortKey): void {
    this.sort.update((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  }

  protected sortIcon(key: SortKey): string {
    const s = this.sort();
    return s.key !== key ? '' : s.dir === 1 ? 'asc' : 'desc';
  }

  protected ariaSort(key: SortKey): string {
    const s = this.sort();
    return s.key !== key ? 'none' : s.dir === 1 ? 'ascending' : 'descending';
  }

  protected setQuery(value: string): void {
    this.query.set(value);
    this.page.set(0);
  }

  protected setPageSize(value: string): void {
    this.pageSize.set(Number(value));
    this.page.set(0);
  }

  protected typeClass(type: GlnType): string {
    return type === 'Da specificare' ? 'gln-type todo' : 'gln-type';
  }

  protected statusClass(g: GlnRecord): string {
    return g.status === 'Bozza' ? 'badge bozza' : g.status === 'Attivo' ? 'badge finalizzato' : 'badge cancellato';
  }

  protected date(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected open(g: GlnRecord): void {
    void this.router.navigate(g.status === 'Bozza' ? ['/sedi-localita', g.gln, 'modifica'] : ['/sedi-localita', g.gln]);
  }

  /** Esporta l'elenco filtrato in CSV, con le stesse colonne della tabella. */
  protected exportCsv(): void {
    const head = ['Codice GLN', 'Nome', 'Tipo', 'Stato', 'Registro GS1', 'Comune', 'Data modifica'];
    const rows = this.filtered().map((g) => [g.gln, g.name, g.type, g.status, g.registry, g.address?.city ?? '', this.date(g.modified)]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'sedi-e-localita.csv' });
    a.click();
    URL.revokeObjectURL(url);
    this.toasts.show(`Esportate ${rows.length} sedi e località`);
  }
}
