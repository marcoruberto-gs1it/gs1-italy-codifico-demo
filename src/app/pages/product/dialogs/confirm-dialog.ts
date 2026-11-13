import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Modal } from '../../../ui/modal';

/** Conferma di un'azione irreversibile (eliminazione di un link). */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    app-modal {
      --modal-width: 620px;
    }
    .body {
      font-size: 15px;
      color: var(--text-strong);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 30px;
    }
  `,
  template: `
    <app-modal [title]="title()" (closed)="closed.emit()">
      <div class="body"><ng-content /></div>
      <div class="actions">
        <button type="button" class="btn btn-secondary" (click)="closed.emit()" data-autofocus>Annulla</button>
        <button type="button" class="btn btn-primary" (click)="confirmed.emit()">{{ confirmLabel() }}</button>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialog {
  title = input.required<string>();
  confirmLabel = input('Conferma');
  confirmed = output<void>();
  closed = output<void>();
}
