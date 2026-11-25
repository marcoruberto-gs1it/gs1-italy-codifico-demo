import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { formatNumber } from '../core/format';
import { Icon, IconName } from './icon';

export interface OverviewItem {
  value: string;
  count: number;
  /** Colore del segmento nella barra e del simbolo nel filtro (lo stesso dei badge in tabella). */
  color: string;
  /** Icona al posto del pallino colorato (es. il tipo di GLN). */
  icon?: IconName;
}

export interface OverviewGroup {
  id: string;
  label: string;
  isNew?: boolean;
  items: OverviewItem[];
  /**
   * Segmenti della barra, se diversi dai filtri (es. i tipi di GLN raggruppati per AI).
   * Assente: un segmento per filtro, con lo stesso colore.
   */
  bar?: { label: string; count: number; color: string }[];
}

export interface OverviewToggle {
  group: string;
  value: string;
}

/**
 * Riepilogo e filtri sopra un elenco (Prodotti, Sedi e località), al posto della colonna di
 * filtri a destra. Per ogni gruppo: una barra sottile che mostra come si distribuiscono gli
 * elementi e i filtri a pulsante, che fanno anche da legenda (simbolo, nome, numero).
 * Con un filtro attivo, i segmenti non scelti si attenuano: si vede subito cosa si sta guardando.
 */
@Component({
  selector: 'app-filter-overview',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      margin-bottom: 16px;
      padding: 16px 20px 18px;
      background: #fff;
      border: 1px solid var(--border);
      border-top: 3px solid var(--gs1-blue);
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 14px;
      margin-bottom: 14px;
      font-size: 13.5px;
    }
    .head .total {
      color: var(--gs1-blue);
      font-size: 22px;
      font-weight: 600;
      line-height: 1;
    }
    .head .noun {
      color: var(--text-strong);
      font-weight: 600;
    }
    .head .hint {
      color: var(--muted);
    }
    .active {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
      color: var(--gs1-blue);
      font-weight: 600;
    }
    .clear {
      padding: 6px 12px;
      border: 1px solid var(--gs1-blue);
      background: #fff;
      color: var(--gs1-blue);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
    }
    .clear:hover {
      background: #eef3f9;
    }
    .groups {
      display: grid;
      grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
      gap: 18px 28px;
    }
    .group + .group {
      padding-left: 28px;
      border-left: 1px solid #e6e9ec;
    }
    h3 {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      color: var(--text-strong);
      font-size: 13px;
      font-weight: 600;
    }
    .new-tag {
      padding: 1px 5px;
      border-radius: 3px;
      background: var(--gs1-orange);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    /* Barra segmentata sottile: 8 px, estremi arrotondati, 2 px di stacco tra i segmenti. */
    .bar {
      display: flex;
      gap: 2px;
      height: 8px;
      margin-bottom: 10px;
    }
    .seg {
      min-width: 4px;
      border-radius: 999px;
      transition: opacity 0.2s;
    }
    .seg.dim {
      opacity: 0.22;
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    button.chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 32px;
      padding: 0 10px;
      border: 1px solid #d5d9dd;
      border-radius: 999px;
      background: #fff;
      color: var(--text-strong);
      font-size: 12.5px;
      cursor: pointer;
      transition:
        border-color 0.15s,
        background-color 0.15s;
    }
    button.chip:hover {
      border-color: var(--gs1-blue);
    }
    button.chip[aria-pressed='true'] {
      border-color: var(--gs1-blue);
      background: #e9f0f9;
      color: var(--gs1-blue);
      font-weight: 600;
      box-shadow: inset 0 0 0 1px var(--gs1-blue);
    }
    .sw {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex: none;
    }
    .n {
      min-width: 22px;
      padding: 0 6px;
      border-radius: 999px;
      background: #eef1f4;
      color: var(--text-strong);
      font-size: 11px;
      font-weight: 700;
      text-align: center;
    }
    button.chip[aria-pressed='true'] .n {
      background: var(--gs1-blue);
      color: #fff;
    }
    .check {
      margin-left: -2px;
    }
    @media (max-width: 1100px) {
      .groups {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .group + .group {
        padding-left: 0;
        border-left: 0;
      }
    }
    @media (max-width: 640px) {
      .groups {
        grid-template-columns: 1fr;
      }
      .active {
        margin-left: 0;
      }
    }
  `,
  template: `
    <div class="head">
      <span class="total">{{ fmt(total()) }}</span>
      <span class="noun">{{ noun() }}</span>
      <span class="hint">Scegli uno o più valori per filtrare l’elenco.</span>
      @if (activeCount()) {
        <span class="active" role="status">
          {{ activeCount() === 1 ? '1 filtro attivo' : activeCount() + ' filtri attivi' }} · {{ fmt(shown()) }} in elenco
          <button type="button" class="clear" (click)="clear.emit()">Pulisci filtri</button>
        </span>
      }
    </div>
    <div class="groups" [style.--cols]="groups().length">
      @for (g of groups(); track g.id) {
        <div class="group" role="group" [attr.aria-labelledby]="'ov-' + g.id">
          <h3 [id]="'ov-' + g.id">
            {{ g.label }}
            @if (g.isNew) {
              <span class="new-tag">Nuovo</span>
            }
          </h3>
          <div class="bar" aria-hidden="true">
            @for (s of segments(g); track s.label) {
              <span class="seg" [style.flex-grow]="s.count" [style.background]="s.color" [class.dim]="s.dim"></span>
            }
          </div>
          <ul>
            @for (i of g.items; track i.value) {
              <li>
                <button
                  type="button"
                  class="chip"
                  [attr.aria-pressed]="isOn(g.id, i.value)"
                  [attr.aria-label]="g.label + ': ' + i.value + ', ' + i.count"
                  (click)="toggle.emit({ group: g.id, value: i.value })"
                >
                  @if (i.icon) {
                    <app-icon [name]="i.icon" [size]="15" [stroke]="2" [style.color]="i.color" />
                  } @else {
                    <span class="sw" [style.background]="i.color"></span>
                  }
                  {{ i.value }}
                  <span class="n">{{ fmt(i.count) }}</span>
                </button>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class FilterOverview {
  groups = input.required<OverviewGroup[]>();
  active = input.required<Record<string, string[]>>();
  /** Totale degli elementi e quanti ne restano con i filtri attivi. */
  total = input.required<number>();
  shown = input.required<number>();
  noun = input.required<string>();

  toggle = output<OverviewToggle>();
  clear = output<void>();

  protected activeCount = computed(() => Object.values(this.active()).reduce((n, v) => n + v.length, 0));

  protected isOn(group: string, value: string): boolean {
    return (this.active()[group] ?? []).includes(value);
  }

  /** Segmenti della barra; con un filtro attivo nel gruppo, quelli non scelti si attenuano. */
  protected segments(g: OverviewGroup) {
    const chosen = this.active()[g.id] ?? [];
    if (g.bar) return g.bar.filter((s) => s.count > 0).map((s) => ({ ...s, dim: false }));
    return g.items
      .filter((i) => i.count > 0)
      .map((i) => ({ label: i.value, count: i.count, color: i.color, dim: chosen.length > 0 && !chosen.includes(i.value) }));
  }

  protected fmt(n: number): string {
    return formatNumber(n);
  }
}
