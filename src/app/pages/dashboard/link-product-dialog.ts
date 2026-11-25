import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Modal } from '../../ui/modal';
import { CatalogRow } from './dashboard-model';

/** Da quanti caratteri parte la ricerca. */
const MIN_CHARS = 3;

type Filter = 'without' | 'all';

/** Una descrizione spezzata attorno al testo cercato, per evidenziarlo. */
interface Segment {
  text: string;
  match: boolean;
}

/**
 * Modale "Scegli un prodotto da collegare": dalla dashboard porta alla tab Digital Link di un
 * prodotto finalizzato. Ricerca per GTIN (anche parziale) e descrizione da 3 caratteri, filtro
 * "Senza Digital Link" (predefinito) o "Tutti" con i contatori. Focus intrappolato ed Esc
 * vengono da app-modal.
 */
@Component({
  selector: 'app-link-product-dialog',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    app-modal {
      --modal-width: 780px;
    }
    .search label {
      display: block;
      margin-bottom: 6px;
      color: var(--gs1-blue-text);
      font-size: 14px;
      font-weight: 500;
    }
    .search input {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      border: 1px solid var(--border);
      background: #fff;
      font-size: 14px;
    }
    .search input:focus-visible {
      outline: none;
      border-color: var(--gs1-link);
      box-shadow: 0 0 0 3px rgb(1 141 189 / 0.18);
    }
    .hint {
      margin-top: 6px;
      color: var(--muted);
      font-size: 12.5px;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px 16px;
      margin: 18px 0 10px;
    }
    .segmented {
      display: inline-flex;
      border: 1px solid var(--gs1-blue);
    }
    .segmented button {
      min-height: 36px;
      padding: 0 14px;
      border: 0;
      background: #fff;
      color: var(--gs1-blue);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .segmented button + button {
      border-left: 1px solid var(--gs1-blue);
    }
    .segmented button[aria-pressed='true'] {
      background: var(--gs1-blue);
      color: #fff;
    }
    .count {
      color: var(--muted);
      font-size: 13px;
    }
    .head,
    .pick {
      display: grid;
      grid-template-columns: 132px minmax(0, 1fr) 92px 150px;
      gap: 12px;
      align-items: center;
    }
    .head {
      padding: 0 12px 6px;
      color: var(--muted);
      font-size: 11.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    ul {
      max-height: min(46vh, 420px);
      margin: 0;
      padding: 0;
      overflow-y: auto;
      list-style: none;
      border: 1px solid var(--border-soft);
      background: #fff;
    }
    li + li {
      border-top: 1px solid #eceeee;
    }
    .pick {
      width: 100%;
      padding: 11px 12px;
      border: 0;
      background: none;
      color: var(--text-strong);
      font-size: 13.5px;
      text-align: left;
      cursor: pointer;
    }
    .pick:hover {
      background: #f1f5fa;
    }
    .pick:focus-visible {
      outline-offset: -2px;
    }
    .gtin {
      color: var(--gs1-link);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .desc {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    mark {
      background: #fff1b8;
      color: inherit;
    }
    .date {
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }
    .badge {
      justify-self: start;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge.on {
      background: #e7f6dc;
      color: #3f7a1a;
    }
    .badge.off {
      background: #eef1f4;
      color: #55606b;
    }
    .demo {
      margin-left: 6px;
      padding: 1px 6px;
      border-radius: 3px;
      background: var(--gs1-blue);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      vertical-align: 1px;
    }
    .empty {
      padding: 28px 20px;
      border: 1px dashed var(--border);
      background: #fff;
      text-align: center;
      color: var(--text);
    }
    .empty strong {
      display: block;
      margin-bottom: 4px;
      color: var(--gs1-blue);
    }
    .empty button {
      margin-top: 10px;
      padding: 0;
      border: 0;
      background: none;
      color: var(--gs1-link);
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }
    @media (max-width: 700px) {
      .head {
        display: none;
      }
      .pick {
        grid-template-columns: 1fr auto;
      }
      .desc {
        grid-column: 1 / -1;
        grid-row: 2;
        white-space: normal;
      }
      .date {
        display: none;
      }
    }
  `,
  template: `
    <app-modal title="Scegli un prodotto da collegare" (closed)="closed.emit()">
      <div class="search">
        <label for="pick-search">Cerca per GTIN o descrizione</label>
        <input
          id="pick-search"
          type="search"
          autocomplete="off"
          aria-describedby="pick-hint"
          aria-controls="pick-results"
          placeholder="Es. 8032089 oppure passata"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        <p class="hint" id="pick-hint">
          Bastano 3 caratteri, anche solo una parte del GTIN. Il GS1 Digital Link si crea sui prodotti finalizzati.
        </p>
      </div>

      <div class="bar">
        <div class="segmented" role="group" aria-label="Quali prodotti mostrare">
          <button type="button" [attr.aria-pressed]="filter() === 'without'" (click)="filter.set('without')">
            Senza Digital Link ({{ counts().without }})
          </button>
          <button type="button" [attr.aria-pressed]="filter() === 'all'" (click)="filter.set('all')">
            Tutti ({{ counts().all }})
          </button>
        </div>
        <p class="count" role="status">{{ statusText() }}</p>
      </div>

      @if (results().length) {
        <div class="head" aria-hidden="true">
          <span>GTIN</span><span>Descrizione</span><span>Modifica</span><span>Digital Link</span>
        </div>
        <ul id="pick-results" aria-label="Prodotti finalizzati">
          @for (r of results(); track r.gtin) {
            <li>
              <button type="button" class="pick" (click)="picked.emit(r)">
                <span class="gtin">{{ r.gtin }}</span>
                <span class="desc">
                  @for (s of segments(r.description); track $index) {
                    @if (s.match) {
                      <mark>{{ s.text }}</mark>
                    } @else {
                      {{ s.text }}
                    }
                  }
                  @if (r.demo) {
                    <span class="demo">Demo</span>
                  }
                </span>
                <span class="date">{{ date(r.modified) }}</span>
                @if (r.linkCount) {
                  <span class="badge on">DL attivo · {{ r.linkCount }} link</span>
                } @else {
                  <span class="badge off">Senza Digital Link</span>
                }
              </button>
            </li>
          }
        </ul>
      } @else {
        <div class="empty" id="pick-results">
          <strong>Nessun prodotto trovato</strong>
          @if (searching()) {
            Nessun prodotto {{ filter() === 'without' ? 'senza Digital Link ' : '' }}corrisponde a “{{ query().trim() }}”.
            Controlla il GTIN o prova con un’altra parola.
          } @else {
            Tutti i prodotti finalizzati hanno già il GS1 Digital Link.
          }
          @if (filter() === 'without' && counts().all) {
            <br /><button type="button" (click)="filter.set('all')">Cerca fra tutti i prodotti</button>
          }
        </div>
      }
    </app-modal>
  `,
})
export class LinkProductDialog {
  /** Il perimetro: prodotti a peso fisso finalizzati. */
  rows = input.required<CatalogRow[]>();
  closed = output<void>();
  picked = output<CatalogRow>();

  protected query = signal('');
  protected filter = signal<Filter>('without');

  protected term = computed(() => this.query().trim().toLowerCase());
  protected searching = computed(() => this.term().length >= MIN_CHARS);

  /** Prodotti che corrispondono alla ricerca (tutti, sotto i 3 caratteri). */
  private matching = computed(() => {
    const t = this.term();
    if (!this.searching()) return this.rows();
    const digits = t.replace(/\s/g, '');
    return this.rows().filter((r) => r.gtin.includes(digits) || r.description.toLowerCase().includes(t));
  });

  protected counts = computed(() => ({
    all: this.matching().length,
    without: this.matching().filter((r) => !r.linkCount).length,
  }));

  protected results = computed(() =>
    this.filter() === 'all' ? this.matching() : this.matching().filter((r) => !r.linkCount),
  );

  protected statusText = computed(() => {
    const n = this.results().length;
    return n === 1 ? '1 prodotto' : `${n.toLocaleString('it-IT')} prodotti`;
  });

  protected segments(text: string): Segment[] {
    const t = this.term();
    if (!this.searching()) return [{ text, match: false }];
    const i = text.toLowerCase().indexOf(t);
    if (i < 0) return [{ text, match: false }];
    return [
      { text: text.slice(0, i), match: false },
      { text: text.slice(i, i + t.length), match: true },
      { text: text.slice(i + t.length), match: false },
    ];
  }

  protected date(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
