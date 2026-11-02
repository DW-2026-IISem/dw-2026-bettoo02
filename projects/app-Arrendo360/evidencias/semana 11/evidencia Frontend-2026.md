## Empecemos con el Paso 1: **ISS-00 — Requisitos previos y reconocimiento del entorno**

#### **1. ¿Qué buscamos en el ISS-00?**

En el **ISS-00** no escribimos código de aplicación todavía; nos aseguramos de que las herramientas base estén listas y que el backend de **Arrendo360 (mi proyecto)** responda correctamente para que Angular no falle al conectarse más adelante.

**2. Tarea paso a paso para completar el ISS-00**

Abre tu terminal y realiza estos **3 pasos**:

**Paso A: Instalar Angular CLI de forma global** Ejecuta en tu terminal:

```         

npm install -g @angular/cli
```

*(Si en Linux pide permisos o se prefiere no usar `sudo`, también podremos usar `npx @angular/cli` en el ISS-01, pero prueba primero si te permite instalarlo o verifica con `npx @angular/cli version`).*

![](images/clipboard-207183815.png)

**Paso B: Verificar dónde crearemos la carpeta `frontend`** Mi proyecto tiene la ruta raíz `/home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/`, donde hoy está la carpeta `backend/`. La idea es que `frontend/` quede como carpeta hermana al mismo nivel:

```         
text
app-Arrendo360/

├── backend/    <-- Tu API NestJS + Express + Sequelize (puerto 3002)

└── frontend/   <-- Aquí crearemos tu app Angular en el ISS-01 (puerto 4200)
```

![](images/clipboard-4151717802.png)

**Paso C: Verificar que tu Backend está vivo y responde al Healthcheck** En una terminal dentro de `/home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend`, inicia el servidor (si no lo tienes corriendo):

```         
bash
npm run start:dev
```

![](images/clipboard-3891625010.png)

![](images/clipboard-782056588.png)Y comprueba en otra terminal o navegador que responde:

```         
bash
curl http://localhost:3002/api/health
```

Deberías recibir `{"statusCode":200,"data":{"status":"ok"}}`.

![](images/clipboard-935629180.png)

## **ISS-01 · Capa 2: Construir (Paso a paso manual)**

Sigue estos **5 pasos** desde tu terminal.

### **Paso 1: Crear el proyecto `frontend` al lado de `backend`**

Ubícate en la carpeta raíz de tu proyecto (`app-Arrendo360`) y genera el proyecto Angular:

```{bash}
cd /home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360
npx @angular/cli@latest new frontend --style=css --routing=true --ssr=false --zoneless=true --skip-git=true
```

> **¿Por qué estos flags?**
>
> - `--style=css`: Necesario para la integración limpia con Tailwind CSS 4 (`@import "tailwindcss";`).
>
> - `--routing=true`: Crea `app.routes.ts` para navegar entre los módulos de Arrendo360.
>
> - `--ssr=false`: Crea una SPA pura en el navegador.
>
> - `--zoneless=true`: Configura la reactividad moderna basada en Signals sin `zone.js`

![](images/clipboard-2917143732.png)

### **Paso 2: Entrar a `frontend` e instalar PrimeNG, PrimeIcons y Tailwind CSS 4**

Una vez termine de crearse la carpeta `frontend`, entra en ella e instala las dependencias de diseño:

```{bash}
cd /home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/frontend

# 1. Instalar PrimeNG, el tema Aura y los iconos PrimeIcons

npm install primeng @primeuix/themes primeicons

# 2. Instalar Tailwind CSS v4 y su plugin PostCSS

npm install -D tailwindcss @tailwindcss/postcss postcss
```

![](images/clipboard-137173714.png)

### **Paso 3: Configurar PostCSS para que Angular procese Tailwind CSS 4**

En la raíz de `frontend/` (`/home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/frontend/.postcssrc.json`), crea un archivo llamado **`.postcssrc.json`** con este contenido exacto:

```         
json
```

{

"plugins": {

"\@tailwindcss/postcss": {}

}

}

### **Paso 4: Configurar las capas de estilos globales en `src/styles.css`**

Abre el archivo `frontend/src/styles.css` y reemplaza su contenido por este bloque:

```         
css
```

[\@layer tailwind-base, primeng, tailwind-utilities;]{.underline}

[\@import "tailwindcss";]{.underline}

[\@import "primeicons/primeicons.css";]{.underline}

> 
>
> **Nota pedagógica:** Fíjate en la primera línea (`@layer ...`) y en que importamos `primeicons.css` para poder usar íconos como `pi pi-home`, `pi pi-building`, `pi pi-users` o `pi pi-key` en todo Arrendo360.

### **Paso 5: Configurar el Composition Root en `src/app/app.config.ts`**

Abre `frontend/src/app/app.config.ts` y configúralo para activar **Zoneless**, el **Router** y **PrimeNG con el tema Aura**:

```         
typescript
```

