import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DigitalLinkEntry } from '../../../core/demo-data';
import { DemoStore } from '../../../core/demo-store';
import { checkDestinationUrl } from '../../../core/resolver';
import {
  LANGUAGE_GROUPS,
  LINK_TYPE_OPTIONS,
  fromLinkTypeCode,
  languageLabel,
  linkTypeLabel,
  toLinkTypeCode,
} from '../../../core/vocabulary';
import { Icon } from '../../../ui/icon';
import { LinkTypeCombobox } from '../../../ui/link-type-combobox';
import { Modal } from '../../../ui/modal';

/**
 * "Aggiungi nuovo Link" / "Modifica Link" (Figma, Frame 15-16, 24-32, 62).
 * L'URL viene controllato mentre si scrive: spunta verde se valido, bordo rosso e "URL non
 * valido" se no. Salva resta spento finché il modulo non è completo e corretto.
 */
@Component({
  selector: 'app-link-dialog',
  imports: [Modal, Icon, LinkTypeCombobox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './link-dialog.css',
  template: `
    <app-modal [title]="link() ? 'Modifica Link' : 'Aggiungi nuovo Link'" (closed)="closed.emit()">
      <form (submit)="save($event)" novalidate>
        <label class="field-label" for="dl-url">URL di destinazione:</label>
        <div
          class="input-wrap"
          [class.invalid]="showError()"
          [class.valid]="urlCheck().valid && url().trim()"
        >
          <input
            id="dl-url"
            type="url"
            inputmode="url"
            autocomplete="url"
            spellcheck="false"
            [value]="url()"
            (input)="url.set($any($event.target).value)"
            (blur)="touched.set(true)"
            [attr.aria-invalid]="showError()"
            aria-describedby="dl-url-hint dl-url-error"
          />
          @if (url().trim()) {
            @if (urlCheck().valid) {
              <app-icon name="check-circle" [size]="22" [stroke]="1.4" class="state ok" />
            } @else if (showError()) {
              <app-icon name="alert-circle" [size]="22" [stroke]="1.6" class="state ko" />
            }
          }
        </div>
        <div class="hint-row">
          <span id="dl-url-hint" class="hint"
            >La pagina reale a cui il QR code reindirizzerà (non l’URL codificato)</span
          >
          @if (showError()) {
            <span id="dl-url-error" class="error" [title]="errorReason()">URL non valido</span>
          }
        </div>
        @if (showError()) {
          <p class="error-reason">{{ errorReason() }}</p>
        }

        <app-link-type-combobox
          class="type-field"
          [options]="typeOptions"
          [value]="typeCode()"
          (valueChange)="linkType.set($event ? fromCode($event) : '')"
          [required]="true"
        />

        <label class="field-label" for="dl-lang">Lingua:</label>
        <div class="select big">
          <select id="dl-lang" (change)="lang.set($any($event.target).value)">
            <optgroup label="Più usate">
              @for (l of langGroups.common; track l.code) {
                <option [value]="l.code" [selected]="l.code === lang()">
                  {{ l.label }} · {{ l.code }}
                </option>
              }
            </optgroup>
            <optgroup label="Tutte le lingue (tag BCP 47)">
              @for (l of langGroups.others; track l.code) {
                <option [value]="l.code" [selected]="l.code === lang()">
                  {{ l.label }} · {{ l.code }}
                </option>
              }
            </optgroup>
          </select>
        </div>
        @if (duplicate(); as who) {
          <p class="error-reason dup">
            @if (who === 'utente') {
              Esiste già un link “{{ typeLabel(linkType()) }}” in
              {{ langLabel(lang()).toLowerCase() }}: modifica quello oppure scegli un’altra lingua.
            } @else {
              Il link “{{ typeLabel(linkType()) }}” in {{ langLabel(lang()).toLowerCase() }} è
              generato da {{ who }} e non si può sostituire: scegli un’altra tipologia o lingua.
            }
          </p>
        }

        <div class="actions">
          <button type="submit" class="btn btn-primary btn-lg" [disabled]="!canSave()">
            Salva
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class LinkDialog {
  link = input<DigitalLinkEntry | null>(null);
  saved = output<DigitalLinkEntry>();
  closed = output<void>();

  private store = inject(DemoStore);

  protected readonly typeOptions = LINK_TYPE_OPTIONS;
  protected readonly fromCode = fromLinkTypeCode;
  protected readonly langGroups = LANGUAGE_GROUPS;
  protected readonly typeLabel = linkTypeLabel;
  protected readonly langLabel = languageLabel;

  protected url = signal('');
  /** Id della tipologia (es. "pip"); vuoto finché l'utente non sceglie. */
  protected linkType = signal('');
  protected lang = signal('it');
  protected touched = signal(false);

  protected urlCheck = computed(() => checkDestinationUrl(this.url()));
  protected typeCode = computed(() => (this.linkType() ? toLinkTypeCode(this.linkType()) : null));
  protected errorReason = computed(() => {
    const c = this.urlCheck();
    return c.valid ? '' : c.reason;
  });
  /** L'errore compare dopo che l'utente ha scritto un indirizzo "completo" o ha lasciato il campo. */
  protected showError = computed(() => {
    const v = this.url().trim();
    if (!v || this.urlCheck().valid) return false;
    return this.touched() || /^https?:\/\/[^/]+\.[a-z]{2,}/i.test(v);
  });
  /** Chi occupa già tipologia + lingua: un link dell'utente o uno generato da un servizio. */
  protected duplicate = computed(() =>
    !this.linkType()
      ? null
      : this.store.duplicateOf({ linkType: this.linkType(), lang: this.lang() }, this.link()?.id),
  );
  protected canSave = computed(
    () => !!this.url().trim() && this.urlCheck().valid && !!this.linkType() && !this.duplicate(),
  );

  ngOnInit(): void {
    const l = this.link();
    if (l) {
      this.url.set(l.url);
      this.linkType.set(l.linkType);
      this.lang.set(l.lang);
    }
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.touched.set(true);
    if (!this.canSave()) return;
    const input = { url: this.url().trim(), linkType: this.linkType(), lang: this.lang() };
    const current = this.link();
    if (current) {
      this.store.updateLink(current.id, input);
      this.saved.emit({ ...input, id: current.id });
    } else {
      this.saved.emit(this.store.addLink(input));
    }
  }
}
