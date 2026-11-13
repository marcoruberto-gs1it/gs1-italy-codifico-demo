import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../../core/demo-store';
import { Icon } from '../../ui/icon';
import { BarcodeWizard, BarcodeKind } from './barcode-wizard/barcode-wizard';
import { BaseTab } from './tabs/base-tab';
import { BrindoTab } from './tabs/brindo-tab';
import { DigitalLinkTab } from './tabs/digital-link-tab';
import { EcoTab } from './tabs/eco-tab';
import { ProductSidebar } from './product-sidebar';

export type ProductTab = 'base' | 'ecologicamente' | 'brindo' | 'digital-link';

/** Scheda prodotto di Codifico+: intestazione con il GTIN, quattro tab e colonna laterale. */
@Component({
  selector: 'app-product-page',
  imports: [Icon, RouterLink, BaseTab, EcoTab, BrindoTab, DigitalLinkTab, ProductSidebar, BarcodeWizard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
  templateUrl: './product-page.html',
  styleUrl: './product-page.css',
})
export class ProductPage {
  /** Parametro di rotta :tab (withComponentInputBinding). */
  tab = input<string>('base');
  /** Query param ?genera=1: arrivando da "Genera barcode" si apre subito la procedura. */
  genera = input<string | undefined>(undefined);

  protected store = inject(DemoStore);
  private host = inject(ElementRef<HTMLElement>);

  /**
   * Ordine delle tab come da specifica (§2, §9) e conferma del 19/08/2026: Base, Digital Link,
   * poi i servizi a valore aggiunto. Digital Link c'è solo sui prodotti finalizzati (§4.1),
   * Brindo solo sui prodotti che lo usano.
   */
  protected readonly tabs = computed(() => {
    const p = this.store.product();
    const all: { id: ProductTab; label: string }[] = [
      { id: 'base', label: 'Base' },
      { id: 'digital-link', label: 'Digital Link' },
      { id: 'ecologicamente', label: 'Ecologicamente' },
      { id: 'brindo', label: 'Brindo' },
    ];
    return all.filter(
      (t) => (t.id !== 'brindo' || p.variants.length > 0) && (t.id !== 'digital-link' || this.store.finalized()),
    );
  });

  /** Tab richiesta, se esiste per questo prodotto; altrimenti la scheda Base. */
  protected activeTab = computed<ProductTab>(() => {
    const t = this.tab();
    return this.tabs().some((x) => x.id === t) ? (t as ProductTab) : 'base';
  });

  /** Etichetta "Nuovo" sulla tab Digital Link finché l'utente non l'apre o non crea link. */
  protected showNewTag = computed(() => !this.store.discovery().tabSeen && this.store.productsWithLinks() === 0);

  /** QR disponibile: con almeno un link a livello prodotto, o per le annate Brindo. */
  protected qrAvailable = computed(() => this.store.activeLinks().length > 0 || this.store.product().variants.length > 0);

  protected wizardOpen = signal(false);
  protected wizardKind = signal<BarcodeKind | null>(null);
  protected splitOpen = signal(false);

  ngOnInit(): void {
    if (this.genera() && this.store.finalized()) this.openWizard();
  }

  protected openWizard(kind: BarcodeKind | null = null): void {
    this.splitOpen.set(false);
    this.wizardKind.set(kind);
    this.wizardOpen.set(true);
  }

  protected toggleSplit(event: Event): void {
    event.stopPropagation();
    this.splitOpen.update((v) => !v);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const split = this.host.nativeElement.querySelector('.split');
    if (split && !split.contains(event.target as Node)) this.splitOpen.set(false);
  }
}
