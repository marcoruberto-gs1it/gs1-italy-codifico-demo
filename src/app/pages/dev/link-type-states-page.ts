import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LINK_TYPE_OPTIONS } from '../../core/vocabulary';
import { LinkTypeCombobox } from '../../ui/link-type-combobox';

/**
 * Catalogo degli stati del selettore "Tipologia" (l'equivalente di uno Storybook): una scheda
 * per stato, da controllare a occhio su desktop e a 375 px. La route esiste solo in sviluppo
 * (ng serve), non nella build pubblicata: /stati/tipologia-link.
 */
@Component({
  selector: 'app-link-type-states-page',
  imports: [LinkTypeCombobox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      max-width: 720px;
      margin: 0 auto;
      padding: 32px 16px 120px;
    }
    h1 {
      color: var(--gs1-blue-text);
      font-size: 22px;
      margin-bottom: 6px;
    }
    .intro {
      color: #5d6166;
      margin-bottom: 28px;
    }
    section {
      background: #fafafa;
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
      padding: 20px 22px 24px;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--gs1-blue);
      margin-bottom: 14px;
    }
    .open-story {
      min-height: 560px;
    }
  `,
  template: `
    <h1>Selettore «Tipologia»: stati</h1>
    <p class="intro">
      Pagina di sviluppo, non pubblicata. Valore corrente di ogni scheda tra parentesi.
    </p>

    <section>
      <h2>Vuoto ({{ empty() ?? 'nessuno' }})</h2>
      <app-link-type-combobox [options]="options" [(value)]="empty" [required]="true" />
    </section>

    <section>
      <h2>Selezionato ({{ chosen() }})</h2>
      <app-link-type-combobox [options]="options" [(value)]="chosen" />
    </section>

    <section>
      <h2>Valore deprecato su un link esistente ({{ deprecated() }})</h2>
      <app-link-type-combobox [options]="options" [(value)]="deprecated" />
    </section>

    <section>
      <h2>Errore di validazione</h2>
      <app-link-type-combobox
        [options]="options"
        [(value)]="invalid"
        [required]="true"
        [invalid]="true"
      />
    </section>

    <section>
      <h2>Disabilitato</h2>
      <app-link-type-combobox [options]="options" [value]="'gs1:pip'" [disabled]="true" />
    </section>

    <section class="open-story">
      <h2>Lista aperta ({{ opened() }})</h2>
      <app-link-type-combobox [options]="options" [(value)]="opened" [open]="true" />
    </section>
  `,
})
export class LinkTypeStatesPage {
  protected readonly options = LINK_TYPE_OPTIONS;
  protected empty = signal<string | null>(null);
  protected chosen = signal<string | null>('gs1:allergenInfo');
  protected deprecated = signal<string | null>('gs1:productSustainabilityInfo');
  protected invalid = signal<string | null>(null);
  protected opened = signal<string | null>('gs1:nutritionalInfo');
}
