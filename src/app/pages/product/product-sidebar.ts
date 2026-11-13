import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DemoStore } from '../../core/demo-store';
import { Icon } from '../../ui/icon';
import { Toasts } from '../../ui/toast';
import { RegistryPreview } from './previews/registry-preview';

/** Colonna destra della scheda: completamento, GS1 Registry Platform e stato del GTIN. */
@Component({
  selector: 'app-product-sidebar',
  imports: [Icon, RegistryPreview],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './product-sidebar.css',
  template: `
    @if (!store.finalized()) {
      <section class="card side-card completion">
        <h2 class="card-title">Completamento prodotto</h2>
        <h3>Prodotto in bozza</h3>
        <p>Finalizza il prodotto per pubblicarne l’identità digitale sul GS1 Registry Platform.</p>
        <p>Dopo la finalizzazione potrai anche creare il GS1 Digital Link e generare il QR code.</p>
      </section>
    } @else {
    <section class="card side-card completion">
      <h2 class="card-title">Completamento prodotto</h2>
      <app-icon name="shield-check" [size]="66" [stroke]="1.5" class="shield" />
      <h3>Identità digitale del prodotto completata</h3>
      <p>Complimenti! Hai completato con successo la descrizione del GTIN del tuo prodotto e hai creato la sua identità digitale.</p>
      <p>L’identità digitale dei tuoi prodotti viene pubblicata sul Registro internazionale di GS1 (GS1 Registry Platform).</p>
      <p>Ricorda che usare attributi di qualità e dati corretti nella creazione dell’identità digitale dei tuoi prodotti aumenta la fiducia dei tuoi clienti.</p>
      <button type="button" class="btn btn-primary" (click)="previewOpen.set(true)">Mostra anteprima</button>
    </section>
    }

    <section class="card side-card registry">
      <p>
        Tramite il GS1 Registry Platform, il registro internazionale di GS1, retailer, marketplace e clienti finali possono
        consultare l’<a href="#" (click)="$event.preventDefault(); previewOpen.set(true)">identità digitale del tuo prodotto</a>.
      </p>
      <p>
        Ricorda che le identità digitali dei tuoi prodotti, ovvero quei prodotti che riportano tutti e 7 gli attributi richiesti,
        sono pubblicate unicamente su questa piattaforma e che occorre sempre condividere le informazioni di prodotto con i tuoi
        partner commerciali.
      </p>
      <p>
        La consultazione del GS1 Registry Platform viene fatta tramite il tool
        <a href="https://www.gs1.org/services/verified-by-gs1" target="_blank" rel="noopener">Verified by GS1</a>.
      </p>
      <p>
        Per saperne di più, consulta la <a href="https://gs1it.org" target="_blank" rel="noopener">pagina</a> del sito di GS1 Italy.
      </p>
    </section>

    <section class="card side-card status">
      <h2 class="card-title">Stato GTIN</h2>
      <p>
        Il GTIN del prodotto finalizzato assume automaticamente lo stato "attivo". Lo stato "attivo" viene attribuito al prodotto
        attualmente sul mercato. Qualora il tuo articolo non fosse più in produzione o in vendita, puoi disattivare il GTIN
      </p>
      <p class="tip">
        <app-icon name="bulb" [size]="15" class="bulb" />
        <span>La gestione dello stato del GTIN è un’informazione importante per tutto il business. Ricordati di aggiornare
        puntualmente lo stato dei GTIN dei prodotti che commercializzi.</span>
      </p>
      <button
        type="button"
        class="switch"
        role="switch"
        [attr.aria-checked]="store.gtinActive()"
        [attr.aria-label]="store.gtinActive() ? 'GTIN attivo: disattiva' : 'GTIN non attivo: attiva'"
        (click)="toggleGtin()"
      >
        <span class="knob"></span>
        <span class="tick" aria-hidden="true">✓</span>
      </button>
      <span class="switch-label">{{ store.gtinActive() ? 'Attivo' : 'Non attivo' }}</span>
    </section>

    @if (previewOpen()) {
      <app-registry-preview (closed)="previewOpen.set(false)" />
    }
  `,
})
export class ProductSidebar {
  protected store = inject(DemoStore);
  private toasts = inject(Toasts);
  protected previewOpen = signal(false);

  protected toggleGtin(): void {
    const active = !this.store.gtinActive();
    this.store.setGtinActive(active);
    this.toasts.show(active ? 'GTIN attivato' : 'GTIN disattivato', active ? 'success' : 'info');
  }
}
