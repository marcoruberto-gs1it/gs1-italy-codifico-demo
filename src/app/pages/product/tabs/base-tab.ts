import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Measure } from '../../../core/demo-data';
import { DemoStore } from '../../../core/demo-store';
import { Icon } from '../../../ui/icon';
import { ProductImage } from '../../../ui/product-image';
import { Toasts } from '../../../ui/toast';
import { TutorialModal } from '../../../ui/tutorial';

/**
 * Tab "Base": come la scheda di Codifico+ in produzione. Contiene il riepilogo del prodotto
 * (GTIN, descrizione, misure, contenuto netto, paesi di vendita, varie), gli imballi che
 * contengono il prodotto e la richiesta di aggiornamento dei dati finalizzati.
 */
@Component({
  selector: 'app-base-tab',
  imports: [Icon, ProductImage, RouterLink, TutorialModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './base-tab.css',
  template: `
    <!--
      Richiamo alla novità per chi non ha mai usato il GS1 Digital Link: compare sui prodotti
      finalizzati senza link attivi, finché l'utente non lo chiude ("Non ora").
    -->
    @if (showNews()) {
      <section class="news" aria-labelledby="news-title">
        <span class="news-icon"><app-icon name="qrcode" [size]="30" [stroke]="1.6" /></span>
        <div class="news-body">
          <p class="news-kicker">Novità in Codifico+</p>
          <h2 id="news-title">Collega contenuti al QR code di questo prodotto</h2>
          <p>
            Con il GS1 Digital Link un solo QR code in etichetta porta il consumatore alla pagina prodotto, agli allergeni, alla
            sostenibilità e ad altri contenuti, nella sua lingua.
          </p>
          <div class="news-actions">
            <a class="btn btn-primary" [routerLink]="['/prodotti', p().gtin, 'digital-link']">
              Configura il GS1 Digital Link <app-icon name="arrow-right" [size]="15" [stroke]="2" />
            </a>
            <button type="button" class="news-link" (click)="tutorialOpen.set(true)">
              <app-icon name="phone" [size]="15" [stroke]="1.8" /> Guarda il video tutorial
            </button>
          </div>
        </div>
        <button type="button" class="news-close" (click)="store.markDiscovery('baseHintClosed')">Non ora</button>
      </section>
    }

    @if (tutorialOpen()) {
      <app-tutorial-modal (closed)="tutorialOpen.set(false)" />
    }

    <section class="card summary">
      <h2 class="card-title">Riepilogo prodotto</h2>

      <div class="group">
        <h3>GTIN</h3>
        <dl class="kv">
          <dt>GTIN</dt>
          <dd>{{ p().gtin }} ({{ p().gtinType }})</dd>
          <dt>Tipo confezione</dt>
          <dd>{{ s().packagingType }}</dd>
          <dt>GPC</dt>
          <dd>
            @if (s().gpcCode) {
              <span class="gpc-code">{{ s().gpcCode }}</span>
            }
            {{ s().gpcName }}
          </dd>
        </dl>
      </div>

      <div class="group">
        <h3>Descrizione</h3>
        <dl class="kv">
          <dt>Lingua</dt>
          <dd>{{ s().language }}</dd>
          <dt>Marca</dt>
          <dd>{{ p().brand }}</dd>
          <dt>Sottomarca</dt>
          <dd>{{ s().subBrand || '—' }}</dd>
          <dt>Variante prodotto</dt>
          <dd>{{ s().productVariant || '—' }}</dd>
          <dt>Descrizione</dt>
          <dd>{{ p().description }}</dd>
          <dt>Tipologia di prodotto</dt>
          <dd>{{ s().productType || '—' }}</dd>
          <dt>Sito</dt>
          <dd>{{ s().site || '—' }}</dd>
          <dt>Immagine</dt>
          <dd><span class="thumb"><app-product-image /></span></dd>
        </dl>
      </div>

      <div class="group">
        <h3>Misure</h3>
        <table class="measures">
          <tbody>
            <tr class="sub"><th colspan="3" scope="colgroup">Peso</th></tr>
            @for (m of weights(); track m.label) {
              <tr>
                <th scope="row">{{ m.label }}</th>
                <td>{{ m.value?.value || '—' }}</td>
                <td>{{ m.value?.unit || '—' }}</td>
              </tr>
            }
            <tr class="sub"><th colspan="3" scope="colgroup">Dimensioni</th></tr>
            @for (m of dimensions(); track m.label) {
              <tr>
                <th scope="row">{{ m.label }}</th>
                <td>{{ m.value?.value || '—' }}</td>
                <td>{{ m.value?.unit || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="group">
        <h3>Contenuto netto</h3>
        <dl class="kv">
          <dt>{{ s().netContentUnit }}</dt>
          <dd>{{ s().netContentValue }}</dd>
        </dl>
      </div>

      <div class="group">
        <h3>Paesi di vendita</h3>
        @if (s().salesCountries.length) {
          <dl class="kv">
            <dt>Paesi</dt>
            <dd>{{ s().salesCountries.join(', ') }}</dd>
          </dl>
        }
      </div>

      <div class="group last">
        <h3>Varie</h3>
      </div>
    </section>

    @if (p().packs.length) {
      <section class="card packs">
        <h2 class="packs-title">
          Questo prodotto è presente in {{ p().packs.length }} {{ p().packs.length === 1 ? 'imballo' : 'imballi' }}
        </h2>
        <table class="packs-table">
          <thead class="visually-hidden">
            <tr>
              <th scope="col">GTIN</th>
              <th scope="col">Stato</th>
              <th scope="col">Quantità</th>
              <th scope="col">Ultima modifica</th>
              <th scope="col">Azioni</th>
            </tr>
          </thead>
          <tbody>
            @for (pack of p().packs; track pack.gtin) {
              <tr>
                <td><button type="button" class="pack-gtin" (click)="notInDemo()">{{ pack.gtin }}</button></td>
                <td><span class="status">{{ pack.status }}</span></td>
                <td class="qty">{{ pack.quantity }}</td>
                <td class="date">{{ shortDate(pack.modified) }}</td>
                <td class="actions">
                  <button type="button" class="row-toggle" [attr.aria-label]="'Azioni per l’imballo ' + pack.gtin" (click)="notInDemo()">
                    <app-icon name="chevron-down" [size]="16" [stroke]="2" />
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }

    <section class="update">
      <h2>Richiesta aggiornamento dei dati di prodotto finalizzati</h2>
      <p>
        Se dopo aver finalizzato un prodotto, ti accorgi di aver fatto degli errori, per esempio di digitazione, puoi richiedere che
        i dati errati vengano aggiornati. Ricorda che le modifiche che richiedi devono essere conformi alle
        <a href="https://www.gs1.org/1/gtinrules/it/" target="_blank" rel="noopener">regole di gestione dei GTIN</a>, previste dallo
        standard. Infatti, una volta finalizzato un prodotto, i parametri descrittivi non possono essere modificati per identificare
        una nuova referenza. Clicca sul pulsante "Richiesta aggiornamento". Ti ricordiamo che questa funzionalità serve solo per
        piccole modifiche. Una volta finalizzato, i parametri descrittivi di un prodotto non possono essere modificati per
        identificare un nuovo prodotto.
      </p>
      <button type="button" class="btn btn-outline" (click)="notInDemo()">
        Richiesta aggiornamento <app-icon name="chevron-down" [size]="14" [stroke]="2" class="rot" />
      </button>
    </section>
  `,
})
export class BaseTab {
  protected store = inject(DemoStore);
  private toasts = inject(Toasts);
  protected p = this.store.product;
  protected s = computed(() => this.p().summary);
  protected tutorialOpen = signal(false);
  protected showNews = computed(
    () => this.store.finalized() && !this.store.activeLinks().length && !this.store.discovery().baseHintClosed,
  );

  protected weights = computed(() => rows([['Peso netto', this.s().netWeight], ['Peso lordo', this.s().grossWeight]]));
  protected dimensions = computed(() =>
    rows([
      ['Profondità', this.s().depth],
      ['Larghezza', this.s().width],
      ['Altezza', this.s().height],
    ]),
  );

  /** "2026-10-20" → "20/10/26", come negli elenchi di Codifico+. */
  protected shortDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y.slice(2)}`;
  }

  protected notInDemo(): void {
    this.toasts.show('Sezione non inclusa nella demo', 'info');
  }
}

function rows(list: [string, Measure | undefined][]) {
  return list.map(([label, value]) => ({ label, value }));
}
