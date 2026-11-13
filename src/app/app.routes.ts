import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { MAIN_PRODUCT } from './core/demo-data';
import { DemoStore } from './core/demo-store';

/**
 * Prima di aprire una scheda prodotto imposta il prodotto corrente nello store, così tutte le
 * tab lavorano subito sul GTIN giusto. Un GTIN che non è nella demo riporta all'elenco.
 */
const selectProductGuard: CanActivateFn = (route) => {
  const store = inject(DemoStore);
  return store.select(route.paramMap.get('gtin') ?? '') || inject(Router).parseUrl('/prodotti');
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Benvenuto in Codifico · Codifico+',
    loadComponent: () => import('./pages/dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'prodotti',
    title: 'Prodotti a peso fisso · Codifico+',
    loadComponent: () => import('./pages/products/products-page').then((m) => m.ProductsPage),
  },
  { path: 'prodotti/:gtin', pathMatch: 'full', redirectTo: 'prodotti/:gtin/base' },
  {
    path: 'prodotti/:gtin/:tab',
    title: 'Scheda prodotto · Codifico+',
    canActivate: [selectProductGuard],
    loadComponent: () => import('./pages/product/product-page').then((m) => m.ProductPage),
  },
  { path: '**', redirectTo: '' },
];

