import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { qrCode } from '../../../core/barcode/symbols';
import { DemoStore } from '../../../core/demo-store';
import { digitalLinkUri } from '../../../core/gs1';
import { linkTypeLabel } from '../../../core/vocabulary';
import { Icon } from '../../../ui/icon';
import { Modal } from '../../../ui/modal';
import { ProductImage } from '../../../ui/product-image';
import { SymbolView } from '../../../ui/symbol-view';

/**
 * Anteprima dell'identità digitale pubblicata sul GS1 Registry Platform: i 7 attributi
 * obbligatori, tutti presenti. Se l'azienda ha creato almeno un link a livello prodotto
 * (/01/{gtin}), mostra anche il QR code GS1 Digital Link con l'URL e la Destinazione Principale.
 */
@Component({
  selector: 'app-registry-preview',
  imports: [Modal, Icon, ProductImage, SymbolView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .wrap {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 32px;
    }
    .image {
      height: 280px;
      padding: 16px;
      background: #fff;
      border: 1px solid var(--border-soft);
    }
    .intro {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 14px;
    }
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      margin: 0;
      background: #fff;
      border: 1px solid var(--border-soft);
    }
    dt,
    dd {
      margin: 0;
      padding: 10px 14px;
      border-bottom: 1px solid #edf0f2;
      font-size: 13.5px;
    }
    dt {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--gs1-blue);
      font-weight: 600;
    }
    dt app-icon {
      color: #2fb36b;
    }
    dd {
      color: var(--text-strong);
    }
    .dl {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-top: 16px;
      padding: 14px 16px;
      background: #fff;
      border: 1px solid var(--border-soft);
    }
    .dl-qr {
      flex: none;
      width: 112px;
    }
    .dl-text {
      min-width: 0;
      font-size: 13px;
      color: var(--muted);
      line-height: 1.4;
    }
    .dl-title {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--gs1-blue);
      font-size: 14px;
      font-weight: 600;
    }
    .dl-title app-icon {
      color: #2fb36b;
    }
    .dl-uri {
      margin: 4px 0 6px;
      color: var(--text-strong);
      font-family: Consolas, 'Courier New', monospace;
      font-size: 12.5px;
      overflow-wrap: anywhere;
    }
    .dl-text strong {
      color: var(--text-strong);
      font-weight: 600;
    }
    @media (max-width: 700px) {
      .wrap {
        grid-template-columns: 1fr;
      }
    }
  `,
  template: `
    <app-modal title="Anteprima dell’identità digitale" (closed)="closed.emit()">
      <div class="wrap">
        <div class="image"><app-product-image /></div>
        <div>
          <p class="intro">
            Così retailer, marketplace e clienti finali vedono il prodotto sul GS1 Registry Platform: tutti e 7 gli attributi
            richiesti sono presenti.
          </p>
          <dl>
            <dt><app-icon name="check-circle" [size]="16" /> GTIN</dt>
            <dd>{{ p().gtin }}</dd>
            <dt><app-icon name="check-circle" [size]="16" /> Marca</dt>
            <dd>{{ p().brand }}</dd>
            <dt><app-icon name="check-circle" [size]="16" /> Descrizione</dt>
            <dd>{{ p().description }}</dd>
            <dt><app-icon name="check-circle" [size]="16" /> Immagine</dt>
            <dd>Presente</dd>
            <dt><app-icon name="check-circle" [size]="16" /> Categoria (GPC)</dt>
            <dd>{{ p().category }}</dd>
            <dt><app-icon name="check-circle" [size]="16" /> Contenuto netto</dt>
            <dd>{{ p().netContent }}</dd>
            <dt><app-icon name="check-circle" [size]="16" /> Paese di vendita</dt>
            <dd>{{ p().targetMarket }}</dd>
          </dl>
          @if (store.activeLinks().length) {
            <div class="dl">
              <app-symbol-view class="dl-qr" [drawing]="qr()" label="QR code GS1 Digital Link del prodotto" />
              <div class="dl-text">
                <p class="dl-title"><app-icon name="check-circle" [size]="16" /> GS1 Digital Link attivo</p>
                <p class="dl-uri">{{ uri() }}</p>
                <p>
                  {{ store.activeLinks().length }} {{ store.activeLinks().length === 1 ? 'link associato' : 'link associati' }}
                  @if (store.defaultLink(); as d) {
                    · chi inquadra il QR code arriva a <strong>{{ typeLabel(d.linkType) }}</strong>
                  }
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </app-modal>
  `,
})
export class RegistryPreview {
  closed = output<void>();
  protected store = inject(DemoStore);
  protected p = this.store.product;
  protected uri = computed(() => digitalLinkUri({ gtin: this.p().gtin }));
  protected qr = computed(() => qrCode(this.uri()));
  protected typeLabel = linkTypeLabel;
}
