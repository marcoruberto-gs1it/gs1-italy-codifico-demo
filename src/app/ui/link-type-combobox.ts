import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { LinkTypeOption } from '../core/vocabulary';
import { Icon } from './icon';

/** Un pezzo del titolo: `match` è il testo trovato dalla ricerca, da mostrare in grassetto. */
export interface TextSegment {
  text: string;
  match: boolean;
}

interface OptionGroup {
  key: 'popular' | 'all';
  title: string;
  options: LinkTypeOption[];
}

/** Minuscolo e senza accenti: "Sostenibilità" e "sostenibilita" diventano uguali. */
export function foldText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** True se `query` compare nel titolo, nella descrizione o nel codice dell'opzione. */
export function matchesQuery(option: LinkTypeOption, query: string): boolean {
  const q = foldText(query.trim());
  return !q || [option.label, option.description, option.code].some((t) => foldText(t).includes(q));
}

/**
 * Divide `text` nei pezzi trovati e non trovati da `query`, senza badare a maiuscole e accenti.
 * Il confronto avviene sul testo "piegato" e le posizioni tornano poi sul testo originale.
 */
export function highlightSegments(text: string, query: string): TextSegment[] {
  const q = foldText(query.trim());
  if (!q) return [{ text, match: false }];
  let folded = '';
  const origin: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const f = foldText(text[i]);
    for (let k = 0; k < f.length; k++) origin.push(i);
    folded += f;
  }
  const segments: TextSegment[] = [];
  let cursor = 0;
  for (let at = folded.indexOf(q); at !== -1; at = folded.indexOf(q, at + q.length)) {
    const start = origin[at];
    const end = origin[at + q.length - 1] + 1;
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}

let nextId = 0;

/**
 * Selettore della tipologia di link (linkType GS1): una combobox con ricerca in cui ogni opzione
 * mostra titolo, codice e descrizione su due righe. Segue il pattern ARIA combobox + listbox:
 * il focus resta nel campo di ricerca e l'opzione attiva è indicata con aria-activedescendant.
 * Sotto i 640 px la lista diventa un pannello a tutto schermo che sale dal basso.
 *
 * I valori deprecati non compaiono nella lista; se il valore corrente è deprecato, il campo lo
 * mostra con il badge "Deprecato" e propone il sostituto.
 */