import { ApplicationConfig, provideZonelessChangeDetection } from '\@angular/core';

import { provideRouter } from '\@angular/router';

import { provideAnimationsAsync } from '\@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';

import Aura from '\@primeuix/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {

providers: [

provideZonelessChangeDetection(),

provideRouter(routes),

provideAnimationsAsync(),

providePrimeNG({

ripple: true,

theme: {

preset: Aura,

options: {

darkModeSelector: '.app-dark',

cssLayer: {

name: 'primeng',

order: 'tailwind-base, primeng, tailwind-utilities',

},

},

},

}),

],

};

*(Nota: Si tu versión de Angular 21/22 te marca que `provideAnimationsAsync()` ya está deprecado o no es necesario en las últimas versiones de PrimeNG, me avisas o podemos omitir `provideAnimationsAsync()` ya que PrimeNG 20+ usa animaciones CSS nativas).*

## **ISS-01 · Capa 3: Criterio de Verificación**

Para comprobar que tu **ISS-01** quedó sin errores:

1.  

2.  Abre temporalmente `frontend/src/app/app.html` (o `app.component.html`), borra la plantilla de bienvenida de Angular y pon una prueba rápida de **Tailwind + PrimeNG + PrimeIcons**:

    ```         
    html
    ```

    \<div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6"\>

    \<h1 class="text-3xl font-bold text-emerald-700 flex items-center gap-2"\>

    \<i class="pi pi-building text-3xl"\>\</i\>

    Arrendo360 — Frontend 2026

    \</h1\>

    \<p class="text-slate-600"\>ISS-01: Angular + Tailwind CSS 4 + PrimeNG Aura listos\</p\>

    \</div\>

3.  

4.  Ejecuta en la terminal dentro de `frontend/`:

    ```         
    bash
    ```

    npm start![](images/clipboard-137173714.png)

5.  

