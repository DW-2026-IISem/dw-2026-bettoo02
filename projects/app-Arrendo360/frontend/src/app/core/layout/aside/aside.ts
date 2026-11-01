import { Component, signal } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {

  label: string;

  icon: string;

  route: string;

}

export interface NavGroup {

  title: string;

  items: NavItem[];

}

@Component({

  selector: 'app-aside',

  imports: [RouterLink, RouterLinkActive],

  templateUrl: './aside.html',

  styleUrl: './aside.css',

})

export class Aside {

  protected readonly navGroups = signal<NavGroup[]>([

    {

      title: 'Principal',

      items: [

        { label: 'Dashboard', icon: 'pi pi-chart-bar', route: '/dashboard' },

      ],

    },

    {

      title: 'Gestión Inmobiliaria',

      items: [

        { label: 'Arrendatarios (Clientes)', icon: 'pi pi-users', route: '/clients' },

        { label: 'Propietarios', icon: 'pi pi-id-card', route: '/propietarios' },

        { label: 'Inmuebles', icon: 'pi pi-home', route: '/inmuebles' },

        { label: 'Contratos', icon: 'pi pi-file-edit', route: '/contratos' },

        { label: 'Cobros y Pagos', icon: 'pi pi-wallet', route: '/cobros' },

        { label: 'Liquidaciones', icon: 'pi pi-percentage', route: '/liquidaciones' },

        { label: 'Mantenimiento', icon: 'pi pi-wrench', route: '/mantenimiento' },

      ],

    },

    {

      title: 'Catálogo Comercial',

      items: [

        { label: 'Tipos de Producto', icon: 'pi pi-tags', route: '/product-types' },

        { label: 'Productos', icon: 'pi pi-box', route: '/products' },

        { label: 'Ventas', icon: 'pi pi-shopping-cart', route: '/sales' },

      ],

    },

  ]);

}