import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GLN_TYPE_INFO, REGISTRY_INFO, parseScenario } from '../../core/dashboard-data';
import { HelpPanel } from '../../ui/help-panel';
import { Icon } from '../../ui/icon';
import { ProductActionsMenu } from '../../ui/product-actions-menu';
import { Tip } from '../../ui/tip';
import { Toasts } from '../../ui/toast';
import { TUTORIAL, TutorialModal } from '../../ui/tutorial';
import { CatalogRow, DashboardModel } from './dashboard-model';
import { LinkProductDialog } from './link-product-dialog';

type RecentTab = 'fixed' | 'variable' | 'gln';

const DEMO_ONLY = 'Nella demo sono consultabili i prodotti con l’etichetta “Demo”';
/** Utente della demo: lo stato "Riduci" del banner si salva per utente. */
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
  imports: [RouterLink, Icon, Tip, ProductActionsMenu, TutorialModal, HelpPanel, LinkProductDialog],
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
  protected readonly registryInfo = REGISTRY_INFO;

  protected helpOpen = signal(false);
  protected tutorialOpen = signal(false);
  protected pickerOpen = signal(false);
  protected howOpen = signal(false);
  protected contentsOpen = signal(false);
  protected tab = signal<RecentTab>('fixed');

  protected readonly tabs: { id: RecentTab; label: string }[] = [
    { id: 'fixed', label: 'Prodotti a peso fisso' },
    { id: 'variable', label: 'Prodotti a peso variabile' },
    { id: 'gln', label: 'GLN' },
  ];

  /** Un solo annuncio alla volta: benvenuto senza prodotti finalizzati, altrimenti il Digital Link. */
  protected banner = computed<'welcome' | 'dl'>(() => (this.m.dl().scope === 0 ? 'welcome' : 'dl'));

  /** Annunci ridotti a barra dall'utente (localStorage, per utente e per annuncio). */
  private reduced = signal<string[]>(loadReduced());
  protected bannerReduced = computed(() => this.reduced().includes(this.banner()));

  constructor() {
    const route = inject(ActivatedRoute);
    this.m.scenarioId.set(parseScenario(route.snapshot.queryParamMap.get('scenario')));
    route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((q) => this.m.scenarioId.set(parseScenario(q.get('scenario'))));
  }

  /* ---- Annunci ---- */

  protected setReduced(value: boolean): void {
    const id = this.banner();
    this.reduced.update((list) => (value ? [...new Set([...list, id])] : list.filter((x) => x !== id)));
    saveReduced(this.reduced());
    // Il pulsante premuto sparisce: il focus passa a quello che lo sostituisce.
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>(value ? '#banner-expand' : '#banner-reduce')?.focus(),
      { injector: this.injector },
    );
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

  /* ---- Ultimi codici censiti ---- */

  protected onTabKey(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const ids = this.tabs.map((t) => t.id);
    const i = ids.indexOf(this.tab());
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? ids.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
    this.tab.set(ids[next]);
    this.host.nativeElement.querySelector<HTMLElement>(`#tab-${ids[next]}`)?.focus();
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

const REDUCED_KEY = `codifico-demo:dashboard:annunci-ridotti:${USER_KEY}`;

function loadReduced(): string[] {
  try {
    const raw = localStorage.getItem(REDUCED_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveReduced(list: string[]): void {
  try {
    localStorage.setItem(REDUCED_KEY, JSON.stringify(list));
  } catch {
    // Storage non disponibile: il banner torna esteso al prossimo caricamento.
  }
}
