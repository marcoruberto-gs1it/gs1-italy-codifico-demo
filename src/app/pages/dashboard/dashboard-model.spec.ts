import { TestBed } from '@angular/core/testing';
import { isValidGtin } from '../../core/gs1';
import { DemoStore } from '../../core/demo-store';
import { DashboardModel } from './dashboard-model';

/** I numeri della dashboard devono tornare fra card, tab e tooltip in tutti gli scenari. */
describe('DashboardModel', () => {
  let model: DashboardModel;
  let store: DemoStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [DashboardModel] });
    model = TestBed.inject(DashboardModel);
    store = TestBed.inject(DemoStore);
    store.reset();
  });

  it('scenario B: i numeri del brief', () => {
    model.scenarioId.set('b');
    const dl = model.dl();
    expect(dl.scope).toBe(161);
    expect(dl.withDl).toBe(42);
    expect(dl.without).toBe(119);
    expect(Math.round(dl.coverage * 100)).toBe(26);
    expect(dl.contents.map((c) => c.count)).toEqual([14, 9, 6]);
    expect(model.glnSummary().byType.map((t) => t.count)).toEqual([1, 6, 2]);
    expect(model.glnSummary().published).toBe(7);
  });

  it('con DL + senza DL = perimetro, e il perimetro è dentro il totale', () => {
    for (const id of ['a', 'b', 'c'] as const) {
      model.scenarioId.set(id);
      const dl = model.dl();
      const p = model.products();
      expect(dl.withDl + dl.without).toBe(dl.scope);
      expect(dl.scope + p.drafts).toBe(p.total);
    }
  });

  it('i prefissi contano gli stessi codici di card e GLN', () => {
    model.scenarioId.set('b');
    const used = (use: 'gtin' | 'gln') =>
      model.prefixes().filter((p) => p.use === use).reduce((s, p) => s + p.used, 0);
    expect(used('gtin')).toBe(model.products().total);
    expect(used('gln')).toBe(model.glnSummary().total);
  });

  it('i codici sono validi e unici', () => {
    model.scenarioId.set('b');
    const codes = [...model.catalog().map((c) => c.gtin), ...model.glns().map((g) => g.gln)];
    expect(codes.every(isValidGtin)).toBe(true);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('un link aggiunto a un prodotto demo sposta il conteggio', () => {
    model.scenarioId.set('b');
    const pasta = model.finalized().find((p) => p.demo && p.linkCount === 0)!;
    store.select(pasta.gtin);
    store.addLink({ linkType: 'allergenInfo', url: 'https://brand.example/allergeni', lang: 'it' });
    expect(model.dl().withDl).toBe(43);
    expect(model.dl().contents[1].count).toBe(10);
  });

  it('completezza: stesso totale dei prodotti, dal meno compilato', () => {
    for (const id of ['a', 'b'] as const) {
      model.scenarioId.set(id);
      const attrs = model.attributes();
      expect(attrs.every((a) => a.total === model.products().total && a.filled <= a.total)).toBe(true);
      expect(attrs.map((a) => a.share)).toEqual([...attrs.map((a) => a.share)].sort((x, y) => x - y));
    }
  });

  it('richieste: le modifiche riguardano prodotti del catalogo', () => {
    model.scenarioId.set('b');
    const gtins = new Set(model.catalog().map((c) => c.gtin));
    expect(model.changeRequests().every((r) => gtins.has(r.gtin))).toBe(true);
    expect(model.requests().total).toBe(4);
    expect(model.requests().toComplete).toBe(1);
  });

  it('scenario A: nessun prodotto finalizzato', () => {
    model.scenarioId.set('a');
    expect(model.dl().scope).toBe(0);
    expect(model.products().drafts).toBe(model.products().total);
    expect(model.stats()).toBeNull();
  });

  it('scenario C: il prodotto più letto ha il Digital Link', () => {
    model.scenarioId.set('c');
    const s = model.stats()!;
    const top = model.catalog().find((p) => p.gtin === s.topGtin)!;
    expect(top.linkCount).toBeGreaterThan(0);
    expect(s.daily).toHaveLength(30);
    expect(s.daily.reduce((a, b) => a + b, 0)).toBe(s.total);
    expect(s.topScans).toBeLessThanOrEqual(s.total);
    expect(s.byContent.reduce((a, c) => a + c.value, 0)).toBe(s.total);
  });
});