@Component({
  selector: 'app-link-type-combobox',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './link-type-combobox.css',
  host: {
    '(document:pointerdown)': 'onDocumentPointer($event)',
    '[class.is-open]': 'open()',
  },
  template: `
    <span class="label" [id]="ids.label">{{ label() }}</span>
    <button
      #trigger
      type="button"
      class="trigger"
      role="combobox"
      aria-haspopup="listbox"
      [id]="ids.trigger"
      [attr.aria-labelledby]="ids.label"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="ids.listbox"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-invalid]="showError() || null"
      [attr.aria-required]="required() || null"
      [class.invalid]="showError()"
      [disabled]="disabled()"
      (click)="toggle()"
      (keydown)="onTriggerKey($event)"
    >
      @if (selected(); as s) {
        <span class="value">{{ s.label }}</span>
        @if (s.status === 'deprecated') {
          <span class="badge">Deprecato</span>
        }
      } @else {
        <span class="placeholder">{{ placeholder() }}</span>
      }
      <app-icon name="chevron-down" class="chevron" [size]="20" [stroke]="2" />
    </button>

    @if (open()) {
      <div class="popup">
        <div class="sheet-head">
          <span class="sheet-title">{{ label() }}</span>
          <button type="button" class="sheet-close" (click)="close(true)">Chiudi</button>
        </div>
        <div class="search">
          <app-icon name="search" [size]="18" [stroke]="1.8" />
          <input
            #search
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            autocomplete="off"
            spellcheck="false"
            placeholder="Cerca per nome o descrizione"
            [attr.aria-label]="'Cerca ' + label().toLowerCase()"
            [attr.aria-controls]="ids.listbox"
            [attr.aria-activedescendant]="activeId()"
            [value]="query()"
            (input)="onQuery($any($event.target).value)"
            (keydown)="onSearchKey($event)"
          />
        </div>
        <div class="list" role="listbox" [id]="ids.listbox" [attr.aria-labelledby]="ids.label">
          @for (g of groups(); track g.key) {
            <div role="group" class="group" [attr.aria-labelledby]="ids.base + '-g-' + g.key">
              <div class="group-label" role="presentation" [id]="ids.base + '-g-' + g.key">
                {{ g.title }}
              </div>
              @for (o of g.options; track o.code) {
                <div
                  role="option"
                  class="option"
                  [id]="optionId(o)"
                  [attr.aria-selected]="o.code === value()"
                  [attr.aria-describedby]="optionId(o) + '-d'"
                  [class.active]="o.code === activeCode()"
                  [class.selected]="o.code === value()"
                  (mousedown)="$event.preventDefault()"
                  (click)="select(o)"
                >
                  <span class="opt-text">
                    <span class="opt-row">
                      <!-- su una riga sola: gli spazi tra i pezzi finirebbero dentro il titolo -->
                      <!-- prettier-ignore -->
                      <span class="opt-label">@for (seg of segments(o.label); track $index) {@if (seg.match) {<b>{{ seg.text }}</b>} @else {<span>{{ seg.text }}</span>}}</span>
                      <span class="opt-code">{{ o.code }}</span>
                    </span>
                    <span class="opt-desc" [id]="optionId(o) + '-d'">{{ o.description }}</span>
                  </span>
                  <span class="tick">
                    @if (o.code === value()) {
                      <app-icon name="check" [size]="20" [stroke]="2.2" />
                    }
                  </span>
                </div>
              }
            </div>
          }
        </div>
        <div class="empty-wrap" aria-live="polite">
          @if (!flat().length) {
            <p class="empty">Nessuna tipologia trovata</p>
          }
        </div>
      </div>
    }

    @if (selected(); as s) {
      <p class="desc" [id]="ids.desc">{{ s.description }}</p>
      @if (s.status === 'deprecated') {
        <div class="deprecated" [id]="ids.warning">
          <app-icon name="alert-circle" [size]="18" [stroke]="1.8" />
          <div>
            <p>
              Questa tipologia non è più nello standard GS1.
              @if (replacement(); as r) {
                Ti consigliamo di usare «{{ r.label }}».
              }
            </p>
            @if (replacement(); as r) {
              <button type="button" class="btn btn-secondary use" (click)="select(r)">
                Usa {{ r.label }}
              </button>
            }
          </div>
        </div>
      }
    }
    @if (showError()) {
      <p class="error" [id]="ids.error">Scegli una tipologia di link</p>
    }
  `,
})
export class LinkTypeCombobox {
  /** Tutte le tipologie note, deprecate comprese: la lista nasconde quelle deprecate. */
  options = input.required<readonly LinkTypeOption[]>();
  /** Codice selezionato, es. "gs1:pip"; null se non c'è ancora una scelta. */
  value = model<string | null>(null);
  /** Lista aperta o chiusa. */
  open = model(false);
  label = input('Tipologia');
  placeholder = input('Scegli la tipologia di link');
  required = input(false);
  disabled = input(false);
  /** Il modulo ha provato a salvare con il campo vuoto: mostra l'errore. */
  invalid = input(false);

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private search = viewChild<ElementRef<HTMLInputElement>>('search');

  protected readonly ids = (() => {
    const base = `ltc-${++nextId}`;
    return {
      base,
      label: `${base}-label`,
      trigger: `${base}-trigger`,
      listbox: `${base}-listbox`,
      desc: `${base}-desc`,
      warning: `${base}-warning`,
      error: `${base}-error`,
    };
  })();

  protected query = signal('');
  protected activeCode = signal<string | null>(null);
  /** Diventa true quando la lista si chiude senza una scelta: da lì l'errore può comparire. */
  private touched = signal(false);

  protected selected = computed(() => this.options().find((o) => o.code === this.value()) ?? null);
  protected replacement = computed(() => {
    const next = this.selected()?.replacedBy;
    return next ? (this.options().find((o) => o.code === next) ?? null) : null;
  });

