import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './shell/app-header';
import { ToastHost } from './ui/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader, ToastHost],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header />
    <main>
      <router-outlet />
    </main>
    <app-toasts />
  `,
})
export class App {}
