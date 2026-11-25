import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GLN_TYPE_INFO, parseScenario } from '../../core/dashboard-data';
import { Meter, Part, SegmentedBar, Sparkline, VIZ } from '../../ui/charts';
import { HelpPanel } from '../../ui/help-panel';
import { Icon } from '../../ui/icon';
import { ProductActionsMenu } from '../../ui/product-actions-menu';
import { Tip } from '../../ui/tip';
import { Toasts } from '../../ui/toast';
import { TUTORIAL, TutorialModal } from '../../ui/tutorial';
import { CatalogRow, DashboardModel } from './dashboard-model';
import { LinkProductDialog } from './link-product-dialog';

type RecentTab = 'fixed' | 'variable' | 'gln';
type RequestTab = 'changes' | 'variable';

const DEMO_ONLY = 'Nella demo sono consultabili i prodotti con l’etichetta “Demo”';
/** Utente della demo: gli annunci chiusi si ricordano per utente. */
const USER_KEY = 'mario.rossi';

/**
 * Dashboard di Codifico+ ("Benvenuto in Codifico"). Risponde a due domande, in quest'ordine:
 * "a che punto sono?" (riga di stato: Prodotti, Digital Link, GLN) e "cosa faccio adesso?"
 * (un'azione per blocco). Dall'alto: intestazione con la Guida, un annuncio alla volta, la riga
 * di stato, gli ultimi codici censiti; a lato l'azienda, l'accesso rapido e le risorse.
 * I numeri vengono da DashboardModel; lo scenario dei dati da ?scenario=a|b|c.
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    Icon,
    Tip,
    ProductActionsMenu,
    TutorialModal,
    HelpPanel,
    LinkProductDialog,
    SegmentedBar,
    Meter,
    Sparkline,
  ],
  providers: [DashboardModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  protected m = inject(DashboardModel);
  private toasts = inject(Toasts);
  private router = inject(Router);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private injector = inject(Injector);

  protected readonly t = TUTORIAL;
  protected readonly glnInfo = GLN_TYPE_INFO;

  protected helpOpen = signal(false);
  protected tutorialOpen = signal(false);
  protected pickerOpen = signal(false);
  protected howOpen = signal(false);
  protected tab = signal<RecentTab>('fixed');
  protected reqTab = signal<RequestTab>('changes');

  /** Tab delle richieste, con i conteggi nell'etichetta. */
  protected reqTabs = computed(() => [
    { id: 'changes' as const, label: 'Richieste di modifica', count: this.m.changeRequests().length },
    { id: 'variable' as const, label: 'Prodotti a peso variabile', count: this.m.variableRequests().length },
  ]);

  protected readonly tabs: { id: RecentTab; label: string }[] = [
    { id: 'fixed', label: 'Prodotti a peso fisso' },
    { id: 'variable', label: 'Prodotti a peso variabile' },
    { id: 'gln', label: 'GLN' },
  ];

  /** Prodotti per stato, per la barra segmentata della card Prodotti. */
  protected productParts = computed<Part[]>(() => [
    { label: 'Finalizzati', value: this.m.products().total - this.m.products().drafts, color: VIZ.s1 },
    { label: 'In bozza', value: this.m.products().drafts, color: VIZ.s2 },
  ]);

  /** Prodotti finalizzati con e senza Digital Link: stesso grafico della card Prodotti. */
  protected dlParts = computed<Part[]>(() => [
    { label: 'Con Digital Link', value: this.m.dl().withDl, color: VIZ.s1 },
    { label: 'Senza', value: this.m.dl().without, color: VIZ.s2 },
  ]);

  /** Scansioni per contenuto aperto; "Altri contenuti" in grigio, come resto. */
  protected scanParts = computed<Part[]>(() => {
    const colors = [VIZ.s1, VIZ.s2, VIZ.s3];
    return (this.m.stats()?.byContent ?? []).map((c, i) => ({
      label: c.label,
      value: c.value,
      color: c.other ? VIZ.muted : colors[i % colors.length],
    }));
  });

  /** Un solo annuncio alla volta: benvenuto senza prodotti finalizzati, altrimenti il Digital Link. */
  protected banner = computed<'welcome' | 'dl'>(() => (this.m.dl().scope === 0 ? 'welcome' : 'dl'));

  /** Annunci chiusi con "Ho capito" (localStorage, per utente e per annuncio). */
  private dismissed = signal<string[]>(loadDismissed());
  protected bannerDismissed = computed(() => this.dismissed().includes(this.banner()));
  protected bannerTitle = computed(() =>
    this.banner() === 'dl' ? 'Arriva il GS1 Digital Link' : 'Inizia dal tuo primo prodotto',
  );

  constructor() {
    const route = inject(ActivatedRoute);
    this.m.scenarioId.set(parseScenario(route.snapshot.queryParamMap.get('scenario')));
    route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((q) => this.m.scenarioId.set(parseScenario(q.get('scenario'))));
  }

  /* ---- Annunci ---- */

  /** L'utente ha preso atto dell'annuncio: sparisce e resta richiamabile dalla Guida. */
  protected dismissBanner(): void {
    this.setDismissed(true);
    this.toasts.show('Annuncio chiuso. Puoi rivederlo dalla Guida.', 'info');
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('.guide-btn')?.focus(), {
      injector: this.injector,
    });
  }

  protected restoreBanner(): void {
    this.setDismissed(false);
    this.helpOpen.set(false);
  }

  private setDismissed(value: boolean): void {
    const id = this.banner();
    this.dismissed.update((list) => (value ? [...new Set([...list, id])] : list.filter((x) => x !== id)));
    saveDismissed(this.dismissed());
  }

  protected openVideo(): void {
    this.helpOpen.set(false);
    this.tutorialOpen.set(true);
  }

  /* ---- Digital Link ---- */

  protected pick(row: CatalogRow): void {
    if (!row.demo) {
      this.toasts.show(DEMO_ONLY, 'info');
      return;
    }
    this.pickerOpen.set(false);
    void this.router.navigate(['/prodotti', row.gtin, 'digital-link']);
  }

  /** "Vedi l'andamento": porta al grafico nel dettaglio Digital Link. */
  protected showTrend(): void {
    const target = this.host.nativeElement.querySelector<HTMLElement>('#trend-title');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus({ preventScroll: true });
  }

  protected trendStart = computed(() => this.dayLabel(-((this.m.stats()?.daily.length ?? 1) - 1)));
  protected trendEnd = computed(() => this.dayLabel(0));

  private dayLabel(offset: number): string {
    const end = this.m.stats()?.end;
    if (!end) return '';
    const d = new Date(end + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  }

  /* ---- Ultimi codici censiti ---- */

  protected onTabKey(event: KeyboardEvent): void {
    const next = this.nextTab(event, this.tabs.map((t) => t.id), this.tab());
    if (next) this.selectTab(next, 'tab-', (id) => this.tab.set(id));
  }

  protected onReqTabKey(event: KeyboardEvent): void {
    const next = this.nextTab(event, this.reqTabs().map((t) => t.id), this.reqTab());
    if (next) this.selectTab(next, 'reqtab-', (id) => this.reqTab.set(id));
  }

  /** Frecce, Home e Fine fra le tab (pattern ARIA delle tab con attivazione automatica). */
  private nextTab<T extends string>(event: KeyboardEvent, ids: T[], current: T): T | null {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return null;
    event.preventDefault();
    const i = ids.indexOf(current);
    const n = ids.length;
    const j = event.key === 'Home' ? 0 : event.key === 'End' ? n - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + n) % n;
    return ids[j];
  }

  private selectTab<T extends string>(id: T, prefix: string, set: (id: T) => void): void {
    set(id);
    this.host.nativeElement.querySelector<HTMLElement>(`#${prefix}${id}`)?.focus();
  }

  /** Apre la scheda di un GTIN: solo i prodotti della demo hanno una scheda. */
  protected openGtin(gtin: string): void {
    const row = this.m.catalog().find((c) => c.gtin === gtin);
    if (row) this.openProduct(row);
    else this.toasts.show(DEMO_ONLY, 'info');
  }

  protected openProduct(row: CatalogRow): void {
    if (row.demo) void this.router.navigate(['/prodotti', row.gtin, 'base']);
    else this.toasts.show(DEMO_ONLY, 'info');
  }

  /* ---- Azienda ---- */

  protected async copy(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.toasts.show(`GLN ${code} copiato`);
    } catch {
      this.toasts.show('Copia non riuscita: seleziona il codice e copialo a mano', 'warning');
    }
  }

  /* ---- Formati ---- */

  protected num(n: number): string {
    return n.toLocaleString('it-IT');
  }

  protected pct(ratio: number): string {
    return `${Math.round(ratio * 100)}%`;
  }

  /** Larghezza di una barra: un valore piccolo ma non nullo resta visibile. */
  protected barWidth(ratio: number): string {
    return ratio > 0 ? `max(3px, ${ratio * 100}%)` : '0';
  }

  protected date(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  protected dateTime(iso: string): string {
    const [day, time] = iso.split('T');
    return `${this.date(day)} ${time}`;
  }

  protected plural(n: number, one: string, many: string): string {
    return `${this.num(n)} ${n === 1 ? one : many}`;
  }

  protected glnTypeLabel(type: string, n: number): string {
    const forms: Record<string, [string, string]> = {
      'Entità legale': ['entità legale', 'entità legali'],
      'Ubicazione fisica': ['ubicazione fisica', 'ubicazioni fisiche'],
      Funzione: ['funzione', 'funzioni'],
    };
    const [one, many] = forms[type] ?? [type, type];
    return this.plural(n, one, many);
  }

  protected notInDemo(): void {
    this.toasts.show('Sezione non inclusa nella demo', 'info');
  }
}

const DISMISSED_KEY = `codifico-demo:dashboard:annunci-chiusi:${USER_KEY}`;

function loadDismissed(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveDismissed(list: string[]): void {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
  } catch {
    // Storage non disponibile: l'annuncio ricompare al prossimo caricamento.
  }
}
