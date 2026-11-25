import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * Piccoli grafici della dashboard, in HTML e SVG senza librerie.
 *
 * Palette dati (validata con lo script del metodo dataviz: banda di luminosità, croma,
 * separazione per daltonismo e contrasto su fondo bianco, tutti superati):
 *   --viz-1 #2e5eaa blu GS1 schiarito (il blu del marchio #002c6c è troppo scuro per i dati)
 *   --viz-2 #f26334 arancio GS1
 *   --viz-3 #018dbd azzurro GS1
 * L'ordine è fisso: l'arancio sta in mezzo, così due vicini non sono mai blu e azzurro.
 */
/** Gli stessi colori sono in styles.css come --viz-1, --viz-2, --viz-3, --viz-track, --viz-muted. */
export const VIZ = {
  s1: '#2e5eaa',
  s2: '#f26334',
  s3: '#018dbd',
  /** Traccia delle barre: un passo chiaro della stessa rampa del blu. */
  track: '#dde6f3',
  /** Colore di contesto (sparkline). */
  muted: '#9aa6b2',
} as const;

export interface Part {
  label: string;
  value: number;
  color: string;
}

const pct = (v: number, total: number) => (total ? Math.round((v / total) * 100) : 0);

/** Testo leggibile dentro un blocco colorato: bianco sui colori scuri, quasi nero sull'arancio. */
const inkOn = (color: string) => (color === VIZ.s2 ? '#1f1f1f' : '#ffffff');

/**
 * Barra segmentata alta (28 px): un intero diviso in parti, con la quota stampata nel blocco
 * quando ci sta e una legenda con nome e valore. Al passaggio del mouse ogni blocco mostra nome,
 * valore e quota; per la tastiera e i lettori di schermo la barra ha un nome con tutti i dati.
 */
@Component({
  selector: 'app-segmented-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    .bar {
      position: relative;
      display: flex;
      gap: 2px;
      height: 28px;
    }
    .bar:focus-visible {
      outline: 2px solid var(--gs1-link);
      outline-offset: 3px;
    }
    .seg {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 3px;
      padding-left: 7px;
      border-radius: 4px;
      font-size: 11.5px;
      font-weight: 700;
      white-space: nowrap;
      overflow: visible;
    }
    .tip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      z-index: 20;
      width: max-content;
      padding: 6px 10px;
      background: var(--gs1-blue);
      color: #fff;
      font-size: 12px;
      font-weight: 400;
      transform: translateX(-50%);
      pointer-events: none;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      margin: 8px 0 0;
      padding: 0;
      list-style: none;
      font-size: 12.5px;
      color: var(--text);
    }
    .legend li {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .sw {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
    .legend strong {
      color: var(--text-strong);
      font-weight: 600;
    }
  `,
  template: `
    <div class="bar" role="img" tabindex="0" [attr.aria-label]="summary()" (mouseleave)="hover.set(-1)">
      @for (p of visible(); track p.label; let i = $index) {
        <span
          class="seg"
          [style.flex-grow]="p.value"
          [style.background]="p.color"
          [style.color]="ink(p.color)"
          (mouseenter)="hover.set(i)"
        >
          @if (fits(p)) {
            {{ share(p) }}%
          }
          @if (hover() === i) {
            <span class="tip" aria-hidden="true">{{ p.label }}: {{ fmt(p.value) }} ({{ share(p) }}%)</span>
          }
        </span>
      }
    </div>
    <ul class="legend" aria-hidden="true">
      @for (p of visible(); track p.label) {
        <li><span class="sw" [style.background]="p.color"></span>{{ p.label }} <strong>{{ fmt(p.value) }}</strong></li>
      }
    </ul>
  `,
})
export class SegmentedBar {
  parts = input.required<Part[]>();
  /** Cosa rappresenta la barra, per il nome accessibile (es. "Prodotti per stato"). */
  label = input.required<string>();

  protected hover = signal(-1);
  protected total = computed(() => this.parts().reduce((s, p) => s + p.value, 0));
  /** Una parte a zero non disegna niente. */
  protected visible = computed(() => this.parts().filter((p) => p.value > 0));
  protected summary = computed(
    () => `${this.label()}: ${this.visible().map((p) => `${p.label} ${this.fmt(p.value)} (${this.share(p)}%)`).join(', ')}`,
  );

  protected share(p: Part): number {
    return pct(p.value, this.total());
  }

  /** La quota si stampa solo se il blocco è abbastanza largo (circa 12% della barra). */
  protected fits(p: Part): boolean {
    return p.value / this.total() >= 0.12;
  }

  protected ink(color: string): string {
    return inkOn(color);
  }

  protected fmt(n: number): string {
    return n.toLocaleString('it-IT');
  }
}

/**
 * Misuratore: un rapporto rispetto a un totale. Riempimento blu su una traccia della stessa
 * rampa, estremo arrotondato. `size` sceglie lo spessore (8 px o 6 px nelle liste).
 */
@Component({
  selector: 'app-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    .track {
      height: var(--h, 8px);
      border-radius: 999px;
      background: var(--viz-track);
      overflow: hidden;
    }
    .fill {
      height: 100%;
      border-radius: 999px;
      background: var(--viz-1);
      transition: width 0.6s var(--ease);
    }
  `,
  template: `
    <div
      class="track"
      role="meter"
      aria-valuemin="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value()"
      [attr.aria-label]="label()"
      [attr.aria-valuetext]="value() + ' su ' + max()"
      [style.--h.px]="size()"
    >
      <div class="fill" [style.width]="width()"></div>
    </div>
  `,
})
export class Meter {
  value = input.required<number>();
  max = input.required<number>();
  label = input.required<string>();
  size = input(8);

