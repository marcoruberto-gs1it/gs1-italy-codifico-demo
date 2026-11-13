import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { qrCode } from '../../../core/barcode/symbols';
import { DemoStore } from '../../../core/demo-store';
import { digitalLinkUri } from '../../../core/gs1';
import { Icon } from '../../../ui/icon';
import { SymbolView } from '../../../ui/symbol-view';

/**
 * Tab "Brindo" (Figma, Frame 58-59): l'etichetta elettronica del vino. Ogni annata è una
 * variante con il proprio GS1 Digital Link /01/{gtin}/22/{cpv}, generato dal servizio Brindo.
 */
@Component({
  selector: 'app-brindo-tab',
  imports: [Icon, SymbolView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './brindo-tab.html',
  styleUrl: './brindo-tab.css',
})
export class BrindoTab {
  protected store = inject(DemoStore);
  protected p = this.store.product;

  protected cpv = signal(this.p().variants[0]?.cpv ?? '');
  protected variant = computed(() => this.p().variants.find((v) => v.cpv === this.cpv()) ?? this.p().variants[0]);
  protected uri = computed(() => digitalLinkUri({ gtin: this.p().gtin, cpv: this.cpv() }));
  protected qr = computed(() => qrCode(this.uri()));

  protected dash(value: string): string {
    return value?.trim() ? value : '—';
  }
}
