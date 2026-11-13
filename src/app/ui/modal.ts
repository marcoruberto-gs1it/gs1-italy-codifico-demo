import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';
import { Icon } from './icon';

/**
 * Finestra modale nello stile di Codifico+: velo grigio sulla pagina, pannello bianco largo
 * 1020 px, titolo blu con filetto sotto e la X in alto a destra. Esc e click sul velo chiudono;
 * il focus entra nel pannello all'apertura.
 */
@Component({
  selector: 'app-modal',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgb(0 0 0 / 0.47);
      overflow-y: auto;
      padding: clamp(16px, 22vh, 247px) 16px 40px;
      animation: fade 0.18s ease-out;
    }
    .panel {
      position: relative;
      width: min(100%, var(--modal-width, 1020px));
      margin: 0 auto;
      background: #fafafa;
      box-shadow: var(--shadow-modal);
      padding: 28px 31px 26px;
      animation: rise 0.24s var(--ease);
      outline: none;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 0 12px;
      border-bottom: 1px solid #bdbdbd;
      margin-bottom: 24px;
    }
    h2 {
      color: var(--gs1-blue-text);
      font-size: 17px;
      font-weight: 700;
    }
    .close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border: 0;
      background: none;
      color: #555;
      cursor: pointer;
    }
    .close:hover {
      color: var(--gs1-blue);
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(14px);
      }
    }
  `,
  template: `
    <div class="backdrop" (click)="onBackdrop($event)">
      <section class="panel" role="dialog" aria-modal="true" [attr.aria-label]="title()" tabindex="-1" #panel>
        <button type="button" class="close" (click)="closed.emit()" aria-label="Chiudi">
          <app-icon name="close" [size]="20" />
        </button>
        <header>
          <h2>{{ title() }}</h2>
          <ng-content select="[modal-header-extra]" />
        </header>
        <ng-content />
      </section>
    </div>
  `,
})
export class Modal {
  title = input.required<string>();
  closed = output<void>();

  private host = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      const panel = this.host.nativeElement.querySelector('.panel') as HTMLElement | null;
      const first = panel?.querySelector<HTMLElement>('input, select, textarea, [data-autofocus]');
      (first ?? panel)?.focus();
    });
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }
}
