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
  | 'lock'
  | 'check'
  | 'copy'
  | 'book'
  | 'building'
  | 'map-pin'
  | 'users'
  | 'monitor'
  | 'truck'
  | 'clock'
  | 'minus-circle';

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
        @case ('check') {
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        }
        @case ('lock') {
          <rect x="5" y="10.5" width="14" height="10" rx="2" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        }
        @case ('copy') {
          <rect x="8.5" y="8.5" width="12" height="12" rx="1.8" />
          <path d="M15.5 8.5V5.3a1.8 1.8 0 0 0-1.8-1.8H5.3a1.8 1.8 0 0 0-1.8 1.8v8.4a1.8 1.8 0 0 0 1.8 1.8h3.2" />
        }
        @case ('book') {
          <path d="M4 5.5A2 2 0 0 1 6 3.5h5v16H6a2 2 0 0 0-2 2Z" />
          <path d="M20 5.5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2Z" />
        }
        @case ('building') {
          <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5V21" />
          <path d="M15 10h3.5A1.5 1.5 0 0 1 20 11.5V21M2.5 21h19" />
          <path d="M8 8h3M8 11.5h3M8 15h3" />
        }
        @case ('map-pin') {
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
          <circle cx="12" cy="10" r="2.4" />
        }
        @case ('users') {
          <circle cx="9" cy="8.5" r="3.2" />
          <path d="M3 19.5a6 6 0 0 1 12 0" />
          <path d="M16 5.6a3.2 3.2 0 0 1 0 5.8M18 14.2a6 6 0 0 1 3 5.3" />
        }
        @case ('monitor') {
          <rect x="3" y="4" width="18" height="12.5" rx="1.6" />
          <path d="M8.5 20.5h7M12 16.5v4" />
        }
        @case ('truck') {
          <path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3 3.2V16h-7" />
          <circle cx="6.5" cy="17.5" r="1.8" />
          <circle cx="17" cy="17.5" r="1.8" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 7v5.2l3.4 2" />
        }
        @case ('minus-circle') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="M8 12h8" />
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
