import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LINK_TYPE_OPTIONS } from '../core/vocabulary';
import { LinkTypeCombobox, highlightSegments } from './link-type-combobox';

@Component({
  imports: [LinkTypeCombobox],
  template: `
    <app-link-type-combobox
      [options]="options"
      [(value)]="value"
      [required]="true"
      [invalid]="invalid()"
      [disabled]="disabled()"
    />
    <button type="button" id="after">Campo successivo</button>
  `,
})
class Host {
  options = LINK_TYPE_OPTIONS;
  value = signal<string | null>(null);
  invalid = signal(false);
  disabled = signal(false);
}

describe('LinkTypeCombobox', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let root: HTMLElement;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const $ = <T extends Element = HTMLElement>(sel: string) =>
    root.querySelector<T & HTMLElement>(sel);
  const $$ = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
  const trigger = () => $<HTMLButtonElement>('button[role="combobox"]')!;
  const search = () => $<HTMLInputElement>('input[role="combobox"]');
  const key = async (el: HTMLElement, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    await settle();
    return event;
  };
  const type = async (text: string) => {
    const input = search()!;
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };
  const optionLabels = () => $$('[role="option"] .opt-label').map((el) => el.textContent!.trim());
  const activeOption = () =>
    document.getElementById(search()!.getAttribute('aria-activedescendant')!);

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    root = fixture.nativeElement;
    document.body.appendChild(root);
    await settle();
  });

  afterEach(() => root.remove());

  // 1. Selezione solo da tastiera, dall'apertura alla chiusura.
  it('si usa solo da tastiera: freccia giù apre, frecce/Home/Fine muovono, Invio seleziona', async () => {
    trigger().focus();
    await key(trigger(), 'ArrowDown');

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(search());
    expect(activeOption()?.textContent).toContain('Pagina informativa di prodotto');

    await key(search()!, 'ArrowDown');
    await key(search()!, 'ArrowDown');
    expect(activeOption()?.textContent).toContain('Passaporto Digitale di Prodotto');

    await key(search()!, 'End');
    expect(activeOption()).toBe($$('[role="option"]').at(-1));
    await key(search()!, 'Home');
    expect(activeOption()).toBe($$('[role="option"]')[0]);
    await key(search()!, 'ArrowUp'); // resta sulla prima: le intestazioni non sono opzioni
    expect(activeOption()).toBe($$('[role="option"]')[0]);

    await key(search()!, 'ArrowDown');
    const enter = await key(search()!, 'Enter');

    expect(enter.defaultPrevented).toBe(true); // non invia il modulo
    expect(host.value()).toBe('gs1:sustainabilityInfo');
    expect(search()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });

  it('Esc chiude senza cambiare valore, riporta il focus e non chiude la finestra modale', async () => {
    host.value.set('gs1:pip');
    await settle();
    const modalEscape = vi.fn((e: KeyboardEvent) => e.key);
    const onDocumentKey = (e: KeyboardEvent) => e.key === 'Escape' && modalEscape(e);
    document.addEventListener('keydown', onDocumentKey);

    trigger().click(); // Invio o Spazio sul pulsante arrivano come click
    await settle();
    await key(search()!, 'ArrowDown');
    await key(search()!, 'Escape');

    expect(host.value()).toBe('gs1:pip');
    expect(search()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(modalEscape).not.toHaveBeenCalled();
    document.removeEventListener('keydown', onDocumentKey);
  });

  it('Tab e il click fuori chiudono la lista', async () => {
    trigger().click();
    await settle();
    const tab = await key(search()!, 'Tab');
    expect(tab.defaultPrevented).toBe(false);
    expect(search()).toBeNull();

    trigger().click();
    await settle();
    $('#after')!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await settle();
    expect(search()).toBeNull();
  });

  it('collega titolo e descrizione di ogni opzione per gli screen reader', async () => {
    trigger().click();
    await settle();
    const listbox = $('[role="listbox"]')!;
    expect(trigger().getAttribute('aria-controls')).toBe(listbox.id);
    expect(search()!.getAttribute('aria-controls')).toBe(listbox.id);
    for (const option of $$('[role="option"]')) {
      const desc = document.getElementById(option.getAttribute('aria-describedby')!);
      expect(desc?.classList).toContain('opt-desc');
    }
    for (const group of $$('[role="group"]')) {
      expect(
        document.getElementById(group.getAttribute('aria-labelledby')!)?.textContent,
      ).toBeTruthy();
    }
  });

  // 2. Ricerca su titolo, descrizione e codice.
  it('cercando "allerg" trova solo gli allergeni, con il testo trovato in grassetto', async () => {
    trigger().click();
    await settle();
    await type('allerg');
    expect(optionLabels()).toEqual(['Informazioni sugli allergeni']);
    expect($('[role="option"] .opt-label b')?.textContent).toBe('allerg');
    expect(activeOption()?.textContent).toContain('Informazioni sugli allergeni');
  });

  it('cercando "pip" trova la pagina informativa del prodotto tramite il codice', async () => {
    trigger().click();
    await settle();
    await type('pip');
    expect(optionLabels()).toEqual(['Pagina informativa di prodotto']);
  });

  it('la ricerca ignora maiuscole e accenti e segnala quando non trova nulla', async () => {
    trigger().click();
    await settle();
    await type('SOSTENIBILITA');
    expect(optionLabels()).toContain('Informazioni su sostenibilità e riciclo');

    await type('zzzz');
    expect(optionLabels()).toEqual([]);
    expect($('.empty')?.textContent).toContain('Nessuna tipologia trovata');
    expect($$('.group-label')).toHaveLength(0);
  });

  // 3. Gruppi e valori deprecati.
  it('mostra "Più utilizzati" prima di "Tutti i tipi" e nasconde i valori deprecati', async () => {
    trigger().click();
    await settle();

    expect($$('.group-label').map((el) => el.textContent!.trim())).toEqual([
      'Più utilizzati',
      'Tutti i tipi',
    ]);
    const [popular, all] = $$('[role="group"]');
    const codes = (g: HTMLElement) =>
      Array.from(g.querySelectorAll('.opt-code')).map((el) => el.textContent);
    expect(codes(popular)).toEqual(LINK_TYPE_OPTIONS.filter((o) => o.popular).map((o) => o.code));

    const others = Array.from(all.querySelectorAll('.opt-label')).map((el) =>
      el.textContent!.trim(),
    );
    expect(others).toEqual([...others].sort((a, b) => a.localeCompare(b, 'it')));
    expect(root.textContent).not.toContain('gs1:productSustainabilityInfo');

    await type('ricette');
    expect($$('.group-label').map((el) => el.textContent!.trim())).toEqual(['Più utilizzati']);
  });

  // 4. Descrizione completa sotto il campo.
  it('dopo la selezione mostra sotto il campo la descrizione completa', async () => {
    expect($('.desc')).toBeNull();
    trigger().click();
    await settle();
    const option = $$('[role="option"]').find((o) => o.textContent!.includes('Storia e contesto'))!;
    option.click();
    await settle();

    const full = LINK_TYPE_OPTIONS.find((o) => o.code === 'gs1:backgroundInfo')!.description;
    expect(trigger().textContent).toContain('Storia e contesto');
    expect($('.desc')?.textContent?.trim()).toBe(full);
    expect(trigger().getAttribute('aria-describedby')).toContain($('.desc')!.id);
  });

  // 5. Valore deprecato su un link esistente.
  it('un valore deprecato mostra badge, avviso e il pulsante per passare al sostituto', async () => {
    host.value.set('gs1:productSustainabilityInfo');
    await settle();

    expect(trigger().querySelector('.badge')?.textContent).toBe('Deprecato');
    const warning = $('.deprecated')!;
    expect(warning.textContent).toContain('Questa tipologia non è più nello standard GS1.');
    expect(warning.textContent).toContain('Ti consigliamo di usare «Informazioni su sostenibilità e riciclo».');
    expect(trigger().getAttribute('aria-describedby')).toContain(warning.id);

    const use = warning.querySelector('button')!;
    expect(use.textContent?.trim()).toBe('Usa Informazioni su sostenibilità e riciclo');
    use.click();
    await settle();

    expect(host.value()).toBe('gs1:sustainabilityInfo');
    expect(trigger().querySelector('.badge')).toBeNull();
    expect($('.deprecated')).toBeNull();
  });

  it('senza sostituto l’avviso dice solo che la tipologia non è più nello standard', async () => {
    host.options = [
      {
        code: 'gs1:old',
        label: 'Vecchia',
        description: 'Non più usata.',
        popular: false,
        status: 'deprecated',
      },
    ];
    host.value.set('gs1:old');
    await settle();
    expect($('.deprecated')?.textContent?.trim()).toBe(
      'Questa tipologia non è più nello standard GS1.',
    );
    expect($('.deprecated button')).toBeNull();
  });

  it('mostra l’errore se il campo obbligatorio è vuoto al salvataggio', async () => {
    host.invalid.set(true);
    await settle();
    const error = $('.error')!;
    expect(error.textContent).toContain('Scegli una tipologia di link');
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    expect(trigger().getAttribute('aria-describedby')).toContain(error.id);
  });

  it('da disabilitato resta visibile ma non si apre', async () => {
    host.disabled.set(true);
    await settle();
    expect(trigger().disabled).toBe(true);
    await key(trigger(), 'ArrowDown');
    expect(search()).toBeNull();
  });
});

describe('highlightSegments', () => {
  it('ritrova il testo anche con accenti diversi', () => {
    expect(highlightSegments('Sostenibilità e riciclo', 'bilita')).toEqual([
      { text: 'Sosteni', match: false },
      { text: 'bilità', match: true },
      { text: ' e riciclo', match: false },
    ]);
  });
});
