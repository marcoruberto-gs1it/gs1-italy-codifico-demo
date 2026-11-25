import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';
import { trapTab } from './focus-trap';
import { Icon } from './icon';

let nextId = 0;

/**
 * Pannello laterale della Guida: entra da destra sopra la pagina, con i contenuti di aiuto
 * della pagina corrente (proiettati). Esc, la X e il click sul velo lo chiudono; il focus resta
 * nel pannello e alla chiusura torna al pulsante che lo ha aperto.
 */
@Component({
  selector: 'app-help-panel',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  styles: `
    .veil {
      position: fixed;
      inset: 0;
      z-index: 90;
      background: rgb(0 20 50 / 0.35);
      animation: fade 0.18s ease-out;
    }
    aside {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 91;
      display: flex;
      flex-direction: column;
      width: min(420px, 100vw);
      background: #fff;
      border-top: 3px solid var(--gs1-blue);
      box-shadow: var(--shadow-modal);
      animation: slide 0.24s var(--ease);
      outline: none;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 20px 20px 16px 24px;
      border-bottom: 1px solid var(--border-soft);
    }
    h2 {
      color: var(--gs1-blue);
      font-size: 20px;
      font-weight: 500;
    }
    .close {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border: 0;
      background: none;
      color: #555;
      cursor: pointer;
    }
    .close:hover {
      color: var(--gs1-blue);
    }
    .body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px 28px;
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes slide {
      from {
        transform: translateX(24px);
        opacity: 0;
      }
    }
  `,
  template: `
    <div class="veil" (click)="closed.emit()"></div>
    <aside
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
      tabindex="-1"
      #panel
      (keydown)="trap($event, panel)"
    >
      <header>
        <h2 [id]="titleId">{{ title() }}</h2>
        <button type="button" class="close" aria-label="Chiudi la guida" (click)="closed.emit()">
          <app-icon name="close" [size]="20" />
        </button>
      </header>
      <div class="body">
        <ng-content />
      </div>
    </aside>
  `,
})
export class HelpPanel {
  title = input('Guida');
  closed = output<void>();

  protected readonly titleId = `help-panel-title-${++nextId}`;
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private opener = document.activeElement as HTMLElement | null;

  constructor() {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('aside')?.focus());
    inject(DestroyRef).onDestroy(() => {
      if (this.opener?.isConnected) this.opener.focus();
    });
  }

  protected trap(event: KeyboardEvent, panel: HTMLElement): void {
    trapTab(event, panel);
  }
}
