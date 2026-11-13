import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Drawing, toEps, toPdf } from '../../../core/barcode/drawing';
import { ean13, qrCode } from '../../../core/barcode/symbols';
import { WineVariant } from '../../../core/demo-data';
import { DemoStore } from '../../../core/demo-store';
import { GS1_RESOLVER_HOST, digitalLinkUri, toGtin14 } from '../../../core/gs1';
import { Icon } from '../../../ui/icon';
import { Modal } from '../../../ui/modal';
import { SymbolView } from '../../../ui/symbol-view';
import { Toasts } from '../../../ui/toast';

export type BarcodeKind = 'linear' | 'qr';
type Format = 'eps' | 'pdf';

/**
 * "Genera barcode/QR code" in tre passi (Figma, Frame 33-56):
 * 1. Tipologia: barcode lineare EAN-13 oppure QR Code GS1 Digital Link;
 * 2. Anteprima: per il QR si sceglie cosa codificare (solo GTIN o GTIN + variante Brindo,
 *    AI 22) e se stampare il testo in chiaro (HRI);
 * 3. Formato: EPS o PDF, entrambi vettoriali, generati nel browser.
 */
@Component({
  selector: 'app-barcode-wizard',
  imports: [Modal, Icon, SymbolView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './barcode-wizard.html',
  styleUrl: './barcode-wizard.css',
})
export class BarcodeWizard {
  initialKind = input<BarcodeKind | null>(null);
  closed = output<void>();

  protected store = inject(DemoStore);
  private router = inject(Router);
  /**
   * Il QR code GS1 Digital Link si scarica solo se l'azienda ha creato almeno un link a livello
   * prodotto: senza, il QR porterebbe a una destinazione che l'azienda non ha scelto.
   */
  protected qrAvailable = computed(() => this.store.activeLinks().length > 0);
  private toasts = inject(Toasts);
  protected readonly p = this.store.product;
  protected readonly gtin14 = computed(() => toGtin14(this.p().gtin));

  protected step = signal<1 | 2 | 3>(1);
  protected kind = signal<BarcodeKind | null>(null);
  /**
   * '' = solo GTIN, altrimenti il CPV della variante (AI 22). Sui prodotti Brindo parte da null:
   * nessuna scelta preselezionata (requisiti §10.2), Avanti si attiva dopo la scelta.
   */
  protected cpv = signal<string | null>(this.store.product().variants.length ? null : '');
  protected hasVariants = computed(() => this.store.product().variants.length > 0);
  /** Avviso prima del download: QR "Solo GTIN" su un prodotto Brindo (requisiti §10.2). */
  protected brindoWarning = computed(() => this.kind() === 'qr' && this.hasVariants() && this.cpv() === '');
  /** Dove arriva chi scansiona, per rendere chiaro il passaggio dal resolver (requisiti §3.3). */
  protected destination = computed(() => {
    if (this.cpv()) return 'la pagina della variante generata da Brindo';
    const d = this.store.defaultLink();
    return d ? d.url : 'la scheda del prodotto sul GS1 Registry Platform (nessun link configurato)';
  });
  protected canContinue = computed(() => this.step() !== 2 || this.kind() !== 'qr' || this.cpv() !== null);
  protected hri = signal(true);
  protected format = signal<Format | null>(null);

  protected readonly steps = [
    { n: 1, label: 'Tipologia' },
    { n: 2, label: 'Anteprima' },
    { n: 3, label: 'Formato' },
  ] as const;

  protected variant = computed<WineVariant | null>(() => this.p().variants.find((v) => v.cpv === this.cpv()) ?? null);
  protected resolverHost = GS1_RESOLVER_HOST;

  protected uri = computed(() => digitalLinkUri({ gtin: this.p().gtin, cpv: this.cpv() || undefined }));

  protected hriLines = computed(() => {
    const lines = [`(01) ${this.gtin14()}`];
    if (this.cpv()) lines.push(`(22) ${this.cpv()}`);
    return lines;
  });

  protected drawing = computed<Drawing>(() =>
    this.kind() === 'linear'
      ? ean13(this.p().gtin, { hri: true })
      : qrCode(this.uri(), { hri: this.hri() ? this.hriLines() : undefined }),
  );

  protected contentLabel = computed(() => {
    if (this.kind() === 'linear') return 'EAN-13 - Solo GTIN';
    return this.cpv() ? 'GS1 Digital Link - GTIN + VARIANTE' : 'GS1 Digital Link - Solo GTIN';
  });

  ngOnInit(): void {
    const k = this.initialKind();
    // Senza link creati dall'azienda il QR non si genera: si resta al passo 1, con il lineare.
    if (k === 'qr' && !this.qrAvailable()) {
      this.kind.set('linear');
      return;
    }
    if (k) {
      this.kind.set(k);
      this.step.set(2);
    }
  }

  protected variantOptionLabel(v: WineVariant): string {
    return `GTIN + VARIANTE - ${this.gtin14()} - ${v.vintage} ${v.producer}`;
  }

  /** Porta alla tab Digital Link per creare il primo link, chiudendo la modale. */
  protected goToDigitalLink(): void {
    this.closed.emit();
    this.router.navigate(['/prodotti', this.p().gtin, 'digital-link']);
  }

  protected next(): void {
    if (this.step() === 1 && this.kind()) this.step.set(2);
    else if (this.step() === 2 && this.canContinue()) this.step.set(3);
  }

  protected back(): void {
    if (this.step() === 3) this.step.set(2);
    else if (this.step() === 2) this.step.set(1);
  }

  protected download(): void {
    const format = this.format();
    if (!format) return;
    // Il nome del file dice cosa è codificato: GTIN e, se presente, variante e annata (requisiti §10.2).
    const v = this.variant();
    const content =
      this.kind() === 'linear'
        ? 'EAN13'
        : v
          ? `QR-DigitalLink_variante-${v.cpv}_annata-${v.vintage}`
          : `QR-DigitalLink_solo-GTIN`;
    const name = `${this.gtin14()}_${content}.${format}`;
    const title = `${this.contentLabel()} ${this.gtin14()}`;
    const data = format === 'eps' ? toEps(this.drawing(), title) : toPdf(this.drawing(), title);
    const blob = new Blob([data], { type: format === 'eps' ? 'application/postscript' : 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toasts.show(`Scaricato ${name}`);
    this.closed.emit();
  }
}
