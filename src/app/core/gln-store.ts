import { Injectable, computed, effect, signal } from '@angular/core';
import { GlnRecord, SEED_GLNS, nextGln } from './gln-data';

const STORAGE_KEY = 'codifico-demo:gln:v1';
const INTRO_KEY = 'codifico-demo:gln:intro-chiusa';

/** Tempo simulato perché un GLN pubblicato diventi visibile ai partner sul registro. */
export const PUBLISH_DELAY_MS = 4000;

export type GlnDraft = Omit<GlnRecord, 'gln' | 'status' | 'registry' | 'created' | 'modified'>;

/**
 * Sedi e località della demo: elenco in sessionStorage, come lo stato dei prodotti, così le
 * modifiche sopravvivono al ricaricamento ma ogni presentazione riparte pulita.
 */
@Injectable({ providedIn: 'root' })
export class GlnStore {
  private readonly state = signal<GlnRecord[]>(load());
  readonly all = this.state.asReadonly();

  /** L'introduzione "Cosa sono e a cosa servono" è stata chiusa con "Ho capito". */
  readonly introClosed = signal(loadIntro());

  readonly legalEntity = computed(() => this.all().find((g) => g.type === 'Azienda') ?? null);

  constructor() {
    effect(() => save(STORAGE_KEY, this.state()));
    effect(() => save(INTRO_KEY, this.introClosed()));
  }

  find(gln: string): GlnRecord | undefined {
    return this.all().find((g) => g.gln === gln);
  }

  /** I GLN che fanno parte di questo (es. i luoghi dell'azienda). */
  children(gln: string): GlnRecord[] {
    return this.all().filter((g) => g.parent === gln);
  }

  /** Il prossimo codice libero: viene assegnato da Codifico, non scritto a mano. */
  nextCode(): string {
    return nextGln(this.all().map((g) => g.gln));
  }

  /** Crea un GLN: in bozza, oppure attivo (e, se richiesto, pubblicato sul registro). */
  create(draft: GlnDraft, finalize: boolean, publish: boolean): GlnRecord {
    const today = isoToday();
    const record: GlnRecord = {
      ...draft,
      gln: this.nextCode(),
      status: finalize ? 'Attivo' : 'Bozza',
      registry: 'Non pubblicato',
      created: today,
      modified: today,
    };
    this.state.update((list) => [record, ...list]);
    if (finalize && publish) this.publish(record.gln);
    return record;
  }

  update(gln: string, draft: GlnDraft): void {
    this.patch(gln, (g) => ({ ...g, ...draft, modified: isoToday() }));
  }

  finalize(gln: string, publish: boolean): void {
    this.patch(gln, (g) => ({ ...g, status: 'Attivo', modified: isoToday() }));
    if (publish) this.publish(gln);
  }

  setActive(gln: string, active: boolean): void {
    this.patch(gln, (g) => ({ ...g, status: active ? 'Attivo' : 'Non attivo', modified: isoToday() }));
  }

  /** Pubblica sul registro: prima "In pubblicazione", poi visibile ai partner (simulato). */
  publish(gln: string, onVisible?: () => void): void {
    this.patch(gln, (g) => ({ ...g, registry: 'In pubblicazione' }));
    setTimeout(() => {
      if (this.find(gln)?.registry !== 'In pubblicazione') return;
      this.patch(gln, (g) => ({ ...g, registry: 'Visibile ai partner' }));
      onVisible?.();
    }, PUBLISH_DELAY_MS);
  }

  unpublish(gln: string): void {
    this.patch(gln, (g) => ({ ...g, registry: 'Non pubblicato' }));
  }

  reset(): void {
    this.state.set(structuredClone(SEED_GLNS));
    this.introClosed.set(false);
  }

  private patch(gln: string, fn: (g: GlnRecord) => GlnRecord): void {
    this.state.update((list) => list.map((g) => (g.gln === gln ? fn(g) : g)));
  }
}

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function load(): GlnRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GlnRecord[];
  } catch {
    // Storage non disponibile o dati corrotti: si riparte dai dati di esempio.
  }
  return structuredClone(SEED_GLNS);
}

function loadIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === 'true';
  } catch {
    return false;
  }
}

function save(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Navigazione privata o quota piena: la demo funziona comunque, senza persistenza.
  }
}