  protected width = computed(() => {
    const r = this.max() ? this.value() / this.max() : 0;
    return r > 0 ? `max(6px, ${r * 100}%)` : '0';
  });
}

/**
 * Sparkline: l'andamento giornaliero in grigio di contesto, l'ultimo giorno evidenziato in blu.
 * Al passaggio del mouse mostra giorno e valore; il nome accessibile riassume la serie.
 */
@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: block;
    }
    svg {
      display: block;
      width: 100%;
      height: 40px;
      overflow: visible;
    }
    .dot {
      position: absolute;
      width: 10px;
      height: 10px;
      border: 2px solid #fff;
      border-radius: 50%;
      background: var(--viz-1);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .readout {
      position: absolute;
      bottom: calc(100% + 4px);
      z-index: 20;
      width: max-content;
      padding: 5px 9px;
      background: var(--gs1-blue);
      color: #fff;
      font-size: 12px;
      transform: translateX(-50%);
      pointer-events: none;
    }
  `,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + W + ' ' + H"
      preserveAspectRatio="none"
      role="img"
      [attr.aria-label]="label()"
      (mousemove)="onMove($event)"
      (mouseleave)="hover.set(-1)"
    >
      <polyline [attr.points]="points()" fill="none" stroke="var(--viz-muted)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      @if (hover() >= 0) {
        <line [attr.x1]="x(hover())" [attr.x2]="x(hover())" y1="0" [attr.y2]="H" stroke="#c9d0d8" stroke-width="1" vector-effect="non-scaling-stroke" />
      }
    </svg>
    <!-- I punti sono in HTML per restare tondi anche con l'SVG deformato in larghezza. -->
    <span class="dot" [style.left.%]="(x(last()) / W) * 100" [style.top.px]="(y(values()[last()]) / H) * 40"></span>
    @if (hover() >= 0) {
      <span class="readout" [style.left.%]="(x(hover()) / W) * 100">{{ dayLabel(hover()) }}: {{ values()[hover()] }} scansioni</span>
    }
  `,
})
export class Sparkline {
  values = input.required<number[]>();
  label = input.required<string>();
  /** Data (ISO) dell'ultimo valore. */
  end = input.required<string>();

  protected readonly W = 300;
  protected readonly H = 40;
  protected hover = signal(-1);

  protected last = computed(() => this.values().length - 1);
  private max = computed(() => Math.max(...this.values(), 1));

  protected x(i: number): number {
    return this.last() ? (i / this.last()) * this.W : 0;
  }

  protected y(v: number): number {
    return this.H - 3 - (v / this.max()) * (this.H - 6);
  }

  protected points = computed(() => this.values().map((v, i) => `${this.x(i)},${this.y(v)}`).join(' '));

  protected onMove(event: MouseEvent): void {
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    const r = (event.clientX - rect.left) / rect.width;
    this.hover.set(Math.max(0, Math.min(this.last(), Math.round(r * this.last()))));
  }

  protected dayLabel(i: number): string {
    const d = new Date(this.end() + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - (this.last() - i));
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  }
}
