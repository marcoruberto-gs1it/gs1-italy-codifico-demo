import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GLN_AI, GLN_PREFIX, GLN_TYPE_INFO, GlnRecord } from '../../core/gln-data';
import { GlnStore } from '../../core/gln-store';
import { Icon } from '../../ui/icon';
import { Tip } from '../../ui/tip';
import { Toasts } from '../../ui/toast';
import { RegistryBadge } from './registry-badge';

/**
 * Scheda di una sede o località (GLN), sul modello della scheda prodotto: riepilogo in sola
 * lettura come testo (non campi disattivati), collegamenti con gli altri GLN e, a destra,
 * registro GS1 e stato con interruttori etichettati e spiegati.
 */
@Component({
  selector: 'app-place-page',
  imports: [RouterLink, Icon, Tip, RegistryBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-page.html',
  styleUrls: ['../product/product-page.css', '../product/product-sidebar.css', '../product/tabs/base-tab.css', './place-page.css'],
})
export class PlacePage {
  /** Dalla rotta /sedi-localita/:gln (binding degli input della rotta). */
  gln = input.required<string>();

  protected store = inject(GlnStore);
  private toasts = inject(Toasts);
  protected readonly info = GLN_TYPE_INFO;
  protected readonly ai = GLN_AI;

  protected g = computed(() => this.store.find(this.gln()));
  protected parent = computed(() => {
    const p = this.g()?.parent;
    return p ? this.store.find(p) : undefined;
  });
  protected children = computed(() => this.store.children(this.gln()));

  /** Il codice spiegato: prefisso dell'azienda, numero scelto da Codifico, cifra di controllo. */
  protected parts = computed(() => {
    const code = this.gln();
    const prefix = code.startsWith(GLN_PREFIX) ? GLN_PREFIX : code.slice(0, 7);
    return { prefix, number: code.slice(prefix.length, 12), check: code.slice(12) };
  });

  protected togglePublish(g: GlnRecord): void {
    if (g.registry === 'Non pubblicato') {
      this.store.publish(g.gln, () => this.toasts.show(`${g.name} è visibile ai partner sul registro GS1`));
      this.toasts.show('Pubblicazione avviata: tra poco sarà visibile ai partner', 'info');
    } else {
      this.store.unpublish(g.gln);
      this.toasts.show('Non più pubblicato: i partner non potranno verificarlo', 'info');
    }
  }

  protected toggleActive(g: GlnRecord): void {
    const active = g.status !== 'Attivo';
    this.store.setActive(g.gln, active);
    this.toasts.show(active ? `${g.name} è di nuovo attivo` : `${g.name} disattivato: il codice resta tuo`, active ? 'success' : 'info');
  }

  protected date(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
