import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Drawing, toSvg } from '../core/barcode/drawing';

/**
 * Mostra un codice (EAN-13 o QR) come SVG vettoriale. L'SVG è generato dal nostro codice a
 * partire da dati controllati, quindi è sicuro inserirlo così com'è.
 */
@Component({
  selector: 'app-symbol-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }
    :host ::ng-deep svg {
      width: 100%;
      height: auto;
      display: block;
    }
  `,
  template: `<div [innerHTML]="svg()" role="img" [attr.aria-label]="label()"></div>`,
})
export class SymbolView {
  drawing = input.required<Drawing>();
  label = input('');

  private sanitizer = inject(DomSanitizer);
  protected svg = computed(() => this.sanitizer.bypassSecurityTrustHtml(toSvg(this.drawing())));
}
