import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { ClientsPage } from './features/business/clients/pages/clients-page';
import { ProductTypesPage } from './features/business/product-types/pages/product-types-page';
import { PropietariosPage } from './features/business/propietarios/pages/propietarios-page';
import { InmueblesPage } from './features/business/inmuebles/pages/inmuebles-page';
import { ProductsPage } from './features/business/products/pages/products-page';
import { ContratosPage } from './features/business/contratos/pages/contratos-page';
import { SalesPage } from './features/business/sales/pages/sales-page';
import { CobrosPage } from './features/business/cobros/pages/cobros-page';
import { LiquidacionesPage } from './features/business/liquidaciones/pages/liquidaciones-page';
import { MantenimientoPage } from './features/business/mantenimiento/pages/mantenimiento-page';
import { LoginPage } from './features/auth/pages/login-page';
import { RbacPage } from './features/auth/pages/rbac-page';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'clients', component: ClientsPage, canActivate: [authGuard] },
  { path: 'propietarios', component: PropietariosPage, canActivate: [authGuard] },
  { path: 'inmuebles', component: InmueblesPage, canActivate: [authGuard] },
  { path: 'contratos', component: ContratosPage, canActivate: [authGuard] },
  { path: 'cobros', component: CobrosPage, canActivate: [authGuard] },
  { path: 'liquidaciones', component: LiquidacionesPage, canActivate: [authGuard] },
  { path: 'mantenimiento', component: MantenimientoPage, canActivate: [authGuard] },
  { path: 'product-types', component: ProductTypesPage, canActivate: [authGuard] },
  { path: 'products', component: ProductsPage, canActivate: [authGuard] },
  { path: 'sales', component: SalesPage, canActivate: [authGuard] },
  { path: 'rbac', component: RbacPage, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
