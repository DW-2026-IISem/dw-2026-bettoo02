import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { ClientsPage } from './features/clients/pages/clients-page';
import { ProductTypesPage } from './features/product-types/pages/product-types-page';
import { PropietariosPage } from './features/propietarios/pages/propietarios-page';
import { InmueblesPage } from './features/inmuebles/pages/inmuebles-page';
import { ProductsPage } from './features/products/pages/products-page';
import { ContratosPage } from './features/contratos/pages/contratos-page';
import { SalesPage } from './features/sales/pages/sales-page';
import { CobrosPage } from './features/cobros/pages/cobros-page';
 
export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'clients', component: ClientsPage },
  { path: 'propietarios', component: PropietariosPage },
  { path: 'inmuebles', component: InmueblesPage },
  { path: 'product-types', component: ProductTypesPage },
  { path: 'products', component: ProductsPage },
  { path: 'contratos', component: ContratosPage },
  { path: 'sales', component: SalesPage },
   { path: 'cobros', component: CobrosPage },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];