import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RegistryState } from '../../core/gln-data';
import { Icon, IconName } from '../../ui/icon';

/**
 * Stato sul registro GS1 dal punto di vista dei partner: icona, testo e colore insieme,
 * mai il solo colore. Sostituisce i badge "Pubblicato" e "Visibile" di Codifico+ di oggi.
 */
@Component({
  selector: 'app-registry-badge',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12.5px;
      font-weight: 600;
      white-space: nowrap;
    }
    :host(.visible) {
      color: #3f7a1a;
    }
    :host(.pending) {
      color: #0b5f9c;
    }
    :host(.off) {
      color: var(--muted);
      font-weight: 500;
    }
  `,
  host: { '[class]': 'cls()' },
  template: `<app-icon [name]="icon()" [size]="14" [stroke]="2" />{{ state() }}`,
})
export class RegistryBadge {
  state = input.required<RegistryState>();

  protected cls = computed(() =>
    this.state() === 'Visibile ai partner' ? 'visible' : this.state() === 'In pubblicazione' ? 'pending' : 'off',
  );
  protected icon = computed<IconName>(() =>
    this.state() === 'Visibile ai partner' ? 'check-circle' : this.state() === 'In pubblicazione' ? 'clock' : 'minus-circle',
  );
}
