import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GLN_AI, GLN_PREFIX, GLN_ROLES, GLN_TYPE_INFO, GLN_TYPES, GlnAi, GlnRole, GlnType } from '../../core/gln-data';
import { GlnDraft, GlnStore } from '../../core/gln-store';
import { Icon } from '../../ui/icon';
import { Toasts } from '../../ui/toast';

type Field = 'type' | 'name' | 'street' | 'zip' | 'city' | 'province';
type Mode = 'new' | 'draft' | 'active';

const COUNTRIES = ['Italia', 'Austria', 'Francia', 'Germania', 'Regno Unito', 'Spagna', 'Stati Uniti', 'Svizzera'];

/**
 * Nuova sede o località, e modifica di una esistente. Al posto del modulo di Codifico+ di oggi:
 * prima si sceglie cosa identificare (con esempi), poi compaiono solo i campi utili a quel
 * tipo; il codice lo assegna Codifico, senza scriverlo a mano; una sola azione principale.
 */
@Component({
  selector: 'app-place-form-page',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-form-page.html',
  styleUrls: ['../product/product-page.css', './place-page.css', './place-form-page.css'],
})
export class PlaceFormPage {
  /** Assente per "Nuova sede o località"; dalla rotta /sedi-localita/:gln/modifica. */
  gln = input<string>();

  private store = inject(GlnStore);
  private router = inject(Router);
  private toasts = inject(Toasts);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private injector = inject(Injector);

  protected readonly info = GLN_TYPE_INFO;
  protected readonly types = GLN_TYPES;
  /** I tipi raggruppati per l'AI che identifica il GLN. */
  protected readonly families = (['417', '414'] as GlnAi[]).map((ai) => ({
    ai,
    ...GLN_AI[ai],
    types: GLN_TYPES.filter((t) => GLN_TYPE_INFO[t].ai === ai),
  }));
  protected readonly roles = GLN_ROLES;
  protected readonly countries = COUNTRIES;
  protected readonly prefix = GLN_PREFIX;

  protected existing = computed(() => (this.gln() ? this.store.find(this.gln()!) : undefined));
  protected mode = computed<Mode>(() => {
    const g = this.existing();
    return !g ? 'new' : g.status === 'Bozza' ? 'draft' : 'active';
  });
  /** Il tipo si sceglie alla creazione, in bozza o se è ancora da specificare. */
  protected typeEditable = computed(() => this.mode() !== 'active' || this.existing()?.type === 'Da specificare');

  protected type = signal<GlnType | null>(null);
  protected name = signal('');
  protected parent = signal('');
  protected street = signal('');
  protected zip = signal('');
  protected city = signal('');
  protected province = signal('');
  protected country = signal('Italia');
  protected selectedRoles = signal<GlnRole[]>([]);
  protected publish = signal(true);
  protected submitted = signal(false);

  /** Possibili "Fa parte di": l'azienda e i luoghi già attivi. */
  protected parents = computed(() =>
    this.store.all().filter((g) => g.gln !== this.gln() && g.status !== 'Bozza' && (g.type === 'Azienda' || g.type === 'Luogo fisso')),
  );

  protected code = computed(() => this.existing()?.gln ?? this.store.nextCode());
  protected addressRule = computed(() => (this.type() ? this.info[this.type()!].address : 'facoltativo'));

  constructor() {
    afterNextRender(
      () => {
        const g = this.existing();
        if (g) {
          this.type.set(g.type === 'Da specificare' ? null : g.type);
          this.name.set(g.name);
          this.parent.set(g.parent ?? '');
          this.street.set(g.address?.street ?? '');
          this.zip.set(g.address?.zip ?? '');
          this.city.set(g.address?.city ?? '');
          this.province.set(g.address?.province ?? '');
          this.country.set(g.address?.country ?? 'Italia');
          this.selectedRoles.set([...g.roles]);
        } else {
          this.parent.set(this.store.legalEntity()?.gln ?? '');
        }
      },
      { injector: this.injector },
    );
  }

  /* ---- Validazione ---- */

