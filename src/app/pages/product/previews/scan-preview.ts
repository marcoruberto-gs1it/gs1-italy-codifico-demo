import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';
import { qrCode } from '../../../core/barcode/symbols';
import { DemoStore } from '../../../core/demo-store';
import { GS1_RESOLVER_HOST, digitalLinkUri } from '../../../core/gs1';
import { linkset, resolve } from '../../../core/resolver';
import { acceptLanguageHeader, languageLabel, linkTypeLabel } from '../../../core/vocabulary';

const PHONE_LOCALES = ['it-IT', 'en-GB', 'en-US', 'fr-FR', 'de-DE', 'es-ES'];
import { Icon } from '../../../ui/icon';
import { Modal } from '../../../ui/modal';
import { SymbolView } from '../../../ui/symbol-view';
import { ProductImage } from '../../../ui/product-image';

/**
 * Anteprima della scansione: "controlla esattamente cosa i consumatori vedranno".
 * Si sceglie la lingua preferita del browser (Accept-Language) e, volendo, una tipologia di link; il resolver simulato
 * mostra dove finisce il consumatore e perché. Per chi integra, c'è anche il linkset JSON.
 */
@Component({
  selector: 'app-scan-preview',
  imports: [Modal, Icon, SymbolView, ProductImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scan-preview.html',
  styleUrl: './scan-preview.css',
})
export class ScanPreview {
  closed = output<void>();

  protected store = inject(DemoStore);
  /**
   * Lingue preferite del browser da simulare: impostazioni regionali tipiche (come le invia davvero un
   * browser in Accept-Language) più quelle presenti nei link, per provare ogni regola.
   */
  protected languages = computed(() => {
    const codes = [...PHONE_LOCALES, ...this.store.resolvableLinks().map((l) => l.lang)];
    return [...new Set(codes)].map((code) => ({ code, label: languageLabel(code) }));
  });
  protected acceptLanguage = computed(() => acceptLanguageHeader(this.lang()));
  protected readonly typeLabel = linkTypeLabel;
  protected readonly langLabel = languageLabel;
  protected readonly resolverHost = GS1_RESOLVER_HOST;
  protected readonly baseUri = computed(() => digitalLinkUri({ gtin: this.store.product().gtin }));
  protected readonly qr = computed(() => qrCode(this.baseUri()));

  protected lang = signal('it-IT');
  /** '' = scansione normale (nessun linkType), 'linkset' = elenco completo. */
  protected requested = signal('');
  private screen = viewChild<ElementRef<HTMLElement>>('screen');

  /** Tipologie presenti nei link, per il menu "Cosa chiede l'app". */
  protected availableTypes = computed(() => [...new Set(this.store.resolvableLinks().map((l) => l.linkType))]);

  protected requestUri = computed(() => {
    const r = this.requested();
    return r ? `${this.baseUri()}?linkType=${r === 'linkset' ? 'linkset' : `gs1:${r}`}` : this.baseUri();
  });

  protected resolution = computed(() =>
    resolve(this.store.resolvableLinks(), this.store.defaultLink(), this.lang(), this.requested() || undefined),
  );

  protected linksetJson = computed(() =>
    JSON.stringify(linkset(this.baseUri(), this.store.resolvableLinks(), this.store.defaultLink()), null, 2),
  );

  protected destinationHost = computed(() => {
    const url = this.resolution().link?.url;
    if (!url) return this.resolverHost;
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  });

  /** Ogni cambio di parametri "riscansiona": lo schermo del telefono si ricarica. */
  protected rescan(): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.screen()?.nativeElement.animate(
      [
        { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 450, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    );
  }

  protected setLang(code: string): void {
    this.lang.set(code);
    this.rescan();
  }

  protected setRequested(value: string): void {
    this.requested.set(value);
    this.rescan();
  }
}
