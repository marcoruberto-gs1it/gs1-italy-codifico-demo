import { TestBed } from '@angular/core/testing';
import { isValidGtin } from './gs1';
import { GLN_ROLES, GLN_TYPE_INFO } from './gln-data';
import { GlnStore, PUBLISH_DELAY_MS } from './gln-store';

describe('GlnStore', () => {
  let store: GlnStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(GlnStore);
    store.reset();
  });

  afterEach(() => vi.useRealTimers());

  it('i GLN di esempio sono validi e unici, con una sola azienda', () => {
    const codes = store.all().map((g) => g.gln);
    expect(codes.every(isValidGtin)).toBe(true);
    expect(new Set(codes).size).toBe(codes.length);
    expect(store.all().filter((g) => g.type === 'Azienda')).toHaveLength(1);
  });

  it('ogni tipo selezionabile è identificato da un AI GS1 del GLN (417 o 414)', () => {
    for (const g of store.all().filter((x) => x.type !== 'Da specificare')) {
      expect(['417', '414']).toContain(GLN_TYPE_INFO[g.type].ai);
    }
  });

  it('i ruoli sono AI di ruolo GS1 (410-416)', () => {
    const roleAis = GLN_ROLES.map((r) => r.ai as string);
    expect(roleAis).toEqual(['410', '411', '412', '413', '415', '416']);
    expect(store.all().every((g) => g.roles.every((r) => roleAis.includes(r)))).toBe(true);
  });

  it('i collegamenti "fa parte di" puntano a GLN esistenti', () => {
    const codes = new Set(store.all().map((g) => g.gln));
    expect(store.all().every((g) => !g.parent || codes.has(g.parent))).toBe(true);
  });

  it('il codice di un nuovo GLN è assegnato da Codifico: valido e libero', () => {
    const before = store.all().map((g) => g.gln);
    const g = store.create({ name: 'Magazzino di prova', type: 'Luogo fisso', roles: [], otherIds: [] }, false, false);
    expect(isValidGtin(g.gln)).toBe(true);
    expect(before).not.toContain(g.gln);
    expect(g.status).toBe('Bozza');
    expect(g.registry).toBe('Non pubblicato');
  });

  it('attivando con la pubblicazione il GLN passa da "In pubblicazione" a "Visibile ai partner"', () => {
    vi.useFakeTimers();
    const g = store.create({ name: 'Ufficio di prova', type: 'Reparto o funzione', roles: ['411'], otherIds: [] }, true, true);
    expect(store.find(g.gln)?.status).toBe('Attivo');
    expect(store.find(g.gln)?.registry).toBe('In pubblicazione');
    vi.advanceTimersByTime(PUBLISH_DELAY_MS);
    expect(store.find(g.gln)?.registry).toBe('Visibile ai partner');
  });

  it('togliere la pubblicazione prima della fine annulla il passaggio a visibile', () => {
    vi.useFakeTimers();
    const g = store.all().find((x) => x.registry === 'Non pubblicato' && x.status === 'Attivo')!;
    store.publish(g.gln);
    store.unpublish(g.gln);
    vi.advanceTimersByTime(PUBLISH_DELAY_MS);
    expect(store.find(g.gln)?.registry).toBe('Non pubblicato');
  });
});
