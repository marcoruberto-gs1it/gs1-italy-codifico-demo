import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoStore } from '../../../core/demo-store';

/**
 * Tab "Ecologicamente": l'etichetta ambientale dell'imballaggio (D.Lgs. 116/2020), con codifica
 * alfanumerica dei materiali secondo la Decisione 129/97/CE. Nel Figma è solo uno sfondo.
 */
@Component({
  selector: 'app-eco-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      animation: appear 0.35s var(--ease);
    }
    .block {
      padding: 26px 20px 30px;
    }
    .intro {
      max-width: 760px;
      margin-top: 14px;
      font-size: 14px;
    }
    table {
      width: 100%;
      margin-top: 24px;
      border-collapse: collapse;
      font-size: 14px;
    }
    th {
      padding: 0 12px 14px 0;
      border-bottom: 1px solid var(--rule);
      color: var(--muted);
      font-weight: 500;
      text-align: left;
      text-transform: uppercase;
      font-size: 13px;
      letter-spacing: 0.02em;
    }
    td {
      padding: 14px 12px 14px 0;
      border-bottom: 1px solid #edf0f2;
      color: var(--text-strong);
    }
    .code {
      display: inline-block;
      padding: 2px 8px;
      background: var(--url-box);
      color: var(--gs1-blue);
      font-weight: 600;
      font-size: 13px;
    }
    .note {
      margin-top: 18px;
      color: var(--muted);
      font-size: 13px;
    }
    @keyframes appear {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  `,
  template: `
    <section class="card block">
      <h2 class="card-title">Etichetta ambientale dell’imballaggio</h2>
      <p class="intro">
        Per ogni componente dell’imballaggio sono indicati il materiale, la sua codifica alfanumerica e come conferirlo nella
        raccolta differenziata.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Componente</th>
            <th scope="col">Materiale</th>
            <th scope="col">Codifica</th>
            <th scope="col">Raccolta</th>
          </tr>
        </thead>
        <tbody>
          @for (c of store.product().packaging; track c.component) {
            <tr>
              <td>{{ c.component }}</td>
              <td>{{ c.material }}</td>
              <td><span class="code">{{ c.code }}</span></td>
              <td>{{ c.disposal }}</td>
            </tr>
          }
        </tbody>
      </table>
      <p class="note">Verifica le disposizioni del tuo Comune.</p>
    </section>
  `,
})
export class EcoTab {
  protected store = inject(DemoStore);
}
