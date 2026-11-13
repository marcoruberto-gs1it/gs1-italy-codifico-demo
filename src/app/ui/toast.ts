import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Icon } from './icon';

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'success' | 'info' | 'warning';
}

/** Conferme brevi in basso a destra ("Link salvato", "Sezione non inclusa nella demo"...). */
@Injectable({ providedIn: 'root' })
export class Toasts {
  readonly messages = signal<ToastMessage[]>([]);
  private seq = 0;

  show(text: string, kind: ToastMessage['kind'] = 'success'): void {
    const id = ++this.seq;
    this.messages.update((m) => [...m, { id, text, kind }]);
    // Gli avvisi restano più a lungo: vanno letti.
    setTimeout(() => this.messages.update((m) => m.filter((t) => t.id !== id)), kind === 'warning' ? 6500 : 3200);
  }
}

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .stack {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 200;
      display: grid;
      gap: 10px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 260px;
      max-width: 420px;
      padding: 13px 18px;
      background: var(--gs1-blue);
      color: #fff;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 10px 30px rgb(0 20 50 / 0.25);
      animation: in 0.25s var(--ease);
    }
    .toast.success app-icon {
      color: var(--gs1-green);
    }
    .toast.warning {
      background: #7a4a00;
      max-width: 520px;
    }
    .toast.warning app-icon {
      color: #ffd27a;
    }
    @keyframes in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
    }
  `,
  template: `
    <div class="stack" role="status" aria-live="polite">
      @for (t of toasts.messages(); track t.id) {
        <div class="toast" [class]="t.kind">
          <app-icon [name]="t.kind === 'success' ? 'check-circle' : t.kind === 'warning' ? 'alert-circle' : 'info'" [size]="18" />
          {{ t.text }}
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected toasts = inject(Toasts);
}
