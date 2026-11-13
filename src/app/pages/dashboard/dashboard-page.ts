import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DemoStore } from '../../core/demo-store';
import { ProductActionsMenu } from '../../ui/product-actions-menu';
import { Icon } from '../../ui/icon';
import { Toasts } from '../../ui/toast';
import { TUTORIAL, TutorialModal } from '../../ui/tutorial';

interface RecentProduct {
  gtin: string;
  status: 'Bozza' | 'Finalizzato';
  description: string;
  date: string;
}

interface Prefix {
  code: string;
  label: string;
  used: number;
  capacity: number;
}

interface AttributeFill {
  label: string;
  value: number;
  /** La barra della novità, evidenziata in arancione. */
  isNew?: boolean;
  note?: string;
}

/**
 * Home di Codifico+ ("Benvenuto in Codifico!"), ricostruita sulla versione attuale e con la
 * novità del GS1 Digital Link in quattro punti: il banner in alto, la colonna "Digital Link"
 * negli ultimi codici, la voce in Accesso rapido e la barra nel livello di riempimento.
 * I dati sono di esempio: solo prefissi GS1 Italy, nessun dato di aziende associate.
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, Icon, ProductActionsMenu, TutorialModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  protected store = inject(DemoStore);
  private toasts = inject(Toasts);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);


  protected readonly t = TUTORIAL;
  protected tutorialOpen = signal(false);
  protected tab = signal<'products' | 'packaging'>('products');
  protected openRow = signal<string | null>(null);
  protected howOpen = signal(false);

  /** Ultimi codici censiti: i prodotti della demo, dal più recente. */
  protected readonly recent: RecentProduct[] = [...this.store.products]
    .sort((a, b) => b.modified.localeCompare(a.modified))
    .map((p) => ({
      gtin: p.gtin,
      status: p.status,
      description: p.description,
      date: p.modified.split('-').reverse().join('/'),
    }));

  protected readonly prefixes: Prefix[] = [
    { code: '8000000', label: 'GS1 Italy - GCP master', used: 114, capacity: 100000 },
    { code: '8032089', label: 'GS1 Italy - GCP per esempi', used: 118, capacity: 100000 },
    { code: '8033999', label: 'GS1 Italy - GCP supplementare', used: 4, capacity: 100000 },
    { code: '8099999', label: 'GS1 Italy - GLN a noleggio', used: 3, capacity: 100000 },
  ];

  private readonly totalProducts = this.prefixes.reduce((s, p) => s + p.used, 0);

  /** Prodotti con almeno un link: nella demo è il prodotto di esempio, se ha dei link. */
  protected productsWithLinks = this.store.productsWithLinks;

  protected attributes = computed<AttributeFill[]>(() => {
    const withLinks = this.productsWithLinks();
    return [
      { label: 'Marca', value: 73.1 },
      { label: 'Descrizione prodotto', value: 73.1 },
      { label: 'Immagine', value: 7.5 },
      { label: 'GPC', value: 60.2 },
      { label: 'Contenuto netto', value: 62.9 },
      { label: 'Paesi di vendita', value: 18.0 },
      {
        label: 'GS1 Digital Link',
        value: (withLinks / this.totalProducts) * 100,
        isNew: true,
        note: `${withLinks} ${withLinks === 1 ? 'prodotto' : 'prodotti'} su ${this.totalProducts}`,
      },
    ];
  });

  protected readonly ticks = [0, 20, 40, 60, 80, 100];

  protected pct(value: number): string {
    return `${value.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  }

  /** Larghezza visibile della barra: un valore minimo di 0,4% non sparisce del tutto. */
  protected barWidth(value: number): string {
    return `${value > 0 ? Math.max(value, 0.6) : 0}%`;
  }

  protected isDemo(gtin: string): boolean {
    return this.store.has(gtin);
  }

  protected linksFor(gtin: string): number {
    return this.store.linkCountFor(gtin);
  }

  protected openProduct(gtin: string, tab = 'base'): void {
    this.openRow.set(null);
    if (this.isDemo(gtin)) void this.router.navigate(['/prodotti', gtin, tab]);
    else this.toasts.show('Nella demo sono consultabili i prodotti con l’etichetta “Demo” nell’elenco prodotti', 'info');
  }

  protected toggleRow(key: string, event: Event): void {
    event.stopPropagation();
    this.openRow.update((k) => (k === key ? null : key));
  }

  protected notInDemo(): void {
    this.openRow.set(null);
    this.toasts.show('Sezione non inclusa nella demo', 'info');
  }

  protected onDocumentClick(event: MouseEvent): void {
    const menu = (event.target as HTMLElement).closest?.('.row-menu-wrap');
    if (!menu || !this.host.nativeElement.contains(menu)) this.openRow.set(null);
  }
}
