import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { qrCode } from '../../../core/barcode/symbols';
import { DigitalLinkEntry, GeneratedLink } from '../../../core/demo-data';
import { DemoStore, isActive } from '../../../core/demo-store';
import { digitalLinkUri } from '../../../core/gs1';
import { checkReachability } from '../../../core/resolver';
import { languageLabel, linkTypeLabel } from '../../../core/vocabulary';
import { Icon } from '../../../ui/icon';
import { SymbolView } from '../../../ui/symbol-view';
import { Toasts } from '../../../ui/toast';
import { TutorialLinks, TutorialModal } from '../../../ui/tutorial';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import { LinkDialog } from '../dialogs/link-dialog';
import { ScanPreview } from '../previews/scan-preview';

/**
 * Tab "Digital Link" (specifica tecnica v2.4, §4.1), visibile solo sui prodotti finalizzati.
 *
 * - Senza link dell'azienda: lo stato vuoto con "Aggiungi Link" (Figma, Frame 14) e, sui vini
 *   Brindo, i link delle annate generati dal servizio.
 * - Con almeno un link: l'URL Base generato dal GTIN, il QR di anteprima, la Destinazione
 *   Principale e la tabella (Tipologia, URL, Lingua, Attivo, Modifica/Disattiva).
 * - I link Brindo stanno in tabella con "Generato automaticamente dal servizio Brindo", senza azioni.
 * - Disattivare è una disattivazione logica: il link resta visibile e si può riattivare.
 */
@Component({
  selector: 'app-digital-link-tab',
  imports: [NgTemplateOutlet, RouterLink, Icon, SymbolView, LinkDialog, ConfirmDialog, ScanPreview, TutorialLinks, TutorialModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './digital-link-tab.html',
  styleUrl: './digital-link-tab.css',
})
export class DigitalLinkTab {
  protected store = inject(DemoStore);
  private toasts = inject(Toasts);

  protected readonly baseUri = computed(() => digitalLinkUri({ gtin: this.store.product().gtin }));
  protected readonly qr = computed(() => qrCode(this.baseUri()));
  protected readonly typeLabel = linkTypeLabel;
  protected readonly langLabel = languageLabel;
  protected readonly isActive = isActive;

  constructor() {
    // Aperta la tab, la novità è scoperta: via l'etichetta "Nuovo".
    afterNextRender(() => this.store.markDiscovery('tabSeen'));
  }

  /** I link generati da Brindo, uno per annata (/22/{variante}). */
  protected readonly brindoRows = computed<GeneratedLink[]>(() => this.store.generated().filter((g) => g.service === 'Brindo'));

  /** null = chiuso, 'new' = nuovo link, altrimenti il link in modifica. */
  protected editing = signal<DigitalLinkEntry | 'new' | null>(null);
  protected deactivating = signal<DigitalLinkEntry | null>(null);
  protected previewOpen = signal(false);
  protected tutorialOpen = signal(false);
  /** Id dell'ultima riga toccata, per evidenziarla un istante. */
  protected flashId = signal<string | null>(null);

  /** Destinazione Principale: solo i link attivi dell'azienda. */
  protected defaultOptions = computed(() =>
    this.store.activeLinks().map((l) => ({ id: l.id, label: `${linkTypeLabel(l.linkType)} - ${languageLabel(l.lang)}` })),
  );

  /** Verifica (simulata) di raggiungibilità della pagina di destinazione. */
  protected reachable(url: string): boolean {
    return checkReachability(url).reachable;
  }

  /**
   * Dopo il salvataggio, la verifica di raggiungibilità (specifica §4.2): se la pagina risponde
   * con errore compare l'avviso "Risorsa non disponibile", ma il link resta salvato.
   */
  protected onSaved(entry: DigitalLinkEntry, isNew: boolean): void {
    this.editing.set(null);
    this.flash(entry.id);
    const check = checkReachability(entry.url);
    if (!check.reachable) {
      this.toasts.show(
        `${isNew ? 'Link aggiunto' : 'Link aggiornato'}. Risorsa non disponibile: la pagina risponde con errore ${check.status}. Controlla l’indirizzo.`,
        'warning',
      );
      return;
    }
    this.toasts.show(isNew ? 'Link aggiunto al GS1 Digital Link' : 'Link aggiornato');
  }

  protected confirmDeactivate(): void {
    const link = this.deactivating();
    if (!link) return;
    this.store.setLinkActive(link.id, false);
    this.deactivating.set(null);
    this.flash(link.id);
    this.toasts.show('Link disattivato: resta in tabella e puoi riattivarlo');
  }

  /** Riattiva un link, se nel frattempo non ne è stato attivato un altro con stessa tipologia e lingua. */
  protected reactivate(link: DigitalLinkEntry): void {
    if (this.store.duplicateOf(link, link.id)) {
      this.toasts.show(
        `Esiste già un link attivo “${linkTypeLabel(link.linkType)}” in ${languageLabel(link.lang).toLowerCase()}: disattiva quello prima di riattivare questo.`,
        'info',
      );
      return;
    }
    this.store.setLinkActive(link.id, true);
    this.flash(link.id);
    this.toasts.show('Link riattivato');
  }

  protected setDefault(id: string): void {
    this.store.setDefaultLink(id);
    this.flash(id);
    this.toasts.show('Destinazione Principale aggiornata');
  }

  private flash(id: string): void {
    this.flashId.set(id);
    setTimeout(() => this.flashId.update((v) => (v === id ? null : v)), 1600);
  }
}
