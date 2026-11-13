import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DemoStore } from '../core/demo-store';
import { Icon } from './icon';
import { Toasts } from './toast';

/**
 * Menu a tendina (⌄) di un prodotto, come in Codifico+: Genera barcode, Crea variante,
 * Crea imballo. In più la novità: "Gestisci GS1 Digital Link".
 * Usato nell'elenco prodotti e negli ultimi codici censiti della home.
 */
@Component({
  selector: 'app-product-actions-menu',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)', '(document:keydown.escape)': 'open.set(false)' },
  styles: `
    :host {
      position: relative;
      display: inline-block;
    }
    .toggle {
      display: grid;
      place-items: center;
      width: var(--toggle-size, 32px);
      height: var(--toggle-size, 32px);
      padding: 0;
      border: 1px solid #c9cccc;
      background: #fff;
      color: var(--gs1-orange);
      cursor: pointer;
    }
    .toggle:hover,
    .toggle[aria-expanded='true'] {
      border-color: var(--gs1-blue);
    }
    ul {
      position: absolute;
      right: 0;
      top: calc(100% + 2px);
      z-index: 20;
      min-width: 220px;
      margin: 0;
      padding: 6px 0;
      list-style: none;
      background: #fff;
      box-shadow: 0 8px 22px rgb(0 20 50 / 0.16);
      text-align: left;
      animation: drop 0.15s var(--ease);
    }
    button.item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 11px 16px;
      border: 0;
      background: none;
      color: var(--gs1-blue);
      font-size: 14.5px;
      white-space: nowrap;
      text-align: left;
      cursor: pointer;
    }
    button.item:hover:not(:disabled) {
      color: var(--gs1-orange);
    }
    button.item:disabled {
      flex-wrap: wrap;
      color: #9aa4ad;
      cursor: not-allowed;
    }
    button.item:disabled app-icon {
      color: #9aa4ad;
    }
    .item-hint {
      flex-basis: 100%;
      padding-left: 23px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 400;
    }
    .sep {
      height: 1px;
      margin: 4px 0;
      background: #e5e8eb;
    }
    .dl {
      font-weight: 600;
    }
    .dl app-icon {
      color: var(--gs1-orange);
    }
    .new-tag {
      padding: 1px 6px;
      border-radius: 3px;
      background: var(--gs1-orange);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    @keyframes drop {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
  template: `
    <button
      type="button"
      class="toggle"
      [attr.aria-label]="'Altre azioni per ' + gtin()"
      [attr.aria-expanded]="open()"
      (click)="toggle($event)"
    >
      <app-icon name="chevron-down" [size]="16" [stroke]="2" />
    </button>
    @if (open()) {
      <ul role="menu">
        <li><button type="button" role="menuitem" class="item" (click)="generate()">Genera barcode</button></li>
        <li><button type="button" role="menuitem" class="item" (click)="notInDemo()">Crea variante</button></li>
        <li><button type="button" role="menuitem" class="item" (click)="notInDemo()">Crea imballo</button></li>
        <li class="sep" role="presentation"></li>
        <li>
          <!-- Digital Link solo sui prodotti finalizzati (specifica §4.1, §8). -->
          <button
            type="button"
            role="menuitem"
            class="item dl"
            [disabled]="status() === 'Bozza'"
            [attr.title]="status() === 'Bozza' ? 'Disponibile dopo la finalizzazione del prodotto' : null"
            (click)="digitalLink()"
          >
            <app-icon name="link" [size]="15" [stroke]="2" />
            {{ store.linkCountFor(gtin()) ? 'Gestisci GS1 Digital Link' : 'Crea GS1 Digital Link' }}
            <span class="new-tag">Nuovo</span>
            @if (status() === 'Bozza') {
              <span class="item-hint">Disponibile dopo la finalizzazione</span>
            }
          </button>
        </li>
      </ul>
    }
  `,
})
export class ProductActionsMenu {
  gtin = input.required<string>();
  /** Stato del prodotto: il QR code GS1 Digital Link si genera solo dopo la finalizzazione. */
  status = input<string>('Finalizzato');

  protected store = inject(DemoStore);
  private router = inject(Router);
  private toasts = inject(Toasts);
  private host = inject(ElementRef<HTMLElement>);

  protected open = signal(false);
  protected isDemo = () => this.store.has(this.gtin());

  protected toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  protected generate(): void {
    this.open.set(false);
    if (this.status() === 'Bozza') {
      this.toasts.show('Il QR code GS1 Digital Link si genera dopo la finalizzazione del prodotto', 'info');
      return;
    }
    if (!this.isDemo()) return this.onlyDemoProduct();
    void this.router.navigate(['/prodotti', this.gtin(), 'digital-link'], { queryParams: { genera: 1 } });
  }

  protected digitalLink(): void {
    this.open.set(false);
    if (this.status() === 'Bozza') return;
    if (!this.isDemo()) return this.onlyDemoProduct();
    void this.router.navigate(['/prodotti', this.gtin(), 'digital-link']);
  }

  protected notInDemo(): void {
    this.open.set(false);
    this.toasts.show('Funzione non inclusa nella demo', 'info');
  }

  private onlyDemoProduct(): void {
    this.toasts.show('Nella demo sono consultabili i prodotti con l’etichetta “Demo”', 'info');
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
