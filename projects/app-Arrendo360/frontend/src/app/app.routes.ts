import { Routes } from '@angular/router';

import { Dashboard } from './features/dashboard/dashboard/dashboard'; // Ajusta si quedó en ./features/dashboard/dashboard/dashboard

export const routes: Routes = [

  {

    path: 'dashboard',

    component: Dashboard,

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