6.  Abre [`http://localhost:4200`](http://localhost:4200) en tu navegador.

![](images/clipboard-137173714.png)

La terminal muestra advertencias de npm (`npm warn install-scripts`) indicando que se bloquearon los scripts de instalación automáticos de cuatro paquetes porque no están autorizados en la configuración `allowScripts`:

- `@parcel/watcher@2.6.0` (`node-gyp rebuild`)

- `esbuild@0.28.2` (`node install.js`)

- `lmdb@3.5.6` (`node-gyp rebuild`)

- `msgpackr-extract@3.0.4` (`node-gyp rebuild`)

Muchos paquetes como `esbuild` o dependencias nativas requieren ejecutar estos scripts tras la instalación para compilar o descargar binarios necesarios para su correcto funcionamiento.

### Opciones para resolverlo

**1. Permitir y compilar los paquetes bloqueados (Recomendado)**

Ejecuta el comando para aprobar individualmente cada dependencia legítima:

```{bash}
npm install-scripts approve esbuild
npm install-scripts approve @parcel/watcher
npm install-scripts approve lmdb
npm install-scripts approve msgpackr-extract
```

![](images/clipboard-2887699820.png)

Luego vuelve a ejecutar la instalación o reconstruye los scripts:

```{bash}
npm rebuild
```

![](images/clipboard-2606324230.png)

### **Paso 3: Configurar PostCSS para que Angular procese Tailwind CSS 4**

En la raíz de `frontend/` (`/home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/frontend/.postcssrc.json`), crea un archivo llamado **`.postcssrc.json`** con este contenido exacto:

``` json
{

  "plugins": {

    "@tailwindcss/postcss": {}

  }

}
```

![](images/clipboard-1911844636.png)

### **Paso 4: Configurar las capas de estilos globales en `src/styles.css`**

Abre el archivo `frontend/src/styles.css` y reemplaza su contenido por este bloque:

``` css
css
@layer tailwind-base, primeng, tailwind-utilities;

@import "tailwindcss";

@import "primeicons/primeicons.css";
```

>  **Nota pedagógica:** Fíjate en la primera línea (`@layer ...`) y en que importamos `primeicons.css` para poder usar íconos como `pi pi-home`, `pi pi-building`, `pi pi-users` o `pi pi-key` en todo Arrendo360.

![](images/clipboard-2472462605.png)

### **Paso 5: Configurar el Composition Root en `src/app/app.config.ts`**

Abre `frontend/src/app/app.config.ts` y configúralo para activar **Zoneless**, el **Router** y **PrimeNG con el tema Aura**:

``` typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

import { provideRouter } from '@angular/router';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';

import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {

  providers: [

    provideZonelessChangeDetection(),

    provideRouter(routes),

    provideAnimationsAsync(),

    providePrimeNG({

      ripple: true,

      theme: {

        preset: Aura,

        options: {

          darkModeSelector: '.app-dark',

          cssLayer: {

            name: 'primeng',

            order: 'tailwind-base, primeng, tailwind-utilities',

          },

        },

      },

    }),

  ],

};
```

*(Nota: Si tu versión de Angular 21/22 te marca que `provideAnimationsAsync()` ya está deprecado o no es necesario en las últimas versiones de PrimeNG, me avisas o podemos omitir `provideAnimationsAsync()` ya que PrimeNG 20+ usa animaciones CSS nativas).*

![](images/clipboard-4263112571.png)

## **ISS-01 · Capa 3: Criterio de Verificación**

Para comprobar que tu **ISS-01** quedó sin errores:

1.  Abre temporalmente `frontend/src/app/app.html` (o `app.component.html`), borra la plantilla de bienvenida de Angular y pon una prueba rápida de **Tailwind + PrimeNG + PrimeIcons**:

    ``` html
    <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">

      <h1 class="text-3xl font-bold text-emerald-700 flex items-center gap-2">

        <i class="pi pi-building text-3xl"></i>

        Arrendo360 — Frontend 2026

      </h1>

      <p class="text-slate-600">ISS-01: Angular + Tailwind CSS 4 + PrimeNG Aura listos</p>

    </div>
    ```

    ![](images/clipboard-3018705530.png)

2.  Ejecuta en la terminal dentro de `frontend/`:

    ``` bash
    npm start
    ```

3.  Abre [`http://localhost:4200`](http://localhost:4200) en tu navegador.

![](images/clipboard-4013073398.png)

## **ISS-01A · Capa 2: Construir**

Abre una terminal en `frontend/` (`/home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/frontend`) y sigue estos **5 pasos**:

### **Paso 1: Generar los 3 componentes del Layout con Angular CLI**

Ejecuta estos comandos para que el CLI cree la carpeta `core/layout/` con los tres componentes:

``` bash
npx ng g c core/layout/header --skip-tests

npx ng g c core/layout/aside --skip-tests

npx ng g c core/layout/footer --skip-tests
```

![](images/clipboard-2358956210.png)

### **Paso 2: Maquetar el componente `Header`**

Abre el archivo `frontend/src/app/core/layout/header/header.html` y coloca este diseño con Tailwind + PrimeIcons:

``` html
<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">

  <!-- Marca Arrendo360 -->

  <div class="flex items-center gap-3">

    <div class="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">

      <i class="pi pi-building text-xl"></i>

    </div>

    <div>

      <h1 class="text-lg font-bold text-slate-800 leading-tight">Arrendo360</h1>

      <p class="text-xs text-slate-500">Plataforma de Gestión Inmobiliaria</p>

    </div>

  </div>

  <!-- Estado / Usuario (estático en ISS-01A) -->

  <div class="flex items-center gap-4">

    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">

      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>

      API Local :3002

    </span>

    <div class="flex items-center gap-2 text-sm text-slate-700 font-medium">

      <i class="pi pi-user text-slate-500"></i>

      <span>Administrador</span>

    </div>

  </div>

</header>
```

![](images/clipboard-2447271773.png)

### **Paso 3: Maquetar el componente `Aside` (Menú lateral inmobiliario)**

Abre el archivo `frontend/src/app/core/layout/aside/aside.html` y escribe la estructura del menú de navegación de **Arrendo360**:

``` html
<aside class="w-64 bg-slate-900 text-slate-200 h-full flex flex-col justify-between p-4 select-none">

  <div class="space-y-6">

    <!-- Grupo 1: General -->

    <div>

      <p class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">

        Principal

      </p>

      <ul class="space-y-1 text-sm">

        <li>

          <a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-600 text-white font-medium cursor-pointer">

            <i class="pi pi-chart-bar"></i>

            <span>Dashboard</span>

          </a>

        </li>

      </ul>

    </div>

    <!-- Grupo 2: Negocio Inmobiliario (Fase I) -->

    <div>

      <p class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">

        Gestión Inmobiliaria

      </p>

      <ul class="space-y-1 text-sm">

        <li>

          <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors">

            <i class="pi pi-users"></i>

            <span>Arrendatarios (Clientes)</span>

          </a>

        </li>

        <li>

          <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors">

            <i class="pi pi-id-card"></i>

            <span>Propietarios</span>

          </a>

        </li>

        <li>

          <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors">

            <i class="pi pi-home"></i>

            <span>Inmuebles</span>

          </a>

        </li>

        <li>

          <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors">

            <i class="pi pi-file-edit"></i>

            <span>Contratos</span>

          </a>

        </li>

        <li>

          <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors">

            <i class="pi pi-wallet"></i>

            <span>Cobros y Pagos</span>

          </a>

        </li>

        <li>

          <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors">

            <i class="pi pi-percentage"></i>

            <span>Liquidaciones</span>

          </a>

        </li>

        <li>

          <a class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors">

            <i class="pi pi-wrench"></i>

            <span>Mantenimiento</span>

          </a>

        </li>

      </ul>

    </div>

  </div>

  <!-- Pie del Aside -->

  <div class="pt-4 border-t border-slate-800 text-xs text-slate-400 px-3">

    <p class="font-medium text-slate-300">Arrendo360 v1.0</p>

    <p>Universidad de La Guajira</p>

  </div>

</aside>
```

![](images/clipboard-1778842854.png)

### **Paso 4: Maquetar el componente `Footer`**

Abre el archivo `frontend/src/app/core/layout/footer/footer.html` y coloca este contenido:

``` html
<footer class="h-12 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-xs text-slate-500">

  <span>© 2026 <strong>Arrendo360</strong> — Ingeniería de Sistemas · Universidad de La Guajira</span>

  <span>Stack: Angular 22 · PrimeNG 22 · Tailwind 4 · Express/NestJS</span>

</footer>
```

![](images/clipboard-615533166.png)

### **Paso 5: Ensamblar el Layout en `src/app/app.ts` y `src/app/app.html`**

Ahora conectamos los 3 componentes dentro del componente raíz `src/app/app.ts`:

1.  En `frontend/src/app/app.ts`, importa `Header`, `Aside` y `Footer`:

``` typescript
import { Component, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { Header } from './core/layout/header/header';

import { Aside } from './core/layout/aside/aside';

import { Footer } from './core/layout/footer/footer';

@Component({

  imports: [RouterOutlet, Header, Aside, Footer],

  selector: 'app-root',

  styleUrl: './app.css',

  templateUrl: './app.html',

})

export class App {

  protected readonly title = signal('Arrendo360');

}
```

![](images/clipboard-3051994664.png)

2.   En `frontend/src/app/app.html`, arma el esqueleto completo (Shell) de la aplicación:

``` html
<div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">

  <!-- Cabecera superior -->

  <app-header />

  <!-- Cuerpo principal: Aside izquierdo + Contenido central -->

  <div class="flex flex-1 overflow-hidden">

    <app-aside />

    <main class="flex-1 p-6 overflow-y-auto">

      <div class="max-w-7xl mx-auto">

        <!-- Tarjeta de bienvenida temporal mientras creamos las rutas en ISS-01B -->

        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">

          <h2 class="text-xl font-bold text-slate-800 mb-2">

            Bienvenido a {{ title() }}

          </h2>

          <p class="text-sm text-slate-600">

            ISS-01A completado: Composición visual de Header, Aside y Footer lista.

          </p>

        </div>

        <router-outlet />

      </div>

    </main>

  </div>

  <!-- Pie de página -->

  <app-footer />

</div>
```

![![](images/clipboard-3665533878.png)](images/clipboard-380746271.png)

## **ISS-01B · Capa 2: Construir**

Realiza estos **4 pasos** en tus archivos de `frontend/src/app/`:

### **Paso 1: Hacer interactivo el `Header` (`header.ts` y `header.html`)** 

1.  Abre `frontend/src/app/core/layout/header/header.ts` y añade `output` y `ButtonModule` de PrimeNG para emitir el evento de abrir/cerrar el menú lateral:

``` typescript
import { Component, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';

@Component({

  selector: 'app-header',

  imports: [ButtonModule],

  templateUrl: './header.html',

  styleUrl: './header.css',

})

export class Header {

  // Recibe del padre si el sidebar está abierto (para cambiar el ícono si queremos)

  readonly sidebarOpen = input<boolean>(true);

  // Emite al padre cuando el usuario presiona el botón de menú

  readonly toggleSidebar = output<void>();

}
```

![](images/clipboard-1045119835.png)

2.  Abre `frontend/src/app/core/layout/header/header.html` y añade el botón `<p-button>` de PrimeNG al lado del logo de **Arrendo360**:

``` html
<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">

  <div class="flex items-center gap-3">

    <!-- Botón PrimeNG que dispara el output toggleSidebar -->

    <p-button

      [icon]="sidebarOpen() ? 'pi pi-bars' : 'pi pi-align-left'"

      [rounded]="true"

      [text]="true"

      severity="secondary"

      (onClick)="toggleSidebar.emit()"

      title="Mostrar / ocultar menú lateral"

    />

    <div class="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">

      <i class="pi pi-building text-xl"></i>

    </div>

    <div>

      <h1 class="text-lg font-bold text-slate-800 leading-tight">Arrendo360</h1>

      <p class="text-xs text-slate-500">Plataforma de Gestión Inmobiliaria</p>

    </div>

  </div>

  <!-- Estado / Usuario -->

  <div class="flex items-center gap-4">

    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">

      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>

      API Local :3002

    </span>

    <div class="flex items-center gap-2 text-sm text-slate-700 font-medium">

      <i class="pi pi-user text-slate-500"></i>

      <span>Administrador</span>

    </div>

  </div>

</header>
```

![](images/clipboard-1622906444.png)

### **Paso 2: Convertir el `Aside` en un menú reactivo basado en datos (`aside.ts` y `aside.html`)**

1.   Abre `frontend/src/app/core/layout/aside/aside.ts` y define las secciones y enlaces del menú usando `signal()` y `RouterLink` / `RouterLinkActive`:

``` typescript
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
```

![](images/clipboard-3296704211.png)

2.  Abre `frontend/src/app/core/layout/aside/aside.html` y usa el bloque moderno `@for` de Angular para renderizar los grupos y marcar en verde (`bg-emerald-600 text-white`) la ruta activa automáticamente:

``` html
<aside class="w-64 bg-slate-900 text-slate-200 h-full flex flex-col justify-between p-4 select-none shrink-0">

  <div class="space-y-6 overflow-y-auto">

    @for (group of navGroups(); track group.title) {

      <div>

        <p class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">

          {{ group.title }}

        </p>

        <ul class="space-y-1 text-sm">

          @for (item of group.items; track item.route) {

            <li>

              <a

                [routerLink]="item.route"

                routerLinkActive="bg-emerald-600 text-white font-medium shadow-xs"

                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors"

              >

                <i [class]="item.icon"></i>

                <span>{{ item.label }}</span>

              </a>

            </li>

          }

        </ul>

      </div>

    }

  </div>

  <div class="pt-4 border-t border-slate-800 text-xs text-slate-400 px-3">

    <p class="font-medium text-slate-300">Arrendo360 v1.0</p>

    <p>Universidad de La Guajira</p>

  </div>

</aside>
```

![](images/clipboard-2597373374.png)

### **Paso 3: Conectar el estado `sidebarOpen` en `src/app/app.ts` y `src/app/app.html`**

1.   Abre `frontend/src/app/app.ts` y agrega el signal `sidebarOpen` junto con el método `onToggleSidebar()`:

``` typescript
import { Component, signal } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { Header } from './core/layout/header/header';

import { Aside } from './core/layout/aside/aside';

import { Footer } from './core/layout/footer/footer';

@Component({

  imports: [RouterOutlet, Header, Aside, Footer],

  selector: 'app-root',

  styleUrl: './app.css',

  templateUrl: './app.html',

})

export class App {

  protected readonly title = signal('Arrendo360');

  protected readonly sidebarOpen = signal(true);

  protected onToggleSidebar(): void {

    this.sidebarOpen.update((open) => !open);

  }

}
```

![](images/clipboard-2214880921.png)

2.   Abre `frontend/src/app/app.html` y conecta `[sidebarOpen]` y `(toggleSidebar)` en `<app-header>`, y envuelve `<app-aside />` en un bloque `@if (sidebarOpen())`:

``` html
<div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">

  <!-- Cabecera con input y output conectados -->

  <app-header

    [sidebarOpen]="sidebarOpen()"

    (toggleSidebar)="onToggleSidebar()"

  />

  <!-- Cuerpo principal -->

  <div class="flex flex-1 overflow-hidden">

    @if (sidebarOpen()) {

      <app-aside />

    }

    <main class="flex-1 p-6 overflow-y-auto">

      <div class="max-w-7xl mx-auto">

        <router-outlet />

      </div>

    </main>

  </div>

  <app-footer />

</div>
```

![](images/clipboard-439479196.png)

### **Paso 4: Configurar redirección inicial en `src/app/app.routes.ts`**

Para que al entrar a [`http://localhost:4200`](http://localhost:4200) no quede vacío el `<router-outlet />`, abre `frontend/src/app/app.routes.ts` y define la redirección por defecto a `/dashboard` (en el ISS-02 crearemos el layout/páginas y servicios):

``` typescript
import { Routes } from '@angular/router';

export const routes: Routes = [

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
```

![](images/clipboard-1067196843.png)

### **ISS-02 · Capa 2**

Sigue estos **6 pasos**:

#### **Paso 1: Generar los archivos de `environments`**

En tu terminal dentro de `frontend/`, ejecuta:

``` bash
npx ng g environments
```

![](images/clipboard-2720276398.png)

Esto creará `src/environments/environment.ts` y `src/environments/environment.development.ts`. Abre **ambos archivos** (`environment.ts` y `environment.development.ts`) y ponles este contenido apuntando al puerto `3002` de tu backend Arrendo360:

``` typescript
export const environment = {

  production: false,

  apiUrl: 'http://localhost:3002/api',

  appName: 'Arrendo360',

};
```

![](images/clipboard-292091219.png)

#### **Paso 2: Habilitar `provideHttpClient` en `src/app/app.config.ts`**

Abre `frontend/src/app/app.config.ts`, importa `provideHttpClient` y `withFetch` desde `@angular/common/http` y agrégalo al arreglo `providers`:

``` typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

import { provideRouter } from '@angular/router';

import { provideHttpClient, withFetch } from '@angular/common/http';

import { providePrimeNG } from 'primeng/config';

import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {

  providers: [

    provideZonelessChangeDetection(),

    provideRouter(routes),

    provideHttpClient(withFetch()),

    providePrimeNG({

      ripple: true,

      theme: {

        preset: Aura,

        options: {

          darkModeSelector: '.app-dark',

          cssLayer: {

            name: 'primeng',

            order: 'tailwind-base, primeng, tailwind-utilities',

          },

        },

      },

    }),

  ],

};
```

#### ![](images/clipboard-495600160.png)

#### **Paso 3: Crear el modelo espejo del contrato REST (`src/app/core/models/api-response.model.ts`)**

Crea la carpeta `src/app/core/models/` y dentro el archivo `api-response.model.ts`:

``` typescript
/**

 * Espejo exacto de ResponseInterceptor del backend Arrendo360

 */

export interface ApiResponse<T> {

  statusCode: number;

  message: string;

  data: T;

  timestamp?: string;

}

/**

 * Estructura estándar para respuestas paginadas del backend

 */

export interface PaginatedResponse<T> {

  items?: T[];

  rows?: T[];

  total: number;

  page: number;

  limit: number;

}

export interface HealthStatus {

  status: string;

}
```

#### ![](images/clipboard-2633260745.png)

#### **Paso 4: Crear el servicio de verificación de salud (`src/app/core/services/health.service.ts`)**

Genera o crea el archivo `frontend/src/app/core/services/health.service.ts` para probar nuestro primer flujo `Service → HttpClient → API`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { ApiResponse, HealthStatus } from '../models/api-response.model';

@Injectable({

  providedIn: 'root',

})

export class HealthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/health`;

  // Signals reactivos para saber si el backend en :3002 está en línea

  readonly isOnline = signal<boolean>(false);

  readonly checking = signal<boolean>(false);

  readonly lastChecked = signal<string | null>(null);

  checkHealth(): void {

    this.checking.set(true);

    this.http.get<ApiResponse<HealthStatus>>(this.apiUrl).subscribe({

      next: (res) => {

        this.isOnline.set(res?.data?.status === 'ok');

        this.lastChecked.set(res?.timestamp ?? new Date().toISOString());

        this.checking.set(false);

      },

      error: () => {

        this.isOnline.set(false);

        this.checking.set(false);

      },

    });

  }

}
```

#### ![](images/clipboard-3673330302.png)

#### **Paso 5: Crear el componente `Dashboard` inicial para resolver las rutas**

Ejecuta en la terminal dentro de `frontend/`:

``` bash
npx ng g c features/dashboard/dashboard --skip-tests
```

![](images/clipboard-883162314.png)

1.  Abre `frontend/src/app/features/dashboard/dashboard/dashboard.ts` (o `features/dashboard/dashboard.ts` según la ruta que cree el CLI) y conéctalo con `HealthService`:

``` typescript
import { Component, OnInit, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { HealthService } from '../../core/services/health.service'; // Ajusta ../ según la profundidad de carpeta

@Component({

  selector: 'app-dashboard',

  imports: [ButtonModule],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css',

})

export class Dashboard implements OnInit {

  protected readonly healthService = inject(HealthService);

  ngOnInit(): void {

    this.healthService.checkHealth();

  }

}
```

![](images/clipboard-2458870626.png)

2.  Abre `dashboard.html` y muestra el estado en vivo de la conexión con el backend:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Panel Principal — Arrendo360</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-02: Núcleo de servicios HTTP, environments y contrato ApiResponse conectados.

      </p>

    </div>

    <p-button

      label="Verificar API"

      icon="pi pi-refresh"

      severity="success"

      [loading]="healthService.checking()"

      (onClick)="healthService.checkHealth()"

    />

  </div>

  <!-- Tarjeta de estado de conexión con el Backend -->

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">

    <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">

      Estado de Conexión con Backend (:3002/api/health)

    </h3>

    <div class="flex items-center gap-3">

      @if (healthService.isOnline()) {

        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-200">

          <i class="pi pi-check-circle text-emerald-600"></i>

          Backend Conectado (status: ok)

        </span>

      } @else {

        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-medium text-sm border border-red-200">

          <i class="pi pi-times-circle text-red-600"></i>

          Backend Desconectado (Verifica que el backend corra en puerto 3002)

        </span>

      }

    </div>

  </div>

</div>
```

#### ![](images/clipboard-2248779283.png)

#### **Paso 6: Registrar la ruta `/dashboard` en `src/app/app.routes.ts`**

Abre `frontend/src/app/app.routes.ts` y agrega la ruta `'dashboard'` antes de las redirecciones:

``` typescript
import { Routes } from '@angular/router';

import { Dashboard } from './features/dashboard/dashboard'; // Ajusta si quedó en ./features/dashboard/dashboard/dashboard

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
```

![](images/clipboard-1715798117.png)

### **ISS-03 · Capa 2:** 

Vamos a construir este módulo en **4 piezas limpias**: `Model` → `Service` → `Component` → `Route`.

#### **Paso 1: Crear el modelo `src/app/features/clients/models/client.model.ts`**

Crea la carpeta `frontend/src/app/features/clients/models/` y dentro el archivo `client.model.ts` (espejo exacto de tu `ArrendatarioResponseDto` del backend):

``` typescript
export interface Client {

  id: number;

  tipoDocumento: string;

  numeroDocumento: string;

  nombre: string;

  telefono: string;

  email: string;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

}

export interface CreateClientDto {

  tipoDocumento: string;

  numeroDocumento: string;

  nombre: string;

  telefono?: string;

  email?: string;

}

export type UpdateClientDto = Partial<CreateClientDto> & {

  isActive?: boolean;

};
```

#### **Paso 2: Crear el servicio `src/app/features/clients/services/clients.service.ts`**

Crea la carpeta `frontend/src/app/features/clients/services/` y dentro el archivo `clients.service.ts`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

import { Client, CreateClientDto, UpdateClientDto } from '../models/client.model';

@Injectable({

  providedIn: 'root',

})

export class ClientsService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/clients`;

  // Header de rol para operaciones de escritura en Fase I (antes de JWT en ISS-08)

  private readonly headers = new HttpHeaders({ 'x-user-role': 'ADMIN' });

  // Estado reactivo con Signals

  readonly clients = signal<Client[]>([]);

  readonly total = signal<number>(0);

  readonly loading = signal<boolean>(false);

  loadClients(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<Client>>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          const list = res.data?.items ?? res.data?.rows ?? [];

          this.clients.set(list);

          this.total.set(res.data?.total ?? list.length);

          this.loading.set(false);

        },

        error: () => {

          this.loading.set(false);

        },

      });

  }

  create(dto: CreateClientDto): Observable<ApiResponse<Client>> {

    return this.http

      .post<ApiResponse<Client>>(this.apiUrl, dto, { headers: this.headers })

      .pipe(tap(() => this.loadClients()));

  }

  update(id: number, dto: UpdateClientDto): Observable<ApiResponse<Client>> {

    return this.http

      .patch<ApiResponse<Client>>(`${this.apiUrl}/${id}`, dto, { headers: this.headers })

      .pipe(tap(() => this.loadClients()));

  }

  toggleStatus(client: Client): Observable<ApiResponse<Client>> {

    const action = client.isActive ? 'deactivate' : 'activate';

    return this.http

      .patch<ApiResponse<Client>>(

        `${this.apiUrl}/${client.id}/${action}`,

        {},

        { headers: this.headers },

      )

      .pipe(tap(() => this.loadClients()));

  }

}
```

#### **Paso 3: Crear el componente de página `ClientsPage`**

En tu terminal dentro de `frontend/`, genera el componente con `--flat` para que no te cree carpetas repetidas:

``` bash
npx ng g c features/clients/pages/clients-page --flat --skip-tests
```

![](images/clipboard-2061551740.png)

1.  Abre `frontend/src/app/features/clients/pages/clients-page.ts` y escribe la lógica del listado, diálogo modal de creación/edición con **ReactiveForms** y cambio de estado:

``` typescript
import { Component, OnInit, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { ClientsService } from '../services/clients.service';

import { Client } from '../models/client.model';

@Component({

  selector: 'app-clients-page',

  imports: [

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './clients-page.html',

  styleUrl: './clients-page.css',

})

export class ClientsPage implements OnInit {

  protected readonly clientsService = inject(ClientsService);

  private readonly fb = inject(FormBuilder);

  protected readonly dialogVisible = signal(false);

  protected readonly editingClient = signal<Client | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly documentTypes = [

    { label: 'Cédula de Ciudadanía (CC)', value: 'CC' },

    { label: 'Cédula de Extranjería (CE)', value: 'CE' },

    { label: 'NIT', value: 'NIT' },

    { label: 'Pasaporte (PAS)', value: 'PAS' },

  ];

  protected readonly form = this.fb.nonNullable.group({

    tipoDocumento: ['CC', [Validators.required]],

    numeroDocumento: ['', [Validators.required, Validators.minLength(5)]],

    nombre: ['', [Validators.required, Validators.minLength(3)]],

    telefono: [''],

    email: ['', [Validators.email]],

  });

  ngOnInit(): void {

    this.clientsService.loadClients();

  }

  protected openNew(): void {

    this.editingClient.set(null);

    this.errorMsg.set(null);

    this.form.reset({

      tipoDocumento: 'CC',

      numeroDocumento: '',

      nombre: '',

      telefono: '',

      email: '',

    });

    this.dialogVisible.set(true);

  }

  protected openEdit(client: Client): void {

    this.editingClient.set(client);

    this.errorMsg.set(null);

    this.form.reset({

      tipoDocumento: client.tipoDocumento,

      numeroDocumento: client.numeroDocumento,

      nombre: client.nombre,

      telefono: client.telefono ?? '',

      email: client.email ?? '',

    });

    this.dialogVisible.set(true);

  }

  protected save(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.saving.set(true);

    this.errorMsg.set(null);

    const payload = this.form.getRawValue();

    const current = this.editingClient();

    const request$ = current

      ? this.clientsService.update(current.id, payload)

      : this.clientsService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(

          err?.error?.message ?? 'Error al guardar el arrendatario/cliente.',

        );

      },

    });

  }

  protected onToggleStatus(client: Client): void {

    this.clientsService.toggleStatus(client).subscribe();

  }

}
```

![](images/clipboard-3663358744.png)

2.   Abre `frontend/src/app/features/clients/pages/clients-page.html` y maqueta la tabla `<p-table>` y el modal `<p-dialog>` de PrimeNG:

``` html
<div class="space-y-6">

  <!-- Encabezado de página -->

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Arrendatarios (Clientes)</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-03: Gestión de clientes titulares de contratos de arrendamiento (/api/clients)

      </p>

    </div>

    <div class="flex items-center gap-2">

      <p-button

        label="Recargar"

        icon="pi pi-refresh"

        severity="secondary"

        [outlined]="true"

        (onClick)="clientsService.loadClients()"

      />

      <p-button

        label="Nuevo Arrendatario"

        icon="pi pi-plus"

        severity="success"

        (onClick)="openNew()"

      />

    </div>

  </div>

  <!-- Tabla PrimeNG -->

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table

      [value]="clientsService.clients()"

      [loading]="clientsService.loading()"

      [paginator]="true"

      [rows]="10"

      [rowHover]="true"

      dataKey="id"

    >

      <ng-template #header>

        <tr>

          <th>ID</th>

          <th>Documento</th>

          <th>Nombre Completo</th>

          <th>Teléfono</th>

          <th>Correo Electrónico</th>

          <th>Estado</th>

          <th class="text-right">Acciones</th>

        </tr>

      </ng-template>

      <ng-template #body let-client>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ client.id }}</td>

          <td>

            <span class="font-semibold text-slate-700">{{ client.tipoDocumento }}</span>

            {{ client.numeroDocumento }}

          </td>

          <td class="font-medium text-slate-800">{{ client.nombre }}</td>

          <td>{{ client.telefono || '—' }}</td>

          <td>{{ client.email || '—' }}</td>

          <td>

            <p-tag

              [value]="client.isActive ? 'Activo' : 'Inactivo'"

              [severity]="client.isActive ? 'success' : 'danger'"

            />

          </td>

          <td class="text-right space-x-1">

            <p-button

              icon="pi pi-pencil"

              [rounded]="true"

              [text]="true"

              severity="info"

              title="Editar"

              (onClick)="openEdit(client)"

            />

            <p-button

              [icon]="client.isActive ? 'pi pi-ban' : 'pi pi-check'"

              [rounded]="true"

              [text]="true"

              [severity]="client.isActive ? 'danger' : 'success'"

              [title]="client.isActive ? 'Desactivar' : 'Reactivar'"

              (onClick)="onToggleStatus(client)"

            />

          </td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr>

          <td colspan="7" class="text-center py-8 text-slate-500">

            No hay arrendatarios registrados aún.

          </td>

        </tr>

      </ng-template>

    </p-table>

  </div>

  <!-- Modal Crear / Editar -->

  <p-dialog

    [header]="editingClient() ? 'Editar Arrendatario' : 'Nuevo Arrendatario'"

    [visible]="dialogVisible()"

    (visibleChange)="dialogVisible.set($event)"

    [modal]="true"

    [style]="{ width: '32rem' }"

  >

    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4 pt-2">

      @if (errorMsg()) {

        <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

          {{ errorMsg() }}

        </div>

      }

      <div class="grid grid-cols-2 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Tipo Documento *</label>

          <p-select

            formControlName="tipoDocumento"

            [options]="documentTypes"

            optionLabel="label"

            optionValue="value"

            appendTo="body"

          />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Número Documento *</label>

          <input pInputText formControlName="numeroDocumento" placeholder="Ej. 1098765432" />

        </div>

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Nombre Completo *</label>

        <input pInputText formControlName="nombre" placeholder="Ej. María Fernanda Gómez" />

      </div>

      <div class="grid grid-cols-2 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Teléfono</label>

          <input pInputText formControlName="telefono" placeholder="Ej. +57 300 123 4567" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Correo Electrónico</label>

          <input pInputText formControlName="email" placeholder="correo@ejemplo.com" />

        </div>

      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-slate-200">

        <p-button

          label="Cancelar"

          severity="secondary"

          [text]="true"

          (onClick)="dialogVisible.set(false)"

        />

        <p-button

          label="Guardar"

          icon="pi pi-check"

          severity="success"

          type="submit"

          [loading]="saving()"

        />

      </div>

    </form>

  </p-dialog>

</div>
```

#### ![](images/clipboard-2291884026.png)

#### **Paso 4: Registrar la ruta `/clients` en `src/app/app.routes.ts`**

Abre `frontend/src/app/app.routes.ts` y añade la ruta `'clients'`:

``` typescript
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
```

![](images/clipboard-2550296059.png)

![](images/clipboard-3866739784.png)
