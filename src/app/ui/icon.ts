import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'chevron-down'
  | 'search'
  | 'bell'
  | 'help'
  | 'settings'
  | 'user'
  | 'plus'
  | 'pencil'
  | 'close'
  | 'check-circle'
  | 'alert-circle'
  | 'shield-check'
  | 'bulb'
  | 'barcode'
  | 'qrcode'
  | 'phone'
  | 'globe'
  | 'download'
  | 'arrow-right'
  | 'link'
  | 'info'
  | 'lock';

/** Icone a tratto, disegnate in SVG inline: niente font di icone da caricare. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[style.width.px]': 'size()', '[style.height.px]': 'size()' },
  styles: `
    :host {
      display: inline-block;
      flex: none;
      line-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="stroke()"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name()) {
        @case ('chevron-down') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        }
        @case ('bell') {
          <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" />
          <path d="M10 20a2.2 2.2 0 0 0 4 0" />
        }
        @case ('help') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="M9.4 9.3a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.4-2.6 4" />
          <circle cx="12" cy="17.3" r=".6" fill="currentColor" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"
          />
        }
        @case ('user') {
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="12" cy="10" r="3.2" />
          <path d="M5.8 18.6a7 7 0 0 1 12.4 0" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('pencil') {
          <path d="M15.5 4.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
          <path d="m13.5 6.5 3 3" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6 6 18" />
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="m8 12.3 2.7 2.7L16.3 9.5" />
        }
        @case ('alert-circle') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 7.5v5.5" />
          <circle cx="12" cy="16.4" r=".6" fill="currentColor" />
        }
        @case ('shield-check') {
          <path d="M12 2.8 4.5 5.6v5.8c0 4.8 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5 7.5-9.8V5.6Z" />
          <path d="m8.6 11.8 2.4 2.4 4.5-4.6" />
        }
        @case ('bulb') {
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
        }
        @case ('barcode') {
          <path d="M3 5v14M6 5v14M8.5 5v14M12 5v14M14 5v14M17 5v14M19 5v14M21 5v14" />
        }
        @case ('qrcode') {
          <rect x="3.5" y="3.5" width="6" height="6" />
          <rect x="14.5" y="3.5" width="6" height="6" />
          <rect x="3.5" y="14.5" width="6" height="6" />
          <path d="M14.5 14.5h2v2h-2zM18.5 18.5h2v2h-2zM18.5 14.5h2M14.5 18.5v2" />
        }
        @case ('phone') {
          <rect x="6.5" y="2.5" width="11" height="19" rx="2.2" />
          <path d="M10.5 18.5h3" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="M2.5 12h19M12 2.5c2.6 2.8 3.8 6 3.8 9.5s-1.2 6.7-3.8 9.5c-2.6-2.8-3.8-6-3.8-9.5S9.4 5.3 12 2.5Z" />
        }
        @case ('download') {
          <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('link') {
          <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
          <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
        }
        @case ('lock') {
          <rect x="5" y="10.5" width="14" height="10" rx="2" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        }
        @case ('info') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 11v5.5" />
          <circle cx="12" cy="7.6" r=".6" fill="currentColor" />
        }
      }
    </svg>
  `,
})
export class Icon {
  name = input.required<IconName>();
  size = input(18);
  stroke = input(1.6);
}
