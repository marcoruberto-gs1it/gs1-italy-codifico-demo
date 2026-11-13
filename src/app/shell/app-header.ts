import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DemoStore } from '../core/demo-store';
import { Gs1Logo } from '../ui/gs1-logo';
import { Icon } from '../ui/icon';
import { Toasts } from '../ui/toast';

interface MenuItem {
  label: string;
  route?: string;
  /** Intestazione di gruppo (non cliccabile), es. "Unità singole". */
  caption?: boolean;
  /** Voce di creazione, preceduta da "+". */
  create?: boolean;
  /** Voce che apre un sottomenu, seguita da ">". */
  submenu?: boolean;
}

interface NavEntry {
  label: string;
  route?: string;
  items?: MenuItem[];
}

/**
 * Intestazione di Codifico+: barra "Azienda attiva", logo con ricerca e profilo, menu principale.
 * Nella demo funzionano Dashboard e Prodotti; le altre voci rispondono con un avviso.
 */
@Component({
  selector: 'app-header',
  imports: [Gs1Logo, Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)', '(document:keydown.escape)': 'openMenu.set(null)' },
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
})
export class AppHeader {
  protected store = inject(DemoStore);
  private toasts = inject(Toasts);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  protected openMenu = signal<string | null>(null);

  /** Le voci di menu di Codifico+ in produzione. */
  protected readonly nav: NavEntry[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Prefissi' },
    {
      label: 'Prodotti',
      items: [
        { label: 'Unità singole', caption: true },
        { label: 'Prodotti a peso fisso', route: '/prodotti' },
        { label: 'Prodotti a peso variabile' },
        { label: 'Aggregati', caption: true },
        { label: 'Imballi' },
        { label: 'Marche', caption: true },
        { label: 'Le tue marche' },
      ],
    },
    {
      label: 'Strumenti',
      items: [
        { label: 'Codifico', submenu: true },
        { label: 'Brindo', submenu: true },
        { label: 'Ecologicamente', submenu: true },
      ],
    },
    {
      label: 'Richieste',
      items: [{ label: 'Visualizza le richieste' }, { label: 'Nuova richiesta', create: true }],
    },
    { label: 'GLN', items: [{ label: 'Visualizza i GLN' }, { label: 'Nuovo GLN', create: true }] },
  ];

  protected toggle(menu: string, event: Event): void {
    event.stopPropagation();
    this.openMenu.update((m) => (m === menu ? null : menu));
  }

  protected go(item: MenuItem | NavEntry): void {
    this.openMenu.set(null);
    if (item.route) void this.router.navigateByUrl(item.route);
    else this.notInDemo();
  }

  protected notInDemo(): void {
    this.toasts.show('Sezione non inclusa nella demo', 'info');
  }

  protected loadSample(): void {
    this.store.loadSample();
    this.openMenu.set(null);
    this.toasts.show('Caricati i link di esempio su tutti i prodotti della demo');
  }

  protected reset(): void {
    this.store.reset();
    this.openMenu.set(null);
    this.toasts.show('Demo ripristinata: nessun link creato');
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.openMenu.set(null);
  }
}