  /** Errori per campo; `full` = per attivare (per la bozza bastano tipo e nome). */
  private validate(full: boolean): Partial<Record<Field, string>> {
    // Senza tipo gli altri campi non sono ancora visibili: si segnala solo il tipo.
    if (!this.type()) return { type: 'Scegli che cosa vuoi identificare.' };
    const e: Partial<Record<Field, string>> = {};
    if (!this.name().trim()) e.name = 'Scrivi il nome con cui i partner riconoscono questo luogo.';
    // Stesso ordine dei campi nella pagina, così il riepilogo si legge dall'alto in basso.
    if (full && this.addressRule() === 'obbligatorio') {
      const italy = this.country() === 'Italia';
      if (!this.street().trim()) e.street = 'Indica via e numero civico.';
      if (italy && !/^\d{5}$/.test(this.zip().trim())) e.zip = 'Il CAP è di 5 cifre, ad esempio 20100.';
      if (!this.city().trim()) e.city = 'Indica il comune.';
      if (italy && !/^[A-Za-z]{2}$/.test(this.province().trim())) e.province = 'Usa la sigla di 2 lettere, ad esempio MI.';
    }
    return e;
  }

  protected errors = computed(() => (this.submitted() ? this.validate(this.wantsFull()) : {}));
  private wantsFull = signal(true);
  protected errorList = computed(() => Object.entries(this.errors()) as [Field, string][]);

  protected readonly fieldLabels: Record<Field, string> = {
    type: 'Tipo',
    name: 'Nome',
    street: 'Via e numero civico',
    zip: 'CAP',
    city: 'Comune',
    province: 'Provincia',
  };

  protected focusField(field: Field): void {
    const el = this.host.nativeElement.querySelector<HTMLElement>(field === 'type' ? 'input[name="gln-type"]' : `#f-${field}`);
    el?.focus();
  }

  protected toggleRole(role: GlnRole): void {
    this.selectedRoles.update((list) => (list.includes(role) ? list.filter((r) => r !== role) : [...list, role]));
  }

  private draft(): GlnDraft {
    const rule = this.addressRule();
    const hasAddress = rule !== 'non serve' && (this.street().trim() || this.city().trim());
    return {
      name: this.name().trim(),
      type: this.type()!,
      parent: this.type() === 'Azienda' ? undefined : this.parent() || undefined,
      address: hasAddress
        ? {
            street: this.street().trim(),
            zip: this.zip().trim(),
            city: this.city().trim(),
            province: this.province().trim().toUpperCase(),
            country: this.country(),
          }
        : undefined,
      roles: this.selectedRoles(),
      otherIds: this.existing()?.otherIds ?? [],
    };
  }

  /** Azione principale: crea e attiva, attiva la bozza o salva le modifiche. */
  protected submit(): void {
    if (!this.check(true)) return;
    const mode = this.mode();
    if (mode === 'new') {
      const g = this.store.create(this.draft(), true, this.publish());
      this.done(g.gln, this.publish() ? `${g.name} creato e in pubblicazione sul registro GS1` : `${g.name} creato`);
    } else if (mode === 'draft') {
      const gln = this.gln()!;
      this.store.update(gln, this.draft());
      this.store.finalize(gln, this.publish());
      this.done(gln, `${this.name()} attivato`);
    } else {
      this.store.update(this.gln()!, this.draft());
      this.done(this.gln()!, 'Modifiche salvate');
    }
  }

  /** Azione secondaria: salva come bozza (bastano tipo e nome). */
  protected saveDraft(): void {
    if (!this.check(false)) return;
    if (this.mode() === 'new') {
      const g = this.store.create(this.draft(), false, false);
      this.done(g.gln, 'Bozza salvata: la ritrovi in Sedi e località');
    } else {
      this.store.update(this.gln()!, this.draft());
      this.done(this.gln()!, 'Bozza salvata');
    }
  }

  private check(full: boolean): boolean {
    this.wantsFull.set(full);
    this.submitted.set(true);
    if (Object.keys(this.validate(full)).length) {
      afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('#form-errors')?.focus(), {
        injector: this.injector,
      });
      return false;
    }
    return true;
  }

  private done(gln: string, message: string): void {
    this.toasts.show(message);
    void this.router.navigate(['/sedi-localita', gln]);
  }

  protected cancelLink = computed(() => (this.gln() ? ['/sedi-localita', this.gln()!] : ['/sedi-localita']));
}
