import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { Icon } from './icon';
import { Modal } from './modal';

/**
 * Risorse per imparare il GS1 Digital Link: il video tutorial (registrato dalla demo stessa)
 * e la guida rapida in PDF, entrambi in public/.
 */
export const TUTORIAL = {
  video: 'tutorial/tutorial-gs1-digital-link.mp4',
  /** Sottotitoli in italiano (WebVTT), attivi per default e disattivabili dal player. */
  subtitles: 'tutorial/tutorial-gs1-digital-link.it.vtt',
  poster: 'tutorial/tutorial-poster.jpg',
  guide: 'guida/guida-gs1-digital-link.pdf',
  guideSize: '0,9 MB',
  guideName: 'Guida GS1 Digital Link - Codifico+.pdf',
} as const;

/** Link "Guarda il video tutorial · Scarica la guida PDF", da mettere vicino alla funzione. */
@Component({
  selector: 'app-tutorial-links',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 18px;
      font-size: 13px;
    }
    a,
    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      border: 0;
      background: none;
      color: var(--gs1-link);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
    }
    a:hover,
    button:hover {
      color: var(--gs1-blue);
      text-decoration: underline;
    }
    .play {
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--gs1-orange);
      color: #fff;
      font-size: 8px;
      padding-left: 2px;
    }
  `,
  template: `
    <button type="button" (click)="watch.emit()">
      <span class="play" aria-hidden="true">▶</span> Guarda il video tutorial
    </button>
    <a [href]="t.guide" [attr.download]="t.guideName">
      <app-icon name="download" [size]="16" [stroke]="2" /> Scarica la guida PDF
    </a>
  `,
})
export class TutorialLinks {
  watch = output<void>();
  protected readonly t = TUTORIAL;
}

/** Il video tutorial in una finestra modale. */
@Component({
  selector: 'app-tutorial-modal',
  imports: [Modal, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    app-modal {
      --modal-width: 1000px;
    }
    video {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #0f2340;
    }
    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 14px;
      font-size: 13px;
      color: var(--muted);
    }
    .foot a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }
  `,
  template: `
    <app-modal title="Video tutorial: il GS1 Digital Link in Codifico+" (closed)="closed.emit()">
      <video [src]="t.video" [poster]="t.poster" controls autoplay playsinline data-autofocus>
        <track kind="subtitles" srclang="it" label="Italiano" [src]="t.subtitles" default />
        Il tuo browser non riproduce il video: <a [href]="t.video">scaricalo qui</a>.
      </video>
      <div class="foot">
        <span>Dall’aggiunta del primo link al download del QR code</span>
        <a [href]="t.guide" [attr.download]="t.guideName">
          <app-icon name="download" [size]="16" [stroke]="2" /> Scarica la guida PDF ({{ t.guideSize }})
        </a>
      </div>
    </app-modal>
  `,
})
export class TutorialModal {
  closed = output<void>();
  protected readonly t = TUTORIAL;
}
