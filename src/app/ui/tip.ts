import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Tooltip accessibile attorno a un elemento proiettato (un link, un pulsante "i"). Compare al
 * passaggio del mouse e al focus, resta visibile se ci si passa sopra, si chiude con Esc
 * (WCAG 1.4.13). L'elemento proiettato deve avere aria-describedby uguale a `tipId`.
 */
@Component({
  selector: 'app-tip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mouseenter)': 'open.set(true)',
    '(mouseleave)': 'open.set(false)',
    '(focusin)': 'open.set(true)',
    '(focusout)': 'open.set(false)',
    '(keydown.escape)': 'open.set(false)',
  },
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .tip {
      position: absolute;
      left: 50%;
      bottom: calc(100% + 8px);
      z-index: 30;
      width: max-content;
      max-width: 260px;
      padding: 8px 11px;
      background: var(--gs1-blue);
      color: #fff;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.45;
      text-align: left;
      white-space: normal;
      transform: translateX(-50%);
      box-shadow: 0 6px 18px rgb(0 20 50 / 0.2);
    }
    .tip[hidden] {
      display: none;
    }
    .tip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      border: 6px solid transparent;
      border-top-color: var(--gs1-blue);
      transform: translateX(-50%);
    }
    :host(.end) .tip {
      left: auto;
      right: -6px;
      transform: none;
    }
    :host(.end) .tip::after {
      left: auto;
      right: 10px;
      transform: none;
    }
    ul {
      margin: 4px 0 0;
      padding-left: 16px;
    }
  `,
  template: `
    <ng-content />
    <span class="tip" role="tooltip" [id]="tipId()" [hidden]="!open()">
      @if (heading()) {
        <strong>{{ heading() }}</strong>
      }
      @if (lines().length) {
        <ul>
          @for (l of lines(); track l) {
            <li>{{ l }}</li>
          }
        </ul>
      } @else {
        {{ text() }}
      }
    </span>
  `,
})
export class Tip {
  tipId = input.required<string>();
  text = input('');
  heading = input('');
  /** In alternativa al testo: un elenco puntato. */
  lines = input<string[]>([]);

  protected open = signal(false);
}
