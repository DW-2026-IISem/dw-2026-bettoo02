import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { ClientsPage } from './features/clients/pages/clients-page';
export const routes: Routes = [
  {
    path: 'dashboard',
    component: Dashboard,
  },

  {
    path: 'clients',
    component: ClientsPage,
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },

];