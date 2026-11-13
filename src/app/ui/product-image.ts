import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ProductKind } from '../core/demo-data';
import { DemoStore } from '../core/demo-store';

/**
 * Illustrazione vettoriale del prodotto: bottiglia di vino, pacco di spaghetti, scatola di
 * biscotti o bottiglia d'olio. Senza input usa il prodotto corrente.
 */
@Component({
  selector: 'app-product-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      height: 100%;
      line-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    <svg viewBox="0 0 120 300" role="img" [attr.aria-label]="label()">
      <ellipse cx="60" cy="292" rx="42" ry="5" fill="#000" opacity=".08" />
      @switch (kind()) {
        @case ('wine') {
          <defs>
            <linearGradient id="pi-glass" x1="0" x2="1">
              <stop offset="0" stop-color="#1d3f22" />
              <stop offset=".38" stop-color="#3d7443" />
              <stop offset=".47" stop-color="#8fbf8f" />
              <stop offset=".56" stop-color="#3d7443" />
              <stop offset="1" stop-color="#173419" />
            </linearGradient>
          </defs>
          <path d="M49 8h22v62c0 14 26 26 26 54v156a10 10 0 0 1-10 10H33a10 10 0 0 1-10-10V124c0-28 26-40 26-54Z" fill="url(#pi-glass)" />
          <rect x="47" y="4" width="26" height="34" rx="3" fill="#b9c0c6" />
          <rect x="28" y="150" width="64" height="92" rx="3" fill="#f7f2e6" />
          <text x="60" y="176" text-anchor="middle" font-family="Montserrat, Arial" font-size="9" font-weight="700" fill="#002c6c">CANTINA</text>
          <text x="60" y="188" text-anchor="middle" font-family="Montserrat, Arial" font-size="9" font-weight="700" fill="#002c6c">SOCIALE GS1</text>
          <path d="M40 198h40" stroke="#f26334" stroke-width="1.5" />
          <text x="60" y="214" text-anchor="middle" font-family="Montserrat, Arial" font-size="7.5" fill="#4a4a4a">Vino bianco</text>
          <text x="60" y="224" text-anchor="middle" font-family="Montserrat, Arial" font-size="7.5" fill="#4a4a4a">frizzante DOC</text>
        }
        @case ('pasta') {
          <path d="M18 60 30 40h60l12 20v214a10 10 0 0 1-10 10H28a10 10 0 0 1-10-10Z" fill="#1d4f9c" />
          <path d="M30 40h60l-4-12H34Z" fill="#163f7e" />
          <rect x="30" y="90" width="60" height="120" rx="6" fill="#f3f6fb" />
          <g stroke="#e8c36a" stroke-width="2.2" stroke-linecap="round">
            <path d="M40 100v100M46 100v100M52 100v100M58 100v100M64 100v100M70 100v100M76 100v100M82 100v100" />
          </g>
          <text x="60" y="74" text-anchor="middle" font-family="Montserrat, Arial" font-size="9" font-weight="700" fill="#fff">PASTIFICIO GS1</text>
          <text x="60" y="236" text-anchor="middle" font-family="Montserrat, Arial" font-size="12" font-weight="700" fill="#fff">SPAGHETTI</text>
          <text x="60" y="252" text-anchor="middle" font-family="Montserrat, Arial" font-size="8" fill="#cfe0f7">n. 5 · 500 g</text>
        }
        @case ('biscuits') {
          <rect x="14" y="70" width="92" height="216" rx="6" fill="#f29a3a" />
          <rect x="14" y="70" width="92" height="40" rx="6" fill="#d97d1f" />
          <text x="60" y="95" text-anchor="middle" font-family="Montserrat, Arial" font-size="9" font-weight="700" fill="#fff">FORNO GS1</text>
          <g fill="#f6d39a" stroke="#c98a3a" stroke-width="1.5">
            <circle cx="42" cy="150" r="18" />
            <circle cx="78" cy="150" r="18" />
            <circle cx="60" cy="186" r="18" />
          </g>
          <g fill="#c98a3a">
            <circle cx="37" cy="146" r="1.6" /><circle cx="46" cy="154" r="1.6" /><circle cx="74" cy="146" r="1.6" />
            <circle cx="83" cy="155" r="1.6" /><circle cx="56" cy="182" r="1.6" /><circle cx="64" cy="191" r="1.6" />
          </g>
          <text x="60" y="236" text-anchor="middle" font-family="Montserrat, Arial" font-size="12" font-weight="700" fill="#fff">FROLLINI</text>
          <text x="60" y="252" text-anchor="middle" font-family="Montserrat, Arial" font-size="8" fill="#fff4e3">350 g</text>
        }
        @default {
          <defs>
            <linearGradient id="pi-oil" x1="0" x2="1">
              <stop offset="0" stop-color="#3b4a12" />
              <stop offset=".42" stop-color="#7a8f1f" />
              <stop offset=".5" stop-color="#c7d36b" />
              <stop offset=".58" stop-color="#7a8f1f" />
              <stop offset="1" stop-color="#2f3b0e" />
            </linearGradient>
          </defs>
          <path d="M48 30h24v40c0 10 22 20 22 46v164a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10V116c0-26 22-36 22-46Z" fill="url(#pi-oil)" />
          <rect x="46" y="16" width="28" height="22" rx="3" fill="#b9c0c6" />
          <rect x="31" y="160" width="58" height="84" rx="3" fill="#fbf7e8" />
          <text x="60" y="184" text-anchor="middle" font-family="Montserrat, Arial" font-size="8.5" font-weight="700" fill="#002c6c">FRANTOIO GS1</text>
          <path d="M42 194h36" stroke="#7a8f1f" stroke-width="1.5" />
          <text x="60" y="210" text-anchor="middle" font-family="Montserrat, Arial" font-size="7.5" fill="#4a4a4a">Olio extravergine</text>
          <text x="60" y="220" text-anchor="middle" font-family="Montserrat, Arial" font-size="7.5" fill="#4a4a4a">di oliva · 50 cl</text>
        }
      }
    </svg>
  `,
})
export class ProductImage {
  /** Tipo di prodotto da disegnare; se assente, quello del prodotto corrente. */
  type = input<ProductKind | undefined>(undefined);

  private store = inject(DemoStore);
  protected kind = computed(() => this.type() ?? this.store.product().kind);
  protected label = computed(() => this.store.product().description);
}