  private matches = computed(() =>
    this.options().filter((o) => o.status !== 'deprecated' && matchesQuery(o, this.query())),
  );
  protected groups = computed<OptionGroup[]>(() => {
    const found = this.matches();
    const groups: OptionGroup[] = [
      { key: 'popular', title: 'Più utilizzati', options: found.filter((o) => o.popular) },
      {
        key: 'all',
        title: 'Tutti i tipi',
        options: found
          .filter((o) => !o.popular)
          .sort((a, b) => a.label.localeCompare(b.label, 'it')),
      },
    ];
    return groups.filter((g) => g.options.length);
  });
  /** Le opzioni nell'ordine in cui compaiono, per la navigazione da tastiera. */
  protected flat = computed(() => this.groups().flatMap((g) => g.options));
  protected activeId = computed(() => {
    const active = this.flat().find((o) => o.code === this.activeCode());
    return active ? this.optionId(active) : null;
  });

  protected showError = computed(
    () => this.required() && !this.value() && (this.invalid() || this.touched()) && !this.open(),
  );
  protected describedBy = computed(() => {
    const s = this.selected();
    const ids = [
      s ? this.ids.desc : null,
      s?.status === 'deprecated' ? this.ids.warning : null,
      this.showError() ? this.ids.error : null,
    ].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });

  constructor() {
    // All'apertura il focus va nel campo di ricerca.
    afterRenderEffect(() => this.search()?.nativeElement.focus());
    // L'opzione attiva da tastiera resta visibile mentre la lista scorre.
    afterRenderEffect(() => {
      const id = this.activeId();
      if (!id) return;
      const el = this.host.nativeElement.querySelector<HTMLElement>(`#${id}`);
      el?.scrollIntoView?.({ block: 'nearest' });
    });
  }

  protected optionId(o: LinkTypeOption): string {
    return `${this.ids.base}-o-${o.code.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  }

  protected segments(text: string): TextSegment[] {
    return highlightSegments(text, this.query());
  }

  protected toggle(): void {
    if (this.open()) this.close(false);
    else this.openList();
  }

  openList(): void {
    if (this.disabled()) return;
    this.query.set('');
    this.open.set(true);
    const list = this.flat();
    this.activeCode.set(
      list.some((o) => o.code === this.value()) ? this.value() : (list[0]?.code ?? null),
    );
  }

  close(restoreFocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    if (!this.value()) this.touched.set(true);
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  protected select(o: LinkTypeOption): void {
    this.value.set(o.code);
    if (this.open()) this.close(true);
  }

  protected onQuery(text: string): void {
    this.query.set(text);
    this.activeCode.set(this.flat()[0]?.code ?? null);
  }

  protected onTriggerKey(event: KeyboardEvent): void {
    // Invio e Spazio arrivano come click sul pulsante; le frecce aprono la lista.
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.open()) this.openList();
    }
  }

  protected onSearchKey(event: KeyboardEvent): void {
    const list = this.flat();
    const index = list.findIndex((o) => o.code === this.activeCode());
    const go = (i: number) => {
      event.preventDefault();
      if (list.length) this.activeCode.set(list[Math.max(0, Math.min(list.length - 1, i))].code);
    };
    switch (event.key) {
      case 'ArrowDown':
        return go(index < 0 ? 0 : index + 1);
      case 'ArrowUp':
        return go(index < 0 ? list.length - 1 : index - 1);
      case 'Home':
        return go(0);
      case 'End':
        return go(list.length - 1);
      case 'Enter': {
        event.preventDefault(); // non deve inviare il modulo
        const active = list[index];
        if (active) this.select(active);
        return;
      }
      case 'Escape':
        event.preventDefault();
        event.stopPropagation(); // chiude solo la lista, non la finestra modale
        return this.close(true);
      case 'Tab':
        // Nessun preventDefault: il focus passa al campo successivo.
        return this.close(false);
    }
  }

  protected onDocumentPointer(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }
}
