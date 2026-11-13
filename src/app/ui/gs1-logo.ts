import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Logo ufficiale GS1 Italy (dalle linee guida del marchio), con lo sfondo reso trasparente
 * e ridimensionato per lo schermo: public/gs1-italy-logo.png.
 */
@Component({
  selector: 'app-gs1-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }
    img {
      height: 100%;
      width: auto;
    }
  `,
  template: `<img src="gs1-italy-logo.png" alt="GS1 Italy" width="258" height="180" />`,
})
export class Gs1Logo {}
