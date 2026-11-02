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

### **ISS-04 · Capa 2**

Hagamos primero el módulo de **Tipos de Producto / Inmueble (`/api/product-types`)** y enseguida el de **Propietarios (`/api/propietarios`)**.

#### **Parte A: Módulo `ProductTypes` (`/api/product-types`)**

##### **Paso 1: Crear el modelo `src/app/features/product-types/models/product-type.model.ts`**

Crea la carpeta `frontend/src/app/features/product-types/models/` y dentro el archivo `product-type.model.ts`:

``` typescript
export interface ProductType {

  id: number;

  name: string;

  description: string | null;

  status: 'active' | 'inactive';

  createdAt?: string;

  updatedAt?: string;

}

export interface CreateProductTypeDto {

  name: string;

  description?: string | null;

}

export type UpdateProductTypeDto = Partial<CreateProductTypeDto> & {

  status?: 'active' | 'inactive';

};
```

##### ![](images/clipboard-260081583.png)

##### **Paso 2: Crear el servicio `src/app/features/product-types/services/product-types.service.ts`**

Crea la carpeta `frontend/src/app/features/product-types/services/` y dentro el archivo `product-types.service.ts`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

import {

  CreateProductTypeDto,

  ProductType,

  UpdateProductTypeDto,

} from '../models/product-type.model';

@Injectable({

  providedIn: 'root',

})

export class ProductTypesService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/product-types`;

  readonly productTypes = signal<ProductType[]>([]);

  readonly loading = signal<boolean>(false);

  loadProductTypes(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<ProductType> | ProductType[]>>(

        `${this.apiUrl}?limit=100`,

      )

      .subscribe({

        next: (res) => {

          const data = res.data;

          const list = Array.isArray(data)

            ? data

            : (data?.items ?? data?.rows ?? []);

          this.productTypes.set(list);

          this.loading.set(false);

        },

        error: () => {

          this.loading.set(false);

        },

      });

  }

  create(dto: CreateProductTypeDto): Observable<ApiResponse<ProductType>> {

    return this.http

      .post<ApiResponse<ProductType>>(this.apiUrl, dto)

      .pipe(tap(() => this.loadProductTypes()));

  }

  update(id: number, dto: UpdateProductTypeDto): Observable<ApiResponse<ProductType>> {

    return this.http

      .patch<ApiResponse<ProductType>>(`${this.apiUrl}/${id}`, dto)

      .pipe(tap(() => this.loadProductTypes()));

  }

  toggleStatus(item: ProductType): Observable<ApiResponse<ProductType>> {

    const action = item.status === 'active' ? 'deactivate' : 'activate';

    return this.http

      .patch<ApiResponse<ProductType>>(`${this.apiUrl}/${item.id}/${action}`, {})

      .pipe(tap(() => this.loadProductTypes()));

  }

}
```

##### ![](images/clipboard-253002808.png)

##### **Paso 3: Generar el componente `ProductTypesPage`**

En tu terminal dentro de `frontend/`, ejecuta:

``` bash
npx ng g c features/product-types/pages/product-types-page --flat --skip-tests
```

![](images/clipboard-2235562992.png)

1.  Abre `frontend/src/app/features/product-types/pages/product-types-page.ts` y coloca su lógica:

``` typescript
import { Component, OnInit, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { TextareaModule } from 'primeng/textarea';

import { TagModule } from 'primeng/tag';

import { ProductTypesService } from '../services/product-types.service';

import { ProductType } from '../models/product-type.model';

@Component({

  selector: 'app-product-types-page',

  imports: [

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    TextareaModule,

    TagModule,

  ],

  templateUrl: './product-types-page.html',

  styleUrl: './product-types-page.css',

})

export class ProductTypesPage implements OnInit {

  protected readonly productTypesService = inject(ProductTypesService);

  private readonly fb = inject(FormBuilder);

  protected readonly dialogVisible = signal(false);

  protected readonly editingItem = signal<ProductType | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({

    name: ['', [Validators.required, Validators.minLength(3)]],

    description: [''],

  });

  ngOnInit(): void {

    this.productTypesService.loadProductTypes();

  }

  protected openNew(): void {

    this.editingItem.set(null);

    this.errorMsg.set(null);

    this.form.reset({ name: '', description: '' });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: ProductType): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      name: item.name,

      description: item.description ?? '',

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

    const current = this.editingItem();

    const request$ = current

      ? this.productTypesService.update(current.id, payload)

      : this.productTypesService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(

          err?.error?.message ?? 'Error al guardar el tipo de producto/inmueble.',

        );

      },

    });

  }

  protected onToggleStatus(item: ProductType): void {

    this.productTypesService.toggleStatus(item).subscribe();

  }

}
```

![](images/clipboard-160069380.png)

2.  Abre `frontend/src/app/features/product-types/pages/product-types-page.html` y escribe su plantilla:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Tipos de Producto / Categorías Inmobiliarias</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-04: Catálogo maestro de clasificación (/api/product-types)

      </p>

    </div>

    <div class="flex items-center gap-2">

      <p-button

        label="Recargar"

        icon="pi pi-refresh"

        severity="secondary"

        [outlined]="true"

        (onClick)="productTypesService.loadProductTypes()"

      />

      <p-button

        label="Nuevo Tipo"

        icon="pi pi-plus"

        severity="success"

        (onClick)="openNew()"

      />

    </div>

  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table

      [value]="productTypesService.productTypes()"

      [loading]="productTypesService.loading()"

      [paginator]="true"

      [rows]="10"

      [rowHover]="true"

      dataKey="id"

    >

      <ng-template #header>

        <tr>

          <th style="width: 5rem">ID</th>

          <th>Nombre de Categoría</th>

          <th>Descripción</th>

          <th style="width: 8rem">Estado</th>

          <th style="width: 8rem" class="text-right">Acciones</th>

        </tr>

      </ng-template>

      <ng-template #body let-item>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ item.id }}</td>

          <td class="font-semibold text-slate-800">{{ item.name }}</td>

          <td class="text-slate-600">{{ item.description || 'Sin descripción' }}</td>

          <td>

            <p-tag

              [value]="item.status === 'active' ? 'Activo' : 'Inactivo'"

              [severity]="item.status === 'active' ? 'success' : 'danger'"

            />

          </td>

          <td class="text-right space-x-1">

            <p-button

              icon="pi pi-pencil"

              [rounded]="true"

              [text]="true"

              severity="info"

              title="Editar"

              (onClick)="openEdit(item)"

            />

            <p-button

              [icon]="item.status === 'active' ? 'pi pi-ban' : 'pi pi-check'"

              [rounded]="true"

              [text]="true"

              [severity]="item.status === 'active' ? 'danger' : 'success'"

              [title]="item.status === 'active' ? 'Desactivar' : 'Reactivar'"

              (onClick)="onToggleStatus(item)"

            />

          </td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr>

          <td colspan="5" class="text-center py-8 text-slate-500">

            No hay tipos de producto registrados aún.

          </td>

        </tr>

      </ng-template>

    </p-table>

  </div>

  <p-dialog

    [header]="editingItem() ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'"

    [visible]="dialogVisible()"

    (visibleChange)="dialogVisible.set($event)"

    [modal]="true"

    [style]="{ width: '30rem' }"

  >

    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4 pt-2">

      @if (errorMsg()) {

        <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

          {{ errorMsg() }}

        </div>

      }

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Nombre *</label>

        <input pInputText formControlName="name" placeholder="Ej. Apartamento Residencial" />

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Descripción</label>

        <textarea

          pTextarea

          formControlName="description"

          rows="3"

          placeholder="Descripción opcional de la categoría..."

        ></textarea>

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

#### ![](images/clipboard-1247638106.png)

#### **Parte B: Módulo `Propietarios` (`/api/propietarios`) — Necesario para crear Inmuebles en el ISS-05**

Como en **Arrendo360** todo inmueble pertenece a un **Propietario**, creemos de una vez su servicio y página (tiene exactamente los mismos campos que `Client`: `tipoDocumento`, `numeroDocumento`, `nombre`, `telefono`, `email`, `isActive`).

##### **Paso 4: Crear modelo y servicio de Propietarios**

1.  Crea `frontend/src/app/features/propietarios/models/propietario.model.ts`:

``` typescript
export interface Propietario {

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

export interface CreatePropietarioDto {

  tipoDocumento: string;

  numeroDocumento: string;

  nombre: string;

  telefono?: string;

  email?: string;

}

export type UpdatePropietarioDto = Partial<CreatePropietarioDto> & {

  isActive?: boolean;

};
```

![](images/clipboard-3686961108.png)

2.  Crea `frontend/src/app/features/propietarios/services/propietarios.service.ts`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

import {

  CreatePropietarioDto,

  Propietario,

  UpdatePropietarioDto,

} from '../models/propietario.model';

@Injectable({

  providedIn: 'root',

})

export class PropietariosService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/propietarios`;

  private readonly headers = new HttpHeaders({ 'x-user-role': 'ADMIN' });

  readonly propietarios = signal<Propietario[]>([]);

  readonly loading = signal<boolean>(false);

  loadPropietarios(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<Propietario>>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          const list = res.data?.items ?? res.data?.rows ?? [];

          this.propietarios.set(list);

          this.loading.set(false);

        },

        error: () => {

          this.loading.set(false);

        },

      });

  }

  create(dto: CreatePropietarioDto): Observable<ApiResponse<Propietario>> {

    return this.http

      .post<ApiResponse<Propietario>>(this.apiUrl, dto, { headers: this.headers })

      .pipe(tap(() => this.loadPropietarios()));

  }

  update(id: number, dto: UpdatePropietarioDto): Observable<ApiResponse<Propietario>> {

    return this.http

      .patch<ApiResponse<Propietario>>(`${this.apiUrl}/${id}`, dto, { headers: this.headers })

      .pipe(tap(() => this.loadPropietarios()));

  }

}
```

##### ![](images/clipboard-3719659854.png)

##### **Paso 5: Generar el componente `PropietariosPage`**

En tu terminal dentro de `frontend/`:

``` bash
npx ng g c features/propietarios/pages/propietarios-page --flat --skip-tests
```

![](images/clipboard-3234027105.png)

1.  En `frontend/src/app/features/propietarios/pages/propietarios-page.ts`:

``` typescript
import { Component, OnInit, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { PropietariosService } from '../services/propietarios.service';

import { Propietario } from '../models/propietario.model';

@Component({

  selector: 'app-propietarios-page',

  imports: [

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './propietarios-page.html',

  styleUrl: './propietarios-page.css',

})

export class PropietariosPage implements OnInit {

  protected readonly propietariosService = inject(PropietariosService);

  private readonly fb = inject(FormBuilder);

  protected readonly dialogVisible = signal(false);

  protected readonly editingItem = signal<Propietario | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly documentTypes = [

    { label: 'Cédula de Ciudadanía (CC)', value: 'CC' },

    { label: 'Cédula de Extranjería (CE)', value: 'CE' },

    { label: 'NIT', value: 'NIT' },

  ];

  protected readonly form = this.fb.nonNullable.group({

    tipoDocumento: ['CC', [Validators.required]],

    numeroDocumento: ['', [Validators.required, Validators.minLength(5)]],

    nombre: ['', [Validators.required, Validators.minLength(3)]],

    telefono: [''],

    email: ['', [Validators.email]],

  });

  ngOnInit(): void {

    this.propietariosService.loadPropietarios();

  }

  protected openNew(): void {

    this.editingItem.set(null);

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

  protected openEdit(item: Propietario): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      tipoDocumento: item.tipoDocumento,

      numeroDocumento: item.numeroDocumento,

      nombre: item.nombre,

      telefono: item.telefono ?? '',

      email: item.email ?? '',

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

    const current = this.editingItem();

    const request$ = current

      ? this.propietariosService.update(current.id, payload)

      : this.propietariosService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al guardar el propietario.');

      },

    });

  }

}
```

![](images/clipboard-804089588.png)

2.  En `frontend/src/app/features/propietarios/pages/propietarios-page.html`:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Propietarios de Inmuebles</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-04: Gestión de titulares de inmuebles para dispersión de pagos (/api/propietarios)

      </p>

    </div>

    <div class="flex items-center gap-2">

      <p-button

        label="Recargar"

        icon="pi pi-refresh"

        severity="secondary"

        [outlined]="true"

        (onClick)="propietariosService.loadPropietarios()"

      />

      <p-button

        label="Nuevo Propietario"

        icon="pi pi-plus"

        severity="success"

        (onClick)="openNew()"

      />

    </div>

  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table

      [value]="propietariosService.propietarios()"

      [loading]="propietariosService.loading()"

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

      <ng-template #body let-item>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ item.id }}</td>

          <td>

            <span class="font-semibold text-slate-700">{{ item.tipoDocumento }}</span>

            {{ item.numeroDocumento }}

          </td>

          <td class="font-medium text-slate-800">{{ item.nombre }}</td>

          <td>{{ item.telefono || '—' }}</td>

          <td>{{ item.email || '—' }}</td>

          <td>

            <p-tag

              [value]="item.isActive ? 'Activo' : 'Inactivo'"

              [severity]="item.isActive ? 'success' : 'danger'"

            />

          </td>

          <td class="text-right">

            <p-button

              icon="pi pi-pencil"

              [rounded]="true"

              [text]="true"

              severity="info"

              title="Editar"

              (onClick)="openEdit(item)"

            />

          </td>

        </tr>

      </ng-template>

    </p-table>

  </div>

  <p-dialog

    [header]="editingItem() ? 'Editar Propietario' : 'Nuevo Propietario'"

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

          <input pInputText formControlName="numeroDocumento" placeholder="Ej. 1020304050" />

        </div>

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Nombre Completo *</label>

        <input pInputText formControlName="nombre" placeholder="Ej. Carlos Rodríguez" />

      </div>

      <div class="grid grid-cols-2 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Teléfono</label>

          <input pInputText formControlName="telefono" placeholder="Ej. +57 300 123 4567" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Correo Electrónico</label>

          <input pInputText formControlName="email" placeholder="carlos@ejemplo.com" />

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

#### ![](images/clipboard-3595908251.png)

#### **Paso 6: Registrar ambas rutas en `src/app/app.routes.ts`**

Abre `frontend/src/app/app.routes.ts` y agrega `'product-types'` y `'propietarios'`:

``` typescript
import { Routes } from '@angular/router';

import { Dashboard } from './features/dashboard/dashboard/dashboard';

import { ClientsPage } from './features/clients/pages/clients-page';

import { ProductTypesPage } from './features/product-types/pages/product-types-page';

import { PropietariosPage } from './features/propietarios/pages/propietarios-page';

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

    path: 'propietarios',

    component: PropietariosPage,

  },

  {

    path: 'product-types',

    component: ProductTypesPage,

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

![**TIPO DE PRODUCTO**](images/clipboard-3622082618.png)

![](images/clipboard-2776340496.png)

**PROPETARIOS**

![](images/clipboard-1394459957.png)

### **ISS-05 · Capa 2**

Construyamos las dos pantallas de este hito: **Inmuebles (`/api/inmuebles`)** y **Productos (`/api/products`)**.

#### **Parte A: Módulo `Inmuebles` (`/api/inmuebles`) vinculado a `Propietarios`**

##### **Paso 1: Crear el modelo `src/app/features/inmuebles/models/inmueble.model.ts`**

Crea la carpeta `frontend/src/app/features/inmuebles/models/` y dentro el archivo `inmueble.model.ts` (espejo de `InmuebleResponseDto`):

``` typescript
export interface Inmueble {

  id: number;

  propietarioId: number;

  nombre: string;

  descripcion: string;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

}

export interface CreateInmuebleDto {

  propietarioId: number;

  nombre: string;

  descripcion?: string;

}

export type UpdateInmuebleDto = Partial<CreateInmuebleDto> & {

  isActive?: boolean;

};
```

##### ![](images/clipboard-853150022.png)

##### **Paso 2: Crear el servicio `src/app/features/inmuebles/services/inmuebles.service.ts`**

Crea `frontend/src/app/features/inmuebles/services/inmuebles.service.ts`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

import { CreateInmuebleDto, Inmueble, UpdateInmuebleDto } from '../models/inmueble.model';

@Injectable({

  providedIn: 'root',

})

export class InmueblesService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/inmuebles`;

  private readonly headers = new HttpHeaders({ 'x-user-role': 'ADMIN' });

  readonly inmuebles = signal<Inmueble[]>([]);

  readonly loading = signal<boolean>(false);

  loadInmuebles(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<Inmueble>>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          const list = res.data?.items ?? res.data?.rows ?? [];

          this.inmuebles.set(list);

          this.loading.set(false);

        },

        error: () => {

          this.loading.set(false);

        },

      });

  }

  create(dto: CreateInmuebleDto): Observable<ApiResponse<Inmueble>> {

    return this.http

      .post<ApiResponse<Inmueble>>(this.apiUrl, dto, { headers: this.headers })

      .pipe(tap(() => this.loadInmuebles()));

  }

  update(id: number, dto: UpdateInmuebleDto): Observable<ApiResponse<Inmueble>> {

    return this.http

      .patch<ApiResponse<Inmueble>>(`${this.apiUrl}/${id}`, dto, { headers: this.headers })

      .pipe(tap(() => this.loadInmuebles()));

  }

}
```

##### ![](images/clipboard-3389712234.png)

##### **Paso 3: Generar el componente `InmueblesPage`**

En tu terminal dentro de `frontend/`:

``` bash
npx ng g c features/inmuebles/pages/inmuebles-page --flat --skip-tests
```

![](images/clipboard-3608244544.png)

1.  En `frontend/src/app/features/inmuebles/pages/inmuebles-page.ts`, inyectamos tanto `InmueblesService` como `PropietariosService` para poblar el selector `<p-select>` y resolver el nombre del propietario:

``` typescript
import { Component, OnInit, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { TextareaModule } from 'primeng/textarea';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { InmueblesService } from '../services/inmuebles.service';

import { PropietariosService } from '../../propietarios/services/propietarios.service';

import { Inmueble } from '../models/inmueble.model';

@Component({

  selector: 'app-inmuebles-page',

  imports: [

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    TextareaModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './inmuebles-page.html',

  styleUrl: './inmuebles-page.css',

})

export class InmueblesPage implements OnInit {

  protected readonly inmueblesService = inject(InmueblesService);

  protected readonly propietariosService = inject(PropietariosService);

  private readonly fb = inject(FormBuilder);

  protected readonly dialogVisible = signal(false);

  protected readonly editingItem = signal<Inmueble | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({

    propietarioId: [0, [Validators.required, Validators.min(1)]],

    nombre: ['', [Validators.required, Validators.minLength(3)]],

    descripcion: [''],

  });

  ngOnInit(): void {

    this.inmueblesService.loadInmuebles();

    this.propietariosService.loadPropietarios();

  }

  protected getPropietarioNombre(propietarioId: number): string {

    const found = this.propietariosService

      .propietarios()

      .find((p) => p.id === propietarioId);

    return found ? `${found.nombre} (${found.numeroDocumento})` : `ID #${propietarioId}`;

  }

  protected openNew(): void {

    this.editingItem.set(null);

    this.errorMsg.set(null);

    const firstOwner = this.propietariosService.propietarios()[0]?.id ?? 0;

    this.form.reset({

      propietarioId: firstOwner,

      nombre: '',

      descripcion: '',

    });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: Inmueble): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      propietarioId: item.propietarioId,

      nombre: item.nombre,

      descripcion: item.descripcion ?? '',

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

    const current = this.editingItem();

    const request$ = current

      ? this.inmueblesService.update(current.id, payload)

      : this.inmueblesService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al guardar el inmueble.');

      },

    });

  }

}
```

![](images/clipboard-2136580867.png)

2.  En `frontend/src/app/features/inmuebles/pages/inmuebles-page.html`:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Catálogo de Inmuebles</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-05: Propiedades registradas y vinculadas a su Propietario titular (/api/inmuebles)

      </p>

    </div>

    <div class="flex items-center gap-2">

      <p-button

        label="Recargar"

        icon="pi pi-refresh"

        severity="secondary"

        [outlined]="true"

        (onClick)="inmueblesService.loadInmuebles()"

      />

      <p-button

        label="Nuevo Inmueble"

        icon="pi pi-plus"

        severity="success"

        (onClick)="openNew()"

      />

    </div>

  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table

      [value]="inmueblesService.inmuebles()"

      [loading]="inmueblesService.loading()"

      [paginator]="true"

      [rows]="10"

      [rowHover]="true"

      dataKey="id"

    >

      <ng-template #header>

        <tr>

          <th style="width: 5rem">ID</th>

          <th>Inmueble</th>

          <th>Descripción</th>

          <th>Propietario Titular</th>

          <th>Estado</th>

          <th class="text-right">Acciones</th>

        </tr>

      </ng-template>

      <ng-template #body let-item>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ item.id }}</td>

          <td class="font-semibold text-slate-800">{{ item.nombre }}</td>

          <td class="text-slate-600 text-sm">{{ item.descripcion || '—' }}</td>

          <td>

            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">

              <i class="pi pi-id-card text-slate-500"></i>

              {{ getPropietarioNombre(item.propietarioId) }}

            </span>

          </td>

          <td>

            <p-tag

              [value]="item.isActive ? 'Disponible / Activo' : 'Inactivo'"

              [severity]="item.isActive ? 'success' : 'danger'"

            />

          </td>

          <td class="text-right">

            <p-button

              icon="pi pi-pencil"

              [rounded]="true"

              [text]="true"

              severity="info"

              title="Editar"

              (onClick)="openEdit(item)"

            />

          </td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr>

          <td colspan="6" class="text-center py-8 text-slate-500">

            No hay inmuebles registrados aún.

          </td>

        </tr>

      </ng-template>

    </p-table>

  </div>

  <p-dialog

    [header]="editingItem() ? 'Editar Inmueble' : 'Nuevo Inmueble'"

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

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Propietario Titular *</label>

        <p-select

          formControlName="propietarioId"

          [options]="propietariosService.propietarios()"

          optionLabel="nombre"

          optionValue="id"

          placeholder="Seleccione un propietario"

          appendTo="body"

        />

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Nombre / Identificador del Inmueble *</label>

        <input pInputText formControlName="nombre" placeholder="Ej. Apartamento 302 Edificio Los Sauces" />

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Descripción y Características</label>

        <textarea

          pTextarea

          formControlName="descripcion"

          rows="3"

          placeholder="Ej. 3 habitaciones, 2 baños, parqueadero privado..."

        ></textarea>

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

#### ![](images/clipboard-853530632.png)

#### **Parte B: Módulo `Products` (`/api/products`) vinculado a `ProductTypes`**

Fíjate en un detalle muy interesante de tu `products.controller.ts`: Cuando haces `GET /api/products`, el backend devuelve `{ products: [...], total, page, limit }` dentro de `res.data`. ¡Lo contemplaremos en el servicio!

##### **Paso 4: Crear el modelo `src/app/features/products/models/product.model.ts`**

Crea `frontend/src/app/features/products/models/product.model.ts`:

``` typescript
import { ProductType } from '../../product-types/models/product-type.model';

export interface Product {

  id: number;

  name: string;

  brand: string;

  price: number;

  min_stock: number;

  quantity: number;

  product_type_id: number;

  status: 'active' | 'inactive';

  product_type?: ProductType;

  createdAt?: string;

  updatedAt?: string;

}

export interface CreateProductDto {

  name: string;

  brand: string;

  price: number;

  min_stock?: number;

  quantity?: number;

  product_type_id: number;

  status?: 'active' | 'inactive';

}

export type UpdateProductDto = Partial<CreateProductDto>;
```

##### ![](images/clipboard-4155651058.png)

##### **Paso 5: Crear el servicio `src/app/features/products/services/products.service.ts`**

Crea `frontend/src/app/features/products/services/products.service.ts`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse } from '../../../core/models/api-response.model';

import { CreateProductDto, Product, UpdateProductDto } from '../models/product.model';

interface ProductsListPayload {

  products?: Product[];

  items?: Product[];

  total: number;

  page: number;

  limit: number;

}

@Injectable({

  providedIn: 'root',

})

export class ProductsService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/products`;

  readonly products = signal<Product[]>([]);

  readonly loading = signal<boolean>(false);

  loadProducts(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<ProductsListPayload>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          const list = res.data?.products ?? res.data?.items ?? [];

          this.products.set(list);

          this.loading.set(false);

        },

        error: () => {

          this.loading.set(false);

        },

      });

  }

  create(dto: CreateProductDto): Observable<ApiResponse<{ product: Product }>> {

    return this.http

      .post<ApiResponse<{ product: Product }>>(this.apiUrl, dto)

      .pipe(tap(() => this.loadProducts()));

  }

  update(id: number, dto: UpdateProductDto): Observable<ApiResponse<{ product: Product }>> {

    return this.http

      .patch<ApiResponse<{ product: Product }>>(`${this.apiUrl}/${id}`, dto)

      .pipe(tap(() => this.loadProducts()));

  }

  toggleStatus(item: Product): Observable<ApiResponse<{ product: Product }>> {

    const action = item.status === 'active' ? 'deactivate' : 'activate';

    return this.http

      .patch<ApiResponse<{ product: Product }>>(`${this.apiUrl}/${item.id}/${action}`, {})

      .pipe(tap(() => this.loadProducts()));

  }

}
```

##### ![](images/clipboard-560353313.png)

##### **Paso 6: Generar el componente `ProductsPage`**

En tu terminal dentro de `frontend/`:

``` bash
npx ng g c features/products/pages/products-page --flat --skip-tests
```

![](images/clipboard-94385857.png)

1.  En `frontend/src/app/features/products/pages/products-page.ts`, usamos `computed()` para filtrar solo los `ProductTypes` activos:

``` typescript
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { ProductsService } from '../services/products.service';

import { ProductTypesService } from '../../product-types/services/product-types.service';

import { Product } from '../models/product.model';

@Component({

  selector: 'app-products-page',

  imports: [

    DecimalPipe,

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    InputNumberModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './products-page.html',

  styleUrl: './products-page.css',

})

export class ProductsPage implements OnInit {

  protected readonly productsService = inject(ProductsService);

  protected readonly productTypesService = inject(ProductTypesService);

  private readonly fb = inject(FormBuilder);

  // Signal computado: solo permite elegir tipos de producto activos al crear/editar

  protected readonly activeProductTypes = computed(() =>

    this.productTypesService.productTypes().filter((t) => t.status === 'active'),

  );

  protected readonly dialogVisible = signal(false);

  protected readonly editingItem = signal<Product | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({

    name: ['', [Validators.required, Validators.minLength(2)]],

    brand: ['', [Validators.required, Validators.minLength(2)]],

    price: [0, [Validators.required, Validators.min(0.01)]],

    quantity: [0, [Validators.required, Validators.min(0)]],

    min_stock: [5, [Validators.required, Validators.min(0)]],

    product_type_id: [0, [Validators.required, Validators.min(1)]],

  });

  ngOnInit(): void {

    this.productsService.loadProducts();

    this.productTypesService.loadProductTypes();

  }

  protected getTypeName(item: Product): string {

    if (item.product_type?.name) return item.product_type.name;

    const found = this.productTypesService

      .productTypes()

      .find((t) => t.id === item.product_type_id);

    return found ? found.name : `Tipo #${item.product_type_id}`;

  }

  protected openNew(): void {

    this.editingItem.set(null);

    this.errorMsg.set(null);

    const firstType = this.activeProductTypes()[0]?.id ?? 0;

    this.form.reset({

      name: '',

      brand: '',

      price: 100000,

      quantity: 10,

      min_stock: 2,

      product_type_id: firstType,

    });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: Product): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      name: item.name,

      brand: item.brand,

      price: Number(item.price),

      quantity: Number(item.quantity),

      min_stock: Number(item.min_stock),

      product_type_id: item.product_type_id,

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

    const current = this.editingItem();

    const request$ = current

      ? this.productsService.update(current.id, payload)

      : this.productsService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al guardar el producto.');

      },

    });

  }

  protected onToggleStatus(item: Product): void {

    this.productsService.toggleStatus(item).subscribe();

  }

}
```

![](images/clipboard-2478371493.png)

2.  En `frontend/src/app/features/products/pages/products-page.html`:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Catálogo de Productos e Inventario</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-05: Gestión de productos, precios, control de stock mínimo y categoría (/api/products)

      </p>

    </div>

    <div class="flex items-center gap-2">

      <p-button

        label="Recargar"

        icon="pi pi-refresh"

        severity="secondary"

        [outlined]="true"

        (onClick)="productsService.loadProducts()"

      />

      <p-button

        label="Nuevo Producto"

        icon="pi pi-plus"

        severity="success"

        (onClick)="openNew()"

      />

    </div>

  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table

      [value]="productsService.products()"

      [loading]="productsService.loading()"

      [paginator]="true"

      [rows]="10"

      [rowHover]="true"

      dataKey="id"

    >

      <ng-template #header>

        <tr>

          <th>ID</th>

          <th>Producto</th>

          <th>Marca</th>

          <th>Categoría</th>

          <th>Precio</th>

          <th>Stock Actual / Mín.</th>

          <th>Estado</th>

          <th class="text-right">Acciones</th>

        </tr>

      </ng-template>

      <ng-template #body let-item>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ item.id }}</td>

          <td class="font-semibold text-slate-800">{{ item.name }}</td>

          <td>{{ item.brand }}</td>

          <td>

            <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">

              {{ getTypeName(item) }}

            </span>

          </td>

          <td class="font-mono font-medium text-emerald-700">

            ${{ item.price | number: '1.0-2' }}

          </td>

          <td>

            <div class="flex items-center gap-2">

              <span class="font-semibold">{{ item.quantity }}</span>

              <span class="text-xs text-slate-400">/ mín {{ item.min_stock }}</span>

              @if (item.quantity <= item.min_stock) {

                <p-tag value="Stock Bajo" severity="warn" />

              }

            </div>

          </td>

          <td>

            <p-tag

              [value]="item.status === 'active' ? 'Activo' : 'Inactivo'"

              [severity]="item.status === 'active' ? 'success' : 'danger'"

            />

          </td>

          <td class="text-right space-x-1">

            <p-button

              icon="pi pi-pencil"

              [rounded]="true"

              [text]="true"

              severity="info"

              title="Editar"

              (onClick)="openEdit(item)"

            />

            <p-button

              [icon]="item.status === 'active' ? 'pi pi-ban' : 'pi pi-check'"

              [rounded]="true"

              [text]="true"

              [severity]="item.status === 'active' ? 'danger' : 'success'"

              [title]="item.status === 'active' ? 'Desactivar' : 'Reactivar'"

              (onClick)="onToggleStatus(item)"

            />

          </td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr>

          <td colspan="8" class="text-center py-8 text-slate-500">

            No hay productos registrados aún.

          </td>

        </tr>

      </ng-template>

    </p-table>

  </div>

  <p-dialog

    [header]="editingItem() ? 'Editar Producto' : 'Nuevo Producto'"

    [visible]="dialogVisible()"

    (visibleChange)="dialogVisible.set($event)"

    [modal]="true"

    [style]="{ width: '34rem' }"

  >

    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4 pt-2">

      @if (errorMsg()) {

        <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

          {{ errorMsg() }}

        </div>

      }

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Tipo de Producto (Solo Activos) *</label>

        <p-select

          formControlName="product_type_id"

          [options]="activeProductTypes()"

          optionLabel="name"

          optionValue="id"

          placeholder="Seleccione una categoría activa"

          appendTo="body"

        />

      </div>

      <div class="grid grid-cols-2 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Nombre del Producto *</label>

          <input pInputText formControlName="name" placeholder="Ej. Kit Mantenimiento Eléctrico" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Marca / Proveedor *</label>

          <input pInputText formControlName="brand" placeholder="Ej. HomePro" />

        </div>

      </div>

      <div class="grid grid-cols-3 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Precio Unitario *</label>

          <p-inputnumber formControlName="price" mode="decimal" [min]="0.01" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Cantidad Stock *</label>

          <p-inputnumber formControlName="quantity" [min]="0" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Stock Mínimo *</label>

          <p-inputnumber formControlName="min_stock" [min]="0" />

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

#### ![](images/clipboard-1795919267.png)

#### **Paso 7: Registrar `/inmuebles` y `/products` en `src/app/app.routes.ts`**

Abre `frontend/src/app/app.routes.ts` y añade las dos rutas nuevas:

``` typescript
import { Routes } from '@angular/router';

import { Dashboard } from './features/dashboard/dashboard/dashboard';

import { ClientsPage } from './features/clients/pages/clients-page';

import { ProductTypesPage } from './features/product-types/pages/product-types-page';

import { PropietariosPage } from './features/propietarios/pages/propietarios-page';

import { InmueblesPage } from './features/inmuebles/pages/inmuebles-page';

import { ProductsPage } from './features/products/pages/products-page';

export const routes: Routes = [

  { path: 'dashboard', component: Dashboard },

  { path: 'clients', component: ClientsPage },

  { path: 'propietarios', component: PropietariosPage },

  { path: 'inmuebles', component: InmueblesPage },

  { path: 'product-types', component: ProductTypesPage },

  { path: 'products', component: ProductsPage },

  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: '**', redirectTo: 'dashboard' },

];
```

![](images/clipboard-404254680.png)

**INMUEBLE**

![](images/clipboard-169866896.png)

**PRODUCTOS**

![](images/clipboard-173189686.png)

## **ISS-06 · Capa 2: Construir (Paso a paso manual)**

Construyamos las dos vistas de este hito: **Contratos (`/api/contratos`)** y **Ventas (`/api/sales`)**.

### **Parte A: Módulo `Contratos de Arrendamiento` (`/api/contratos`)**

#### **Paso 1: Crear el modelo `src/app/features/contratos/models/contrato.model.ts`**

Crea `frontend/src/app/features/contratos/models/contrato.model.ts` (espejo de `ContratoResponseDto`):

``` typescript
export interface Contrato {

  id: number;

  inmuebleId: number;

  clienteId: number;

  numero: string;

  fechaInicio: string;

  fechaFin: string;

  valor: number;

  estado: string;

  createdAt?: string;

  updatedAt?: string;

}

export interface CreateContratoDto {

  inmuebleId: number;

  clienteId: number;

  numero: string;

  fechaInicio: string;

  fechaFin: string;

  valor: number;

  estado?: string;

}

export type UpdateContratoDto = Partial<CreateContratoDto>;
```

#### ![](images/clipboard-918020493.png)

#### **Paso 2: Crear el servicio `src/app/features/contratos/services/contratos.service.ts`**

Crea `frontend/src/app/features/contratos/services/contratos.service.ts`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

import { Contrato, CreateContratoDto, UpdateContratoDto } from '../models/contrato.model';

@Injectable({

  providedIn: 'root',

})

export class ContratosService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/contratos`;

  private readonly headers = new HttpHeaders({ 'x-user-role': 'ADMIN' });

  readonly contratos = signal<Contrato[]>([]);

  readonly loading = signal<boolean>(false);

  loadContratos(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<Contrato>>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          const list = res.data?.items ?? res.data?.rows ?? [];

          this.contratos.set(list);

          this.loading.set(false);

        },

        error: () => {

          this.loading.set(false);

        },

      });

  }

  create(dto: CreateContratoDto): Observable<ApiResponse<Contrato>> {

    return this.http

      .post<ApiResponse<Contrato>>(this.apiUrl, dto, { headers: this.headers })

      .pipe(tap(() => this.loadContratos()));

  }

  update(id: number, dto: UpdateContratoDto): Observable<ApiResponse<Contrato>> {

    return this.http

      .patch<ApiResponse<Contrato>>(`${this.apiUrl}/${id}`, dto, { headers: this.headers })

      .pipe(tap(() => this.loadContratos()));

  }

}
```

#### ![](images/clipboard-2547946159.png)

#### **Paso 3: Generar el componente `ContratosPage`**

En tu terminal dentro de `frontend/`:

``` bash
npx ng g c features/contratos/pages/contratos-page --flat --skip-tests
```

![](images/clipboard-3397884980.png)

1.  En `frontend/src/app/features/contratos/pages/contratos-page.ts`:

``` typescript
import { Component, OnInit, inject, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { ContratosService } from '../services/contratos.service';

import { InmueblesService } from '../../inmuebles/services/inmuebles.service';

import { ClientsService } from '../../clients/services/clients.service';

import { Contrato } from '../models/contrato.model';

@Component({

  selector: 'app-contratos-page',

  imports: [

    DecimalPipe,

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    InputNumberModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './contratos-page.html',

  styleUrl: './contratos-page.css',

})

export class ContratosPage implements OnInit {

  protected readonly contratosService = inject(ContratosService);

  protected readonly inmueblesService = inject(InmueblesService);

  protected readonly clientsService = inject(ClientsService);

  private readonly fb = inject(FormBuilder);

  protected readonly dialogVisible = signal(false);

  protected readonly editingItem = signal<Contrato | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly estadosContrato = [

    { label: 'ACTIVO', value: 'ACTIVO' },

    { label: 'FINALIZADO', value: 'FINALIZADO' },

    { label: 'CANCELADO', value: 'CANCELADO' },

  ];

  protected readonly form = this.fb.nonNullable.group({

    numero: ['', [Validators.required]],

    inmuebleId: [0, [Validators.required, Validators.min(1)]],

    clienteId: [0, [Validators.required, Validators.min(1)]],

    fechaInicio: ['2026-01-01', [Validators.required]],

    fechaFin: ['2026-12-31', [Validators.required]],

    valor: [1500000, [Validators.required, Validators.min(1)]],

    estado: ['ACTIVO', [Validators.required]],

  });

  ngOnInit(): void {

    this.contratosService.loadContratos();

    this.inmueblesService.loadInmuebles();

    this.clientsService.loadClients();

  }

  protected getInmuebleNombre(id: number): string {

    return (

      this.inmueblesService.inmuebles().find((i) => i.id === id)?.nombre ??

      `Inmueble #${id}`

    );

  }

  protected getClienteNombre(id: number): string {

    return (

      this.clientsService.clients().find((c) => c.id === id)?.nombre ??

      `Cliente #${id}`

    );

  }

  protected openNew(): void {

    this.editingItem.set(null);

    this.errorMsg.set(null);

    const nextNum = `CTR-2026-00${this.contratosService.contratos().length + 1}`;

    this.form.reset({

      numero: nextNum,

      inmuebleId: this.inmueblesService.inmuebles()[0]?.id ?? 0,

      clienteId: this.clientsService.clients()[0]?.id ?? 0,

      fechaInicio: '2026-01-01',

      fechaFin: '2026-12-31',

      valor: 1500000,

      estado: 'ACTIVO',

    });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: Contrato): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      numero: item.numero,

      inmuebleId: item.inmuebleId,

      clienteId: item.clienteId,

      fechaInicio: item.fechaInicio?.slice(0, 10) ?? '2026-01-01',

      fechaFin: item.fechaFin?.slice(0, 10) ?? '2026-12-31',

      valor: Number(item.valor),

      estado: item.estado,

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

    const current = this.editingItem();

    const request$ = current

      ? this.contratosService.update(current.id, payload)

      : this.contratosService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al guardar el contrato.');

      },

    });

  }

}
```

![](images/clipboard-1051688446.png)

2.  En `frontend/src/app/features/contratos/pages/contratos-page.html`:

```         
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Contratos de Arrendamiento</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-06: Vinculación jurídica entre Inmueble y Arrendatario con canon mensual (/api/contratos)

      </p>

    </div>

    <div class="flex items-center gap-2">

      <p-button

        label="Recargar"

        icon="pi pi-refresh"

        severity="secondary"

        [outlined]="true"

        (onClick)="contratosService.loadContratos()"

      />

      <p-button

        label="Nuevo Contrato"

        icon="pi pi-plus"

        severity="success"

        (onClick)="openNew()"

      />

    </div>

  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table

      [value]="contratosService.contratos()"

      [loading]="contratosService.loading()"

      [paginator]="true"

      [rows]="10"

      [rowHover]="true"

      dataKey="id"

    >

      <ng-template #header>

        <tr>

          <th>ID</th>

          <th>N° Contrato</th>

          <th>Inmueble</th>

          <th>Arrendatario</th>

          <th>Vigencia</th>

          <th>Canon Mensual</th>

          <th>Estado</th>

          <th class="text-right">Acciones</th>

        </tr>

      </ng-template>

      <ng-template #body let-item>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ item.id }}</td>

          <td class="font-mono font-semibold text-slate-800">{{ item.numero }}</td>

          <td>{{ getInmuebleNombre(item.inmuebleId) }}</td>

          <td>{{ getClienteNombre(item.clienteId) }}</td>

          <td class="text-xs text-slate-600">

            {{ item.fechaInicio }} → {{ item.fechaFin }}

          </td>

          <td class="font-mono font-semibold text-emerald-700">

            ${{ item.valor | number: '1.0-0' }}

          </td>

          <td>

            <p-tag

              [value]="item.estado"

              [severity]="item.estado === 'ACTIVO' ? 'success' : 'secondary'"

            />

          </td>

          <td class="text-right">

            <p-button

              icon="pi pi-pencil"

              [rounded]="true"

              [text]="true"

              severity="info"

              title="Editar"

              (onClick)="openEdit(item)"

            />

          </td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr>

          <td colspan="8" class="text-center py-8 text-slate-500">

            No hay contratos registrados aún.

          </td>

        </tr>

      </ng-template>

    </p-table>

  </div>

  <p-dialog

    [header]="editingItem() ? 'Editar Contrato' : 'Nuevo Contrato de Arrendamiento'"

    [visible]="dialogVisible()"

    (visibleChange)="dialogVisible.set($event)"

    [modal]="true"

    [style]="{ width: '36rem' }"

  >

    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4 pt-2">

      @if (errorMsg()) {

        <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

          {{ errorMsg() }}

        </div>

      }

      <div class="grid grid-cols-2 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Número de Contrato *</label>

          <input pInputText formControlName="numero" placeholder="Ej. CTR-2026-001" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Estado *</label>

          <p-select

            formControlName="estado"

            [options]="estadosContrato"

            optionLabel="label"

            optionValue="value"

            appendTo="body"

          />

        </div>

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Inmueble a Arrendar *</label>

        <p-select

          formControlName="inmuebleId"

          [options]="inmueblesService.inmuebles()"

          optionLabel="nombre"

          optionValue="id"

          appendTo="body"

        />

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Arrendatario (Cliente) *</label>

        <p-select

          formControlName="clienteId"

          [options]="clientsService.clients()"

          optionLabel="nombre"

          optionValue="id"

          appendTo="body"

        />

      </div>

      <div class="grid grid-cols-3 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Fecha Inicio *</label>

          <input pInputText type="date" formControlName="fechaInicio" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Fecha Fin *</label>

          <input pInputText type="date" formControlName="fechaFin" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Canon Mensual *</label>

          <p-inputnumber formControlName="valor" [min]="1" />

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

### ![](images/clipboard-2294746231.png)

### **Parte B: Módulo `Ventas y Detalle Transaccional` (`/api/sales`)**

#### **Paso 4: Crear el modelo `src/app/features/sales/models/sale.model.ts`**

Crea `frontend/src/app/features/sales/models/sale.model.ts`:

``` typescript
export interface SaleItem {

  id?: number;

  product_id: number;

  quantity: number;

  unit_price?: number;

  line_total?: number;

  status?: 'active' | 'inactive';

  product?: {

    id: number;

    name: string;

    brand: string;

  };

}

export interface Sale {

  id: number;

  sale_date: string;

  subtotal: number;

  tax: number;

  discounts: number;

  total: number;

  client_id: number;

  status: 'active' | 'inactive';

  items?: SaleItem[];

  client?: {

    id: number;

    nombre: string;

  };

}

export interface CreateSaleDto {

  client_id: number;

  tax?: number;

  discounts?: number;

  items: {

    product_id: number;

    quantity: number;

  }[];

}
```

#### ![](images/clipboard-3322418640.png)

#### **Paso 5: Crear el servicio `src/app/features/sales/services/sales.service.ts`**

Crea `frontend/src/app/features/sales/services/sales.service.ts`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse } from '../../../core/models/api-response.model';

import { CreateSaleDto, Sale } from '../models/sale.model';

interface SalesListPayload {

  sales?: Sale[];

  items?: Sale[];

  data?: Sale[];

  total: number;

}

@Injectable({

  providedIn: 'root',

})

export class SalesService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/sales`;

  readonly sales = signal<Sale[]>([]);

  readonly selectedSale = signal<Sale | null>(null);

  readonly loading = signal<boolean>(false);

  loadSales(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<SalesListPayload | Sale[]>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          const raw = res.data;

          const list = Array.isArray(raw)

            ? raw

            : (raw?.sales ?? raw?.items ?? raw?.data ?? []);

          this.sales.set(list);

          this.loading.set(false);

        },

        error: () => {

          this.loading.set(false);

        },

      });

  }

  getById(id: number): Observable<ApiResponse<Sale>> {

    return this.http.get<ApiResponse<Sale>>(`${this.apiUrl}/${id}`).pipe(

      tap((res) => this.selectedSale.set(res.data)),

    );

  }

  create(dto: CreateSaleDto): Observable<ApiResponse<Sale>> {

    return this.http

      .post<ApiResponse<Sale>>(this.apiUrl, dto)

      .pipe(tap(() => this.loadSales()));

  }

  toggleStatus(sale: Sale): Observable<ApiResponse<Sale>> {

    const action = sale.status === 'active' ? 'deactivate' : 'activate';

    return this.http

      .patch<ApiResponse<Sale>>(`${this.apiUrl}/${sale.id}/${action}`, {})

      .pipe(tap(() => this.loadSales()));

  }

}
```

#### ![](images/clipboard-4281700755.png)

#### **Paso 6: Generar el componente `SalesPage`**

En tu terminal dentro de `frontend/`:

``` bash
npx ng g c features/sales/pages/sales-page --flat --skip-tests
```

![](images/clipboard-1992527849.png)

1.  En `frontend/src/app/features/sales/pages/sales-page.ts`:

```         
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { DatePipe, DecimalPipe } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputNumberModule } from 'primeng/inputnumber';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { SalesService } from '../services/sales.service';

import { ClientsService } from '../../clients/services/clients.service';

import { ProductsService } from '../../products/services/products.service';

import { Sale } from '../models/sale.model';

interface DraftLine {

  product_id: number;

  name: string;

  price: number;

  quantity: number;

}

@Component({

  selector: 'app-sales-page',

  imports: [

    DatePipe,

    DecimalPipe,

    FormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputNumberModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './sales-page.html',

  styleUrl: './sales-page.css',

})

export class SalesPage implements OnInit {

  protected readonly salesService = inject(SalesService);

  protected readonly clientsService = inject(ClientsService);

  protected readonly productsService = inject(ProductsService);

  protected readonly createDialogVisible = signal(false);

  protected readonly detailDialogVisible = signal(false);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  // Estado del formulario Maestro-Detalle con Signals

  protected readonly selectedClientId = signal<number>(0);

  protected readonly selectedProductId = signal<number>(0);

  protected readonly selectedQty = signal<number>(1);

  protected readonly tax = signal<number>(0);

  protected readonly discounts = signal<number>(0);

  protected readonly draftLines = signal<DraftLine[]>([]);

  protected readonly activeClients = computed(() =>

    this.clientsService.clients().filter((c) => c.isActive),

  );

  protected readonly activeProducts = computed(() =>

    this.productsService

      .products()

      .filter((p) => p.status === 'active' && p.quantity > 0),

  );

  protected readonly draftSubtotal = computed(() =>

    this.draftLines().reduce((acc, l) => acc + l.price * l.quantity, 0),

  );

  protected readonly draftTotal = computed(() =>

    Math.max(0, this.draftSubtotal() + (this.tax() || 0) - (this.discounts() || 0)),

  );

  ngOnInit(): void {

    this.salesService.loadSales();

    this.clientsService.loadClients();

    this.productsService.loadProducts();

  }

  protected getClientName(clientId: number): string {

    return (

      this.clientsService.clients().find((c) => c.id === clientId)?.nombre ??

      `Cliente #${clientId}`

    );

  }

  protected openNewSale(): void {

    this.errorMsg.set(null);

    this.selectedClientId.set(this.activeClients()[0]?.id ?? 0);

    this.selectedProductId.set(this.activeProducts()[0]?.id ?? 0);

    this.selectedQty.set(1);

    this.tax.set(0);

    this.discounts.set(0);

    this.draftLines.set([]);

    this.createDialogVisible.set(true);

  }

  protected addLine(): void {

    const prod = this.activeProducts().find(

      (p) => p.id === this.selectedProductId(),

    );

    if (!prod || this.selectedQty() < 1) return;

    const existing = this.draftLines().find((l) => l.product_id === prod.id);

    if (existing) {

      this.draftLines.update((lines) =>

        lines.map((l) =>

          l.product_id === prod.id

            ? { ...l, quantity: l.quantity + this.selectedQty() }

            : l,

        ),

      );

    } else {

      this.draftLines.update((lines) => [

        ...lines,

        {

          product_id: prod.id,

          name: prod.name,

          price: Number(prod.price),

          quantity: this.selectedQty(),

        },

      ]);

    }

  }

  protected removeLine(productId: number): void {

    this.draftLines.update((lines) =>

      lines.filter((l) => l.product_id !== productId),

    );

  }

  protected submitSale(): void {

    if (!this.selectedClientId() || this.draftLines().length === 0) {

      this.errorMsg.set('Seleccione un cliente y agregue al menos un producto.');

      return;

    }

    this.saving.set(true);

    this.errorMsg.set(null);

    this.salesService

      .create({

        client_id: this.selectedClientId(),

        tax: this.tax() || 0,

        discounts: this.discounts() || 0,

        items: this.draftLines().map((l) => ({

          product_id: l.product_id,

          quantity: l.quantity,

        })),

      })

      .subscribe({

        next: () => {

          this.saving.set(false);

          this.createDialogVisible.set(false);

          this.productsService.loadProducts(); // Recarga el stock actualizado

        },

        error: (err) => {

          this.saving.set(false);

          this.errorMsg.set(err?.error?.message ?? 'Error al registrar la venta.');

        },

      });

  }

  protected viewDetail(sale: Sale): void {

    this.salesService.getById(sale.id).subscribe({

      next: () => this.detailDialogVisible.set(true),

    });

  }

  protected onToggleStatus(sale: Sale): void {

    this.salesService.toggleStatus(sale).subscribe({

      next: () => this.productsService.loadProducts(),

    });

  }

}
```

![](images/clipboard-2811510561.png)

2.  En `frontend/src/app/features/sales/pages/sales-page.html`:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Ventas y Transacciones (Maestro-Detalle)</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-06: Registro transaccional con descuento automático de stock (/api/sales)

      </p>

    </div>

    <div class="flex items-center gap-2">

      <p-button

        label="Recargar"

        icon="pi pi-refresh"

        severity="secondary"

        [outlined]="true"

        (onClick)="salesService.loadSales()"

      />

      <p-button

        label="Nueva Venta"

        icon="pi pi-cart-plus"

        severity="success"

        (onClick)="openNewSale()"

      />

    </div>

  </div>

  <!-- Tabla de Ventas -->

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table

      [value]="salesService.sales()"

      [loading]="salesService.loading()"

      [paginator]="true"

      [rows]="10"

      [rowHover]="true"

      dataKey="id"

    >

      <ng-template #header>

        <tr>

          <th>ID</th>

          <th>Fecha</th>

          <th>Cliente</th>

          <th>Subtotal</th>

          <th>Impuestos / Desc.</th>

          <th>Total</th>

          <th>Estado</th>

          <th class="text-right">Acciones</th>

        </tr>

      </ng-template>

      <ng-template #body let-sale>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ sale.id }}</td>

          <td class="text-xs text-slate-600">{{ sale.sale_date | date: 'short' }}</td>

          <td class="font-medium text-slate-800">{{ getClientName(sale.client_id) }}</td>

          <td class="font-mono">${{ sale.subtotal | number: '1.0-2' }}</td>

          <td class="text-xs text-slate-500">

            +${{ sale.tax | number: '1.0-2' }} / -${{ sale.discounts | number: '1.0-2' }}

          </td>

          <td class="font-mono font-bold text-emerald-700">

            ${{ sale.total | number: '1.0-2' }}

          </td>

          <td>

            <p-tag

              [value]="sale.status === 'active' ? 'Activa' : 'Anulada'"

              [severity]="sale.status === 'active' ? 'success' : 'danger'"

            />

          </td>

          <td class="text-right space-x-1">

            <p-button

              icon="pi pi-eye"

              [rounded]="true"

              [text]="true"

              severity="info"

              title="Ver líneas de detalle"

              (onClick)="viewDetail(sale)"

            />

            <p-button

              [icon]="sale.status === 'active' ? 'pi pi-ban' : 'pi pi-check'"

              [rounded]="true"

              [text]="true"

              [severity]="sale.status === 'active' ? 'danger' : 'success'"

              [title]="sale.status === 'active' ? 'Anular y restaurar stock' : 'Reactivar'"

              (onClick)="onToggleStatus(sale)"

            />

          </td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr>

          <td colspan="8" class="text-center py-8 text-slate-500">

            No hay ventas registradas aún.

          </td>

        </tr>

      </ng-template>

    </p-table>

  </div>

  <!-- Modal Crear Venta Maestro-Detalle -->

  <p-dialog

    header="Registrar Nueva Venta Transaccional"

    [visible]="createDialogVisible()"

    (visibleChange)="createDialogVisible.set($event)"

    [modal]="true"

    [style]="{ width: '42rem' }"

  >

    <div class="space-y-4 pt-2">

      @if (errorMsg()) {

        <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

          {{ errorMsg() }}

        </div>

      }

      <!-- Cabecera: Cliente -->

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Cliente Comprador (Activo) *</label>

        <p-select

          [ngModel]="selectedClientId()"

          (ngModelChange)="selectedClientId.set($event)"

          [options]="activeClients()"

          optionLabel="nombre"

          optionValue="id"

          appendTo="body"

        />

      </div>

      <!-- Agregar Línea de Producto -->

      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">

        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">

          Agregar Productos al Detalle

        </p>

        <div class="grid grid-cols-12 gap-3 items-end">

          <div class="col-span-7 flex flex-col gap-1">

            <label class="text-xs text-slate-600">Producto con Stock</label>

            <p-select

              [ngModel]="selectedProductId()"

              (ngModelChange)="selectedProductId.set($event)"

              [options]="activeProducts()"

              optionLabel="name"

              optionValue="id"

              appendTo="body"

            />

          </div>

          <div class="col-span-3 flex flex-col gap-1">

            <label class="text-xs text-slate-600">Cantidad</label>

            <p-inputnumber

              [ngModel]="selectedQty()"

              (ngModelChange)="selectedQty.set($event)"

              [min]="1"

            />

          </div>

          <div class="col-span-2">

            <p-button

              label="Añadir"

              icon="pi pi-plus"

              severity="info"

              (onClick)="addLine()"

            />

          </div>

        </div>

        <!-- Líneas agregadas -->

        @if (draftLines().length > 0) {

          <div class="bg-white rounded-lg border border-slate-200 overflow-hidden mt-2">

            <table class="w-full text-sm">

              <thead class="bg-slate-100 text-xs text-slate-600">

                <tr>

                  <th class="text-left p-2">Producto</th>

                  <th class="text-right p-2">Precio Unit.</th>

                  <th class="text-center p-2">Cant.</th>

                  <th class="text-right p-2">Subtotal</th>

                  <th class="p-2"></th>

                </tr>

              </thead>

              <tbody>

                @for (line of draftLines(); track line.product_id) {

                  <tr class="border-t border-slate-100">

                    <td class="p-2 font-medium">{{ line.name }}</td>

                    <td class="p-2 text-right font-mono">${{ line.price | number: '1.0-2' }}</td>

                    <td class="p-2 text-center font-semibold">{{ line.quantity }}</td>

                    <td class="p-2 text-right font-mono font-semibold">

                      ${{ line.price * line.quantity | number: '1.0-2' }}

                    </td>

                    <td class="p-2 text-right">

                      <p-button

                        icon="pi pi-trash"

                        severity="danger"

                        [text]="true"

                        [rounded]="true"

                        (onClick)="removeLine(line.product_id)"

                      />

                    </td>

                  </tr>

                }

              </tbody>

            </table>

          </div>

        }

      </div>

      <!-- Impuestos, Descuentos y Total Calculado -->

      <div class="grid grid-cols-3 gap-4 items-center pt-2">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Impuestos ($)</label>

          <p-inputnumber [ngModel]="tax()" (ngModelChange)="tax.set($event)" [min]="0" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Descuentos ($)</label>

          <p-inputnumber [ngModel]="discounts()" (ngModelChange)="discounts.set($event)" [min]="0" />

        </div>

        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-right">

          <p class="text-xs text-emerald-700 font-medium">Total Estimado</p>

          <p class="text-lg font-bold font-mono text-emerald-800">

            ${{ draftTotal() | number: '1.0-2' }}

          </p>

        </div>

      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-slate-200">

        <p-button

          label="Cancelar"

          severity="secondary"

          [text]="true"

          (onClick)="createDialogVisible.set(false)"

        />

        <p-button

          label="Confirmar Venta"

          icon="pi pi-check"

          severity="success"

          [loading]="saving()"

          (onClick)="submitSale()"

        />

      </div>

    </div>

  </p-dialog>

  <!-- Modal Ver Detalle de Venta -->

  <p-dialog

    header="Detalle de Venta #{{ salesService.selectedSale()?.id }}"

    [visible]="detailDialogVisible()"

    (visibleChange)="detailDialogVisible.set($event)"

    [modal]="true"

    [style]="{ width: '36rem' }"

  >

    @if (salesService.selectedSale(); as detail) {

      <div class="space-y-4">

        <div class="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">

          <div><span class="text-slate-500">Cliente:</span> <strong>{{ getClientName(detail.client_id) }}</strong></div>

          <div><span class="text-slate-500">Estado:</span> <strong>{{ detail.status }}</strong></div>

          <div><span class="text-slate-500">Subtotal:</span> ${{ detail.subtotal | number: '1.0-2' }}</div>

          <div><span class="text-slate-500">Total:</span> <strong class="text-emerald-700">${{ detail.total | number: '1.0-2' }}</strong></div>

        </div>

        <table class="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">

          <thead class="bg-slate-100 text-xs text-slate-600">

            <tr>

              <th class="text-left p-2">Producto ID</th>

              <th class="text-center p-2">Cant.</th>

              <th class="text-right p-2">Precio Unit.</th>

              <th class="text-right p-2">Total Línea</th>

            </tr>

          </thead>

          <tbody>

            @for (line of detail.items ?? []; track $index) {

              <tr class="border-t border-slate-100">

                <td class="p-2">{{ line.product?.name || ('Producto #' + line.product_id) }}</td>

                <td class="p-2 text-center">{{ line.quantity }}</td>

                <td class="p-2 text-right font-mono">${{ line.unit_price | number: '1.0-2' }}</td>

                <td class="p-2 text-right font-mono font-semibold">${{ line.line_total | number: '1.0-2' }}</td>

              </tr>

            }

          </tbody>

        </table>

      </div>

    }

  </p-dialog>

</div>
```

#### ![](images/clipboard-2429590726.png)

#### **Paso 7: Registrar `/contratos` y `/sales` en `src/app/app.routes.ts`**

Abre `frontend/src/app/app.routes.ts` y agrega las dos rutas nuevas:

``` typescript
import { Routes } from '@angular/router';

import { Dashboard } from './features/dashboard/dashboard/dashboard';

import { ClientsPage } from './features/clients/pages/clients-page';

import { ProductTypesPage } from './features/product-types/pages/product-types-page';

import { PropietariosPage } from './features/propietarios/pages/propietarios-page';

import { InmueblesPage } from './features/inmuebles/pages/inmuebles-page';

import { ProductsPage } from './features/products/pages/products-page';

import { ContratosPage } from './features/contratos/pages/contratos-page';

import { SalesPage } from './features/sales/pages/sales-page';

export const routes: Routes = [

  { path: 'dashboard', component: Dashboard },

  { path: 'clients', component: ClientsPage },

  { path: 'propietarios', component: PropietariosPage },

  { path: 'inmuebles', component: InmueblesPage },

  { path: 'contratos', component: ContratosPage },

  { path: 'product-types', component: ProductTypesPage },

  { path: 'products', component: ProductsPage },

  { path: 'sales', component: SalesPage },

  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: '**', redirectTo: 'dashboard' },

];
```

![](images/clipboard-1876304493.png)

**CONTRATOS**

![](images/clipboard-1299038141.png)

**VENTAS**

![](images/clipboard-1830085059.png)

Como ya está funcionando **Contratos (`/contratos`)** y **Ventas (`/sales`)** del **ISS-06**, vamos al cierre del **ISS-06 / ISS-07 (Cierre de Fase I)**:

1.  **Cobros Mensuales y Pagos (`/cobros`)** — Donde al registrar un pago de un cobro pendiente, el cobro cambia automáticamente su estado a `PAGADO`.

2.  **Dashboard Reactivo (`/dashboard`)** — Con tarjetas de métricas financieras y operativas en vivo usando `computed()` Signals de todas las entidades de **Arrendo360**.

## **Parte 1: `Cobros Mensuales y Pagos` (`/api/cobros` y `/api/pagos`)**

### **¿Cómo funciona el ciclo de Cobros y Pagos en tu Backend?**

En mi backend (`cobros.controller.ts` y `pagos.controller.ts`):

- **Emitir Cobro (`POST /api/cobros`):** Recibe `{ referenciaId, fecha, valor, observaciones }` donde `referenciaId` es el ID de un **Contrato ACTIVO**. El cobro nace con estado `'PENDIENTE'`.

- **Registrar Pago (`POST /api/pagos`):** Recibe `{ referenciaId, metodo, monto, fecha }` donde `referenciaId` es el ID del **Cobro Mensual**. Cuando el monto pagado cubre el valor del cobro, la entidad de dominio `CobroMensual` ejecuta `aplicarPago(monto)` y cambia automáticamente el cobro a `'PAGADO'`.

### **`Cobros y Pagos`**

#### **Paso 1: Crear el modelo `src/app/features/cobros/models/cobro.model.ts`**

Se crea la carpeta `frontend/src/app/features/cobros/models/` y dentro el archivo `cobro.model.ts`:

``` typescript
export interface Cobro {

  id: number;

  referenciaId: number; // ID del Contrato

  fecha: string;

  valor: number;

  estado: 'PENDIENTE' | 'PAGADO' | 'ANULADO' | string;

  observaciones?: string;

  createdAt?: string;

}

export interface CreateCobroDto {

  referenciaId: number;

  fecha: string;

  valor: number;

  observaciones?: string;

}

export interface Pago {

  id: number;

  referenciaTipo: string;

  referenciaId: number; // ID del Cobro

  metodo: string;

  monto: number;

  fecha: string;

  estado: string;

}

export interface CreatePagoDto {

  referenciaId: number;

  metodo: string;

  monto: number;

  fecha: string;

}
```

![](images/clipboard-2354921110.png)

#### **Paso 2: Crear el servicio `src/app/features/cobros/services/cobros.service.ts`**

Crea `frontend/src/app/features/cobros/services/cobros.service.ts`:

``` typescript
import { Injectable, inject, signal } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

import { Cobro, CreateCobroDto, CreatePagoDto, Pago } from '../models/cobro.model';

@Injectable({

  providedIn: 'root',

})

export class CobrosService {

  private readonly http = inject(HttpClient);

  private readonly cobrosUrl = `${environment.apiUrl}/cobros`;

  private readonly pagosUrl = `${environment.apiUrl}/pagos`;

  private readonly headers = new HttpHeaders({ 'x-user-role': 'ADMIN' });

  readonly cobros = signal<Cobro[]>([]);

  readonly pagos = signal<Pago[]>([]);

  readonly loading = signal<boolean>(false);

  loadAll(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<Cobro>>>(`${this.cobrosUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          this.cobros.set(res.data?.items ?? res.data?.rows ?? []);

          this.loading.set(false);

        },

        error: () => this.loading.set(false),

      });

    this.http

      .get<ApiResponse<PaginatedResponse<Pago>>>(`${this.pagosUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          this.pagos.set(res.data?.items ?? res.data?.rows ?? []);

        },

      });

  }

  createCobro(dto: CreateCobroDto): Observable<ApiResponse<Cobro>> {

    return this.http

      .post<ApiResponse<Cobro>>(this.cobrosUrl, dto, { headers: this.headers })

      .pipe(tap(() => this.loadAll()));

  }

  registrarPago(dto: CreatePagoDto): Observable<ApiResponse<Pago>> {

    return this.http

      .post<ApiResponse<Pago>>(this.pagosUrl, dto, { headers: this.headers })

      .pipe(tap(() => this.loadAll()));

  }

}
```

![](images/clipboard-746892643.png)

#### **Paso 3: Generar el componente `CobrosPage`**

En tu terminal dentro de `frontend/`:

``` bash
npx ng g c features/cobros/pages/cobros-page --flat --skip-tests
```

![](images/clipboard-581622913.png)

1.  En `frontend/src/app/features/cobros/pages/cobros-page.ts`:

``` typescript
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { CobrosService } from '../services/cobros.service';

import { ContratosService } from '../../contratos/services/contratos.service';

import { Cobro } from '../models/cobro.model';

@Component({

  selector: 'app-cobros-page',

  imports: [

    DecimalPipe,

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    InputNumberModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './cobros-page.html',

  styleUrl: './cobros-page.css',

})

export class CobrosPage implements OnInit {

  protected readonly cobrosService = inject(CobrosService);

  protected readonly contratosService = inject(ContratosService);

  private readonly fb = inject(FormBuilder);

  protected readonly cobroDialog = signal(false);

  protected readonly pagoDialog = signal(false);

  protected readonly selectedCobro = signal<Cobro | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly contratosActivos = computed(() =>

    this.contratosService.contratos().filter((c) => c.estado === 'ACTIVO'),

  );

  protected readonly metodosPago = [

    { label: 'Transferencia Bancaria', value: 'TRANSFERENCIA' },

    { label: 'PSE', value: 'PSE' },

    { label: 'Efectivo', value: 'EFECTIVO' },

    { label: 'Tarjeta', value: 'TARJETA' },

  ];

  protected readonly cobroForm = this.fb.nonNullable.group({

    referenciaId: [0, [Validators.required, Validators.min(1)]],

    fecha: ['2026-11-05', [Validators.required]],

    valor: [1500000, [Validators.required, Validators.min(1)]],

    observaciones: ['Canon mensual de arrendamiento'],

  });

  protected readonly pagoForm = this.fb.nonNullable.group({

    referenciaId: [0, [Validators.required]],

    metodo: ['TRANSFERENCIA', [Validators.required]],

    monto: [0, [Validators.required, Validators.min(1)]],

    fecha: ['2026-11-05', [Validators.required]],

  });

  ngOnInit(): void {

    this.cobrosService.loadAll();

    this.contratosService.loadContratos();

  }

  protected getContratoNumero(id: number): string {

    return (

      this.contratosService.contratos().find((c) => c.id === id)?.numero ??

      `Contrato #${id}`

    );

  }

  protected openNewCobro(): void {

    this.errorMsg.set(null);

    const first = this.contratosActivos()[0];

    this.cobroForm.reset({

      referenciaId: first?.id ?? 0,

      fecha: new Date().toISOString().slice(0, 10),

      valor: first ? Number(first.valor) : 1500000,

      observaciones: 'Canon mensual de arrendamiento',

    });

    this.cobroDialog.set(true);

  }

  protected openPayModal(cobro: Cobro): void {

    this.errorMsg.set(null);

    this.selectedCobro.set(cobro);

    this.pagoForm.reset({

      referenciaId: cobro.id,

      metodo: 'TRANSFERENCIA',

      monto: Number(cobro.valor),

      fecha: new Date().toISOString().slice(0, 10),

    });

    this.pagoDialog.set(true);

  }

  protected saveCobro(): void {

    if (this.cobroForm.invalid) return;

    this.saving.set(true);

    this.errorMsg.set(null);

    this.cobrosService.createCobro(this.cobroForm.getRawValue()).subscribe({

      next: () => {

        this.saving.set(false);

        this.cobroDialog.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al emitir el cobro.');

      },

    });

  }

  protected savePago(): void {

    if (this.pagoForm.invalid) return;

    this.saving.set(true);

    this.errorMsg.set(null);

    this.cobrosService.registrarPago(this.pagoForm.getRawValue()).subscribe({

      next: () => {

        this.saving.set(false);

        this.pagoDialog.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al registrar el pago.');

      },

    });

  }

}
```

![](images/clipboard-3015612914.png)

2.  En `frontend/src/app/features/cobros/pages/cobros-page.html`:

```         
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Cobros Mensuales y Recaudo de Pagos</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-06 / ISS-07: Emisión de cuentas de cobro y transición automática a PAGADO (/api/cobros y /api/pagos)

      </p>

    </div>

    <div class="flex items-center gap-2">

      <p-button

        label="Recargar"

        icon="pi pi-refresh"

        severity="secondary"

        [outlined]="true"

        (onClick)="cobrosService.loadAll()"

      />

      <p-button

        label="Emitir Cobro"

        icon="pi pi-plus"

        severity="success"

        (onClick)="openNewCobro()"

      />

    </div>

  </div>

  <!-- Tabla de Cuentas de Cobro -->

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <h3 class="text-sm font-bold text-slate-700 mb-3 px-2">Cuentas de Cobro Emitidas</h3>

    <p-table

      [value]="cobrosService.cobros()"

      [loading]="cobrosService.loading()"

      [paginator]="true"

      [rows]="8"

      dataKey="id"

    >

      <ng-template #header>

        <tr>

          <th>ID</th>

          <th>Contrato</th>

          <th>Fecha Emisión</th>

          <th>Observaciones</th>

          <th>Valor</th>

          <th>Estado</th>

          <th class="text-right">Acciones</th>

        </tr>

      </ng-template>

      <ng-template #body let-item>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ item.id }}</td>

          <td class="font-mono font-semibold text-slate-800">

            {{ getContratoNumero(item.referenciaId) }}

          </td>

          <td>{{ item.fecha }}</td>

          <td class="text-sm text-slate-600">{{ item.observaciones || '—' }}</td>

          <td class="font-mono font-semibold text-emerald-700">

            ${{ item.valor | number: '1.0-0' }}

          </td>

          <td>

            <p-tag

              [value]="item.estado"

              [severity]="item.estado === 'PAGADO' ? 'success' : 'warn'"

            />

          </td>

          <td class="text-right">

            @if (item.estado === 'PENDIENTE') {

              <p-button

                label="Registrar Pago"

                icon="pi pi-dollar"

                size="small"

                severity="info"

                (onClick)="openPayModal(item)"

              />

            } @else {

              <span class="text-xs text-emerald-600 font-medium">

                <i class="pi pi-check-circle"></i> Recaudado

              </span>

            }

          </td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr>

          <td colspan="7" class="text-center py-6 text-slate-500">

            No hay cuentas de cobro emitidas aún.

          </td>

        </tr>

      </ng-template>

    </p-table>

  </div>

  <!-- Modal Emitir Cobro -->

  <p-dialog

    header="Emitir Cuenta de Cobro Mensual"

    [visible]="cobroDialog()"

    (visibleChange)="cobroDialog.set($event)"

    [modal]="true"

    [style]="{ width: '32rem' }"

  >

    <form [formGroup]="cobroForm" (ngSubmit)="saveCobro()" class="space-y-4 pt-2">

      @if (errorMsg()) {

        <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

          {{ errorMsg() }}

        </div>

      }

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Contrato Activo *</label>

        <p-select

          formControlName="referenciaId"

          [options]="contratosActivos()"

          optionLabel="numero"

          optionValue="id"

          appendTo="body"

        />

      </div>

      <div class="grid grid-cols-2 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Fecha de Cobro *</label>

          <input pInputText type="date" formControlName="fecha" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Valor a Cobrar *</label>

          <p-inputnumber formControlName="valor" [min]="1" />

        </div>

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Concepto / Observaciones</label>

        <input pInputText formControlName="observaciones" />

      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-slate-200">

        <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="cobroDialog.set(false)" />

        <p-button label="Emitir Cobro" icon="pi pi-check" severity="success" type="submit" [loading]="saving()" />

      </div>

    </form>

  </p-dialog>

  <!-- Modal Registrar Pago -->

  <p-dialog

    header="Aplicar Pago a Cobro #{{ selectedCobro()?.id }}"

    [visible]="pagoDialog()"

    (visibleChange)="pagoDialog.set($event)"

    [modal]="true"

    [style]="{ width: '30rem' }"

  >

    <form [formGroup]="pagoForm" (ngSubmit)="savePago()" class="space-y-4 pt-2">

      @if (errorMsg()) {

        <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

          {{ errorMsg() }}

        </div>

      }

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Método de Pago *</label>

        <p-select

          formControlName="metodo"

          [options]="metodosPago"

          optionLabel="label"

          optionValue="value"

          appendTo="body"

        />

      </div>

      <div class="grid grid-cols-2 gap-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Monto Recaudado *</label>

          <p-inputnumber formControlName="monto" [min]="1" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Fecha de Pago *</label>

          <input pInputText type="date" formControlName="fecha" />

        </div>

      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-slate-200">

        <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="pagoDialog.set(false)" />

        <p-button label="Confirmar Pago" icon="pi pi-check" severity="success" type="submit" [loading]="saving()" />

      </div>

    </form>

  </p-dialog>

</div>
```

![](images/clipboard-3075172642.png)

## Parte 2: **ISS-07 — Dashboard Ejecutivo con Agregaciones Reactivas (`computed()`)**

Ahora trabajamos el componente `Dashboard` para que consolide en tiempo real las métricas de **Clientes, Inmuebles, Contratos, Recaudo de Cobros y Ventas** usando `computed()`, tal como pide el **ISS-07** de cierre de la Fase I:

1.  Abre `frontend/src/app/features/dashboard/dashboard/dashboard.ts` y actualízalo así:

``` typescript
import { Component, OnInit, computed, inject } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { HealthService } from '../../../core/services/health.service';

import { ClientsService } from '../../clients/services/clients.service';

import { InmueblesService } from '../../inmuebles/services/inmuebles.service';

import { ContratosService } from '../../contratos/services/contratos.service';

import { CobrosService } from '../../cobros/services/cobros.service';

import { ProductsService } from '../../products/services/products.service';

import { SalesService } from '../../sales/services/sales.service';

@Component({

  selector: 'app-dashboard',

  imports: [DecimalPipe, RouterLink, ButtonModule],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css',

})

export class Dashboard implements OnInit {

  protected readonly healthService = inject(HealthService);

  protected readonly clientsService = inject(ClientsService);

  protected readonly inmueblesService = inject(InmueblesService);

  protected readonly contratosService = inject(ContratosService);

  protected readonly cobrosService = inject(CobrosService);

  protected readonly productsService = inject(ProductsService);

  protected readonly salesService = inject(SalesService);

  // KPIs reactivos calculados con computed() Signals (ISS-07)

  protected readonly activeClientsCount = computed(

    () => this.clientsService.clients().filter((c) => c.isActive).length,

  );

  protected readonly activeContratosCount = computed(

    () => this.contratosService.contratos().filter((c) => c.estado === 'ACTIVO').length,

  );

  protected readonly totalRecaudadoPagos = computed(() =>

    this.cobrosService

      .pagos()

      .reduce((acc, p) => acc + Number(p.monto || 0), 0),

  );

  protected readonly totalSalesRevenue = computed(() =>

    this.salesService

      .sales()

      .filter((s) => s.status === 'active')

      .reduce((acc, s) => acc + Number(s.total || 0), 0),

  );

  protected readonly lowStockCount = computed(

    () =>

      this.productsService

        .products()

        .filter((p) => p.status === 'active' && p.quantity <= p.min_stock).length,

  );

  ngOnInit(): void {

    this.refreshAll();

  }

  protected refreshAll(): void {

    this.healthService.checkHealth();

    this.clientsService.loadClients();

    this.inmueblesService.loadInmuebles();

    this.contratosService.loadContratos();

    this.cobrosService.loadAll();

    this.productsService.loadProducts();

    this.salesService.loadSales();

  }

}
```

![](images/clipboard-1564658195.png)

2.  Abre `frontend/src/app/features/dashboard/dashboard/dashboard.html` y coloca los indicadores ejecutivos:

``` html
<div class="space-y-6">

  <!-- Cabecera -->

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Panel Ejecutivo — Arrendo360</h2>

      <p class="text-sm text-slate-500 mt-1">

        ISS-07: Resumen operativo e indicadores reactivos con Signals computed()

      </p>

    </div>

    <div class="flex items-center gap-3">

      @if (healthService.isOnline()) {

        <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-200">

          <i class="pi pi-check-circle"></i>

          API Conectada

        </span>

      }

      <p-button

        label="Actualizar KPIs"

        icon="pi pi-refresh"

        severity="success"

        [loading]="healthService.checking()"

        (onClick)="refreshAll()"

      />

    </div>

  </div>

  <!-- Tarjetas de KPIs (Grid 4 columnas) -->

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

    <!-- KPI 1: Arrendatarios -->

    <a routerLink="/clients" class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer">

      <div class="flex items-center justify-between">

        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Clientes Activos</span>

        <i class="pi pi-users text-emerald-600 text-xl"></i>

      </div>

      <p class="text-3xl font-bold text-slate-800 mt-2">{{ activeClientsCount() }}</p>

      <p class="text-xs text-slate-500 mt-1">De {{ clientsService.clients().length }} registrados</p>

    </a>

    <!-- KPI 2: Inmuebles y Contratos -->

    <a routerLink="/contratos" class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer">

      <div class="flex items-center justify-between">

        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Contratos Activos</span>

        <i class="pi pi-file-edit text-blue-600 text-xl"></i>

      </div>

      <p class="text-3xl font-bold text-slate-800 mt-2">{{ activeContratosCount() }}</p>

      <p class="text-xs text-slate-500 mt-1">{{ inmueblesService.inmuebles().length }} inmuebles en catálogo</p>

    </a>

    <!-- KPI 3: Recaudo Arrendamientos -->

    <a routerLink="/cobros" class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer">

      <div class="flex items-center justify-between">

        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Recaudo Cánones</span>

        <i class="pi pi-wallet text-amber-600 text-xl"></i>

      </div>

      <p class="text-2xl font-bold font-mono text-emerald-700 mt-2">

        ${{ totalRecaudadoPagos() | number: '1.0-0' }}

      </p>

      <p class="text-xs text-slate-500 mt-1">{{ cobrosService.cobros().length }} cuentas de cobro</p>

    </a>

    <!-- KPI 4: Ventas Comerciales y Stock -->

    <a routerLink="/sales" class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer">

      <div class="flex items-center justify-between">

        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Ventas Activas</span>

        <i class="pi pi-shopping-cart text-purple-600 text-xl"></i>

      </div>

      <p class="text-2xl font-bold font-mono text-slate-800 mt-2">

        ${{ totalSalesRevenue() | number: '1.0-2' }}

      </p>

      <p class="text-xs text-amber-600 font-medium mt-1">

        {{ lowStockCount() }} producto(s) con stock bajo

      </p>

    </a>

  </div>

</div>
```

![](images/clipboard-1089524549.png)

3.  Por último, registra la ruta `/cobros` en `frontend/src/app/app.routes.ts`:

```         
import { CobrosPage } from './features/cobros/pages/cobros-page';

// ... y dentro de routes:

  { path: 'cobros', component: CobrosPage },
```

![](images/clipboard-2961579665.png)

**COBROS Y PAGOS**

![](images/clipboard-3933776749.png)

**DASHBOARD**

![](images/clipboard-1362092256.png)

![](images/clipboard-3981024562.png)

## Ahora entramos a la **Fase II: Seguridad, Autenticación JWT y RBAC — ISS-08: Autenticación JWT, Login, Registro, `/me`, Logout e Interceptor HTTP**

### **ISS-08 · Capa 1: Aprender (Cómo funciona el ciclo de sesión JWT en Angular 22 + Tu Backend)**

En el **ISS-08** construiremos **4 piezas clave** en el frontend:

1.  **`AuthService` con Signals (`currentUser`, `isAuthenticated`, `userRole`):** Almacena los tokens en `localStorage` y mantiene el estado reactivo del usuario en toda la app.

2.  **Interceptor Funcional HTTP (`authInterceptor`):** En lugar de poner headers manuales en cada servicio, este interceptor se registra en `app.config.ts` e inyecta automáticamente `Authorization: Bearer <token>` y `x-user-role: <role>` en **todas** las peticiones HTTP hacia `localhost:3002`.

3.  **Página de Login y Registro (`/login`):** Permite iniciar sesión o crear un usuario (con selector de rol: `ADMIN`, `ASESOR`, `CARTERA`, `MANTENIMIENTO`, `PROPIETARIO_CONSULTA`).

4.  **Header Reactivo:** Muestra el nombre real y el rol del usuario autenticado en la barra superior, junto con el botón de **Cerrar Sesión** (o **Iniciar Sesión**).

### **ISS-08 · Capa 2**

Sigue estos **6 pasos**:

#### **Paso 1: Crear el modelo `src/app/core/auth/models/auth.model.ts`**

Crea la carpeta `frontend/src/app/core/auth/models/` y dentro el archivo `auth.model.ts` (espejo de `AuthResponseDto`):

``` typescript
export type UserRole =

  | 'ADMIN'

  | 'ASESOR'

  | 'CARTERA'

  | 'MANTENIMIENTO'

  | 'PROPIETARIO_CONSULTA';

export interface UserProfile {

  id: number;

  nombre: string;

  email: string;

  role: UserRole;

  isActive: boolean;

}

export interface AuthResponse {

  accessToken: string;

  refreshToken?: string;

  user: UserProfile;

}

export interface LoginDto {

  email: string;

  password: string;

}

export interface RegisterDto {

  nombre: string;

  email: string;

  password: string;

  role?: UserRole;

}
```

![](images/clipboard-1145212001.png)

#### **Paso 2: Crear el servicio central `src/app/core/auth/services/auth.service.ts`**

Crea la carpeta `frontend/src/app/core/auth/services/` y dentro el archivo `auth.service.ts`:

``` typescript
import { Injectable, computed, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse } from '../../models/api-response.model';

import {

  AuthResponse,

  LoginDto,

  RegisterDto,

  UserProfile,

  UserRole,

} from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'arrendo360_access_token';

const REFRESH_TOKEN_KEY = 'arrendo360_refresh_token';

const USER_KEY = 'arrendo360_user';

@Injectable({

  providedIn: 'root',

})

export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals de estado de sesión

  readonly currentUser = signal<UserProfile | null>(this.loadStoredUser());

  readonly accessToken = signal<string | null>(

    localStorage.getItem(ACCESS_TOKEN_KEY),

  );

  readonly refreshToken = signal<string | null>(

    localStorage.getItem(REFRESH_TOKEN_KEY),

  );

  // Signals derivados (computed)

  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.currentUser());

  readonly userRole = computed<UserRole>(() => this.currentUser()?.role ?? 'ADMIN');

  private loadStoredUser(): UserProfile | null {

    try {

      const raw = localStorage.getItem(USER_KEY);

      return raw ? (JSON.parse(raw) as UserProfile) : null;

    } catch {

      return null;

    }

  }

  private saveSession(auth: AuthResponse): void {

    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);

    this.accessToken.set(auth.accessToken);

    if (auth.refreshToken) {

      localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);

      this.refreshToken.set(auth.refreshToken);

    }

    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));

    this.currentUser.set(auth.user);

  }

  clearSession(): void {

    localStorage.removeItem(ACCESS_TOKEN_KEY);

    localStorage.removeItem(REFRESH_TOKEN_KEY);

    localStorage.removeItem(USER_KEY);

    this.accessToken.set(null);

    this.refreshToken.set(null);

    this.currentUser.set(null);

  }

  login(dto: LoginDto): Observable<ApiResponse<AuthResponse>> {

    return this.http

      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, dto)

      .pipe(tap((res) => this.saveSession(res.data)));

  }

  register(dto: RegisterDto): Observable<ApiResponse<AuthResponse>> {

    return this.http

      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, dto)

      .pipe(tap((res) => this.saveSession(res.data)));

  }

  fetchMe(): Observable<ApiResponse<UserProfile>> {

    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/me`).pipe(

      tap((res) => {

        localStorage.setItem(USER_KEY, JSON.stringify(res.data));

        this.currentUser.set(res.data);

      }),

    );

  }

  rotateRefreshToken(): Observable<ApiResponse<AuthResponse>> {

    const token = this.refreshToken();

    return this.http

      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, {

        refreshToken: token,

      })

      .pipe(tap((res) => this.saveSession(res.data)));

  }

  logout(): void {

    const refreshToken = this.refreshToken();

    if (this.accessToken()) {

      this.http

        .post(`${this.apiUrl}/logout`, { refreshToken })

        .subscribe({

          next: () => this.finishLogout(),

          error: () => this.finishLogout(),

        });

    } else {

      this.finishLogout();

    }

  }

  private finishLogout(): void {

    this.clearSession();

    void this.router.navigate(['/login']);

  }

  hasRole(allowedRoles: UserRole[]): boolean {

    const current = this.currentUser();

    if (!current) return false;

    return allowedRoles.includes(current.role);

  }

}
```

![](images/clipboard-3972943580.png)

#### **Paso 3: Crear el Interceptor HTTP (`src/app/core/auth/interceptors/auth.interceptor.ts`)**

Crea la carpeta `frontend/src/app/core/auth/interceptors/` y dentro el archivo `auth.interceptor.ts`. Este interceptor adjunta automáticamente el token JWT (`Authorization: Bearer ...`) y el rol activo (`x-user-role`) a cada petición que salga hacia el backend:

``` typescript
import { HttpInterceptorFn } from '@angular/common/http';

import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);

  const token = authService.accessToken();

  const role = authService.currentUser()?.role;

  const headers: Record<string, string> = {};

  if (token) {

    headers['Authorization'] = `Bearer ${token}`;

  }

  if (role) {

    headers['x-user-role'] = role;

  } else if (!req.headers.has('x-user-role')) {

    headers['x-user-role'] = 'ADMIN';

  }

  if (Object.keys(headers).length > 0) {

    req = req.clone({ setHeaders: headers });

  }

  return next(req);

};
```

![](images/clipboard-890279132.png)

Y regístralo en `frontend/src/app/app.config.ts` cambiando `provideHttpClient(withFetch())` por `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`:

``` typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

import { provideRouter } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { providePrimeNG } from 'primeng/config';

import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';

import { authInterceptor } from './core/auth/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {

  providers: [

    provideZonelessChangeDetection(),

    provideRouter(routes),

    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

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

![](images/clipboard-852597970.png)

#### **Paso 4: Generar la página de Login / Registro (`LoginPage`)**

En tu terminal dentro de `frontend/`:

``` bash
npx ng g c features/auth/pages/login-page --flat --skip-tests
```

![](images/clipboard-1210302033.png)

1.  En `frontend/src/app/features/auth/pages/login-page.ts`:

``` typescript
import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { InputTextModule } from 'primeng/inputtext';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../core/auth/services/auth.service';

import { UserRole } from '../../../core/auth/models/auth.model';

@Component({

  selector: 'app-login-page',

  imports: [

    ReactiveFormsModule,

    ButtonModule,

    InputTextModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './login-page.html',

  styleUrl: './login-page.css',

})

export class LoginPage {

  protected readonly authService = inject(AuthService);

  private readonly fb = inject(FormBuilder);

  private readonly router = inject(Router);

  protected readonly mode = signal<'login' | 'register'>('login');

  protected readonly loading = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly successMsg = signal<string | null>(null);

  protected readonly rolesOptions: { label: string; value: UserRole }[] = [

    { label: 'Administrador General (ADMIN)', value: 'ADMIN' },

    { label: 'Asesor Inmobiliario (ASESOR)', value: 'ASESOR' },

    { label: 'Gestor de Cartera (CARTERA)', value: 'CARTERA' },

    { label: 'Mantenimiento (MANTENIMIENTO)', value: 'MANTENIMIENTO' },

    { label: 'Propietario Solo Consulta (PROPIETARIO_CONSULTA)', value: 'PROPIETARIO_CONSULTA' },

  ];

  protected readonly loginForm = this.fb.nonNullable.group({

    email: ['admin.master@arrendo360.com', [Validators.required, Validators.email]],

    password: ['PasswordSegura2026*', [Validators.required, Validators.minLength(6)]],

  });

  protected readonly registerForm = this.fb.nonNullable.group({

    nombre: ['Alberto Ortiz', [Validators.required, Validators.minLength(2)]],

    email: ['betto@arrendo360.com', [Validators.required, Validators.email]],

    password: ['PasswordSegura2026*', [Validators.required, Validators.minLength(6)]],

    role: ['ADMIN' as UserRole, [Validators.required]],

  });

  protected onLogin(): void {

    if (this.loginForm.invalid) return;

    this.loading.set(true);

    this.errorMsg.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({

      next: () => {

        this.loading.set(false);

        void this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        this.loading.set(false);

        this.errorMsg.set(

          err?.error?.message ?? 'Credenciales inválidas. Puedes registrar la cuenta en la pestaña Registro.',

        );

      },

    });

  }

  protected onRegister(): void {

    if (this.registerForm.invalid) return;

    this.loading.set(true);

    this.errorMsg.set(null);

    this.authService.register(this.registerForm.getRawValue()).subscribe({

      next: () => {

        this.loading.set(false);

        void this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        this.loading.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al registrar el usuario.');

      },

    });

  }

  protected testVerifyMe(): void {

    this.errorMsg.set(null);

    this.successMsg.set(null);

    this.authService.fetchMe().subscribe({

      next: (res) => {

        this.successMsg.set(`Token verificado en /api/auth/me: ${res.data.nombre} (${res.data.role})`);

      },

      error: (err) => {

        this.errorMsg.set(err?.error?.message ?? 'Token inválido o expirado.');

      },

    });

  }

  protected testRotateToken(): void {

    this.errorMsg.set(null);

    this.successMsg.set(null);

    this.authService.rotateRefreshToken().subscribe({

      next: () => {

        this.successMsg.set('¡Refresh Token rotado con éxito (RTR - RFC 6819)!');

      },

      error: (err) => {

        this.errorMsg.set(err?.error?.message ?? 'No se pudo rotar el Refresh Token.');

      },

    });

  }

}
```

![](images/clipboard-1397701770.png)

2.  En `frontend/src/app/features/auth/pages/login-page.html`:

``` html
<div class="max-w-xl mx-auto space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">

    <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">

      <div>

        <h2 class="text-xl font-bold text-slate-800">Autenticación JWT y Sesión (ISS-08)</h2>

        <p class="text-xs text-slate-500 mt-1">

          Control de identidad, Access Token, Refresh Token (RTR) y perfil /api/auth/me

        </p>

      </div>

      <div class="flex gap-2">

        <p-button

          label="Iniciar Sesión"

          size="small"

          [severity]="mode() === 'login' ? 'success' : 'secondary'"

          [outlined]="mode() !== 'login'"

          (onClick)="mode.set('login')"

        />

        <p-button

          label="Registrar"

          size="small"

          [severity]="mode() === 'register' ? 'success' : 'secondary'"

          [outlined]="mode() !== 'register'"

          (onClick)="mode.set('register')"

        />

      </div>

    </div>

    @if (errorMsg()) {

      <div class="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

        {{ errorMsg() }}

      </div>

    }

    @if (successMsg()) {

      <div class="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">

        {{ successMsg() }}

      </div>

    }

    @if (mode() === 'login') {

      <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Correo Electrónico *</label>

          <input pInputText formControlName="email" placeholder="usuario@arrendo360.com" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Contraseña *</label>

          <input pInputText type="password" formControlName="password" />

        </div>

        <p-button

          label="Ingresar con JWT"

          icon="pi pi-sign-in"

          severity="success"

          type="submit"

          [loading]="loading()"

          styleClass="w-full"

        />

      </form>

    } @else {

      <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4">

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Nombre Completo *</label>

          <input pInputText formControlName="nombre" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Correo Electrónico *</label>

          <input pInputText formControlName="email" />

        </div>

        <div class="grid grid-cols-2 gap-4">

          <div class="flex flex-col gap-1">

            <label class="text-xs font-semibold text-slate-600">Contraseña *</label>

            <input pInputText type="password" formControlName="password" />

          </div>

          <div class="flex flex-col gap-1">

            <label class="text-xs font-semibold text-slate-600">Rol RBAC *</label>

            <p-select

              formControlName="role"

              [options]="rolesOptions"

              optionLabel="label"

              optionValue="value"

              appendTo="body"

            />

          </div>

        </div>

        <p-button

          label="Crear Cuenta y Autenticar"

          icon="pi pi-user-plus"

          severity="success"

          type="submit"

          [loading]="loading()"

          styleClass="w-full"

        />

      </form>

    }

  </div>

  <!-- Panel de Sesión Activa (si ya inició sesión) -->

  @if (authService.currentUser(); as user) {

    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">

      <div class="flex items-center justify-between">

        <div>

          <h3 class="text-sm font-bold text-slate-800">Sesión Activa: {{ user.nombre }}</h3>

          <p class="text-xs text-slate-500">{{ user.email }}</p>

        </div>

        <p-tag [value]="user.role" severity="info" />

      </div>

      <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100">

        <p-button

          label="Verificar /api/auth/me"

          icon="pi pi-verified"

          size="small"

          severity="info"

          [outlined]="true"

          (onClick)="testVerifyMe()"

        />

        <p-button

          label="Rotar Refresh Token (RTR)"

          icon="pi pi-sync"

          size="small"

          severity="warn"

          [outlined]="true"

          (onClick)="testRotateToken()"

        />

        <p-button

          label="Cerrar Sesión (Logout)"

          icon="pi pi-power-off"

          size="small"

          severity="danger"

          (onClick)="authService.logout()"

        />

      </div>

    </div>

  }

</div>
```

![](images/clipboard-1021777707.png)

#### **Paso 5: Conectar el `Header` al usuario en sesión (`header.ts` y `header.html`)**

1.   Abre `frontend/src/app/core/layout/header/header.ts` e inyecta `AuthService` y `RouterLink`:

``` typescript
import { Component, inject, input, output } from '@angular/core';

import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { TagModule } from 'primeng/tag';

import { AuthService } from '../../auth/services/auth.service';

@Component({

  selector: 'app-header',

  imports: [RouterLink, ButtonModule, TagModule],

  templateUrl: './header.html',

  styleUrl: './header.css',

})

export class Header {

  protected readonly authService = inject(AuthService);

  readonly sidebarOpen = input<boolean>(true);

  readonly toggleSidebar = output<void>();

}
```

![](images/clipboard-2733243067.png)

2.  Abre `frontend/src/app/core/layout/header/header.html` y actualiza el bloque derecho del usuario para que muestre el usuario real logueado y su rol:

```         
<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">

  <div class="flex items-center gap-3">

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

  <div class="flex items-center gap-4">

    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">

      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>

      API Local :3002

    </span>

    @if (authService.currentUser(); as user) {

      <div class="flex items-center gap-2">

        <a routerLink="/login" class="flex items-center gap-2 text-sm text-slate-700 font-medium hover:text-emerald-700 cursor-pointer">

          <i class="pi pi-user text-emerald-600"></i>

          <span>{{ user.nombre }}</span>

        </a>

        <p-tag [value]="user.role" severity="info" />

        <p-button

          icon="pi pi-sign-out"

          [rounded]="true"

          [text]="true"

          severity="danger"

          title="Cerrar Sesión"

          (onClick)="authService.logout()"

        />

      </div>

    } @else {

      <a routerLink="/login">

        <p-button

          label="Iniciar Sesión"

          icon="pi pi-sign-in"

          size="small"

          severity="success"

          [outlined]="true"

        />

      </a>

    }

  </div>

</header>
```

![](images/clipboard-2677030189.png)

#### **Paso 6: Registrar `/login` en `app.routes.ts` y en el menú `aside.ts`**

1.   En `frontend/src/app/app.routes.ts`, importa `LoginPage` y agrega:

    ``` typescript
    { path: 'login', component: LoginPage },
    ```

    ![](images/clipboard-646441111.png)

2.  En `frontend/src/app/core/layout/aside/aside.ts`, agrega un cuarto grupo al final de `navGroups`:

    ``` typescript
    {

      title: 'Seguridad y RBAC (Fase II)',

      items: [

        { label: 'Sesión y JWT (/me)', icon: 'pi pi-shield', route: '/login' },

      ],

    },
    ```

    ![](images/clipboard-4043376695.png)

**SESION Y JWT**

![](images/clipboard-2568372132.png)

## **ISS-09 a ISS-14** 

## **Aprender (Cómo funciona el Control de Acceso RBAC en Angular 22)**

En esta etapa final aprendemos **3 patrones profesionales de arquitectura en Angular**:

1.  **Functional Route Guards (`authGuard` y `roleGuard` — ISS-09):**

    - En Angular moderno ya no usamos clases que implementen `CanActivate`. Usamos funciones puras `CanActivateFn` que inyectan `AuthService` y `Router` con `inject()` y deciden si el usuario puede entrar a la ruta o debe ser redirigido a `/login`.

2.   **Directiva Estructural Reactiva (`*appHasRole` — ISS-09):**

    - Con una directiva estructural personalizada usando `effect()`, `TemplateRef` y `ViewContainerRef`, podemos poner `*appHasRole="['ADMIN', 'ASESOR']"` en cualquier botón de la interfaz, y si el usuario inicia sesión como `PROPIETARIO_CONSULTA`, el botón desaparece del DOM automáticamente.

3.  **Filtrado dinámico del `Aside` con `computed()` y Consola RBAC / RefreshTokens (ISS-10 a ISS-14):**

    - Cada ítem del menú lateral declara qué roles pueden verlo (`roles?: UserRole[]`), y un `computed()` en `Aside` filtra en vivo las opciones según el rol del usuario en sesión.

    - Además completamos las tres vistas que faltaban en tu menú lateral (**Liquidaciones `/liquidaciones`**, **Mantenimiento `/mantenimiento`** y **Consola RBAC & RefreshTokens `/rbac`**) para que **ningún botón del menú quede sin pantalla**.

## **ISS-09 a ISS-14** 

Sigue estos **6 pasos**:

### **Paso 1: Crear los Guards Funcionales (`src/app/core/auth/guards/auth.guard.ts`)**

Crea la carpeta `frontend/src/app/core/auth/guards/` y dentro el archivo `auth.guard.ts`:

``` typescript
import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

import { UserRole } from '../models/auth.model';

/**

 * Guard que exige sesión JWT activa (Modalidad PROTECTED)

 */

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);

  const router = inject(Router);

  if (authService.isAuthenticated()) {

    return true;

  }

  return router.createUrlTree(['/login']);

};

/**

 * Guard parametrizado por roles permitidos (Modalidad RBAC)

 */

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {

  return () => {

    const authService = inject(AuthService);

    const router = inject(Router);

    if (!authService.isAuthenticated()) {

      return router.createUrlTree(['/login']);

    }

    if (authService.hasRole(allowedRoles)) {

      return true;

    }

    return router.createUrlTree(['/dashboard']);

  };

};
```

![](images/clipboard-3459166048.png)

### **Paso 2: Crear la Directiva Estructural Reactiva `*appHasRole` (`src/app/core/auth/directives/has-role.directive.ts`)**

Crea la carpeta `frontend/src/app/core/auth/directives/` y dentro el archivo `has-role.directive.ts`:

``` typescript
import {

  Directive,

  TemplateRef,

  ViewContainerRef,

  effect,

  inject,

  input,

} from '@angular/core';

import { AuthService } from '../services/auth.service';

import { UserRole } from '../models/auth.model';

@Directive({

  selector: '[appHasRole]',

})

export class HasRoleDirective {

  private readonly templateRef = inject(TemplateRef<unknown>);

  private readonly viewContainer = inject(ViewContainerRef);

  private readonly authService = inject(AuthService);

  readonly appHasRole = input.required<UserRole[]>();

  private isRendered = false;

  constructor() {

    effect(() => {

      const roles = this.appHasRole();

      const currentRole = this.authService.userRole();

      const canShow = roles.includes(currentRole);

      if (canShow && !this.isRendered) {

        this.viewContainer.createEmbeddedView(this.templateRef);

        this.isRendered = true;

      } else if (!canShow && this.isRendered) {

        this.viewContainer.clear();

        this.isRendered = false;

      }

    });

  }

}
```

![](images/clipboard-2811357609.png)

### **Paso 3: Crear las páginas de `Liquidaciones` (`/liquidaciones`) y `Mantenimiento` (`/mantenimiento`)**

Para que todos los enlaces inmobiliarios del menú lateral funcionen contra tu backend:

1.  Ejecuta en tu terminal dentro de `frontend/`:

``` bash
npx ng g c features/liquidaciones/pages/liquidaciones-page --flat --skip-tests

npx ng g c features/mantenimiento/pages/mantenimiento-page --flat --skip-tests

npx ng g c features/auth/pages/rbac-page --flat --skip-tests
```

![](images/clipboard-1314322535.png)

2.  Abre `frontend/src/app/features/liquidaciones/pages/liquidaciones-page.ts` (consume `/api/distribuciones-pago` con el gate estricto de saldo del propietario):

``` typescript
import { Component, OnInit, inject, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { environment } from '../../../../environments/environment';

import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

import { CobrosService } from '../../cobros/services/cobros.service';

import { PropietariosService } from '../../propietarios/services/propietarios.service';

export interface DistribucionPago {

  id: number;

  pagoId: number;

  propietarioId: number;

  nombre: string;

  descripcion?: string;

  monto: number;

  estado: string;

}

@Component({

  selector: 'app-liquidaciones-page',

  imports: [

    DecimalPipe,

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    InputNumberModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './liquidaciones-page.html',

  styleUrl: './liquidaciones-page.css',

})

export class LiquidacionesPage implements OnInit {

  private readonly http = inject(HttpClient);

  protected readonly cobrosService = inject(CobrosService);

  protected readonly propietariosService = inject(PropietariosService);

  private readonly fb = inject(FormBuilder);

  private readonly apiUrl = `${environment.apiUrl}/distribuciones-pago`;

  protected readonly items = signal<DistribucionPago[]>([]);

  protected readonly loading = signal(false);

  protected readonly dialogVisible = signal(false);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({

    pagoId: [0, [Validators.required, Validators.min(1)]],

    propietarioId: [0, [Validators.required, Validators.min(1)]],

    nombre: ['Liquidación neta a propietario (90%)', [Validators.required]],

    descripcion: ['Descuento de 10% comisión inmobiliaria'],

    monto: [900000, [Validators.required, Validators.min(1)]],

  });

  ngOnInit(): void {

    this.load();

    this.cobrosService.loadAll();

    this.propietariosService.loadPropietarios();

  }

  protected load(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<DistribucionPago>>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          this.items.set(res.data?.items ?? res.data?.rows ?? []);

          this.loading.set(false);

        },

        error: () => this.loading.set(false),

      });

  }

  protected openNew(): void {

    this.errorMsg.set(null);

    const pago = this.cobrosService.pagos()[0];

    const prop = this.propietariosService.propietarios()[0];

    this.form.reset({

      pagoId: pago?.id ?? 0,

      propietarioId: prop?.id ?? 0,

      nombre: 'Liquidación neta a propietario (90%)',

      descripcion: 'Descuento 10% comisión administración',

      monto: pago ? Math.round(Number(pago.monto) * 0.9) : 900000,

    });

    this.dialogVisible.set(true);

  }

  protected save(): void {

    if (this.form.invalid) return;

    this.saving.set(true);

    this.errorMsg.set(null);

    this.http.post(this.apiUrl, this.form.getRawValue()).subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

        this.load();

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(

          err?.error?.message ?? 'Error al liquidar (verifica que el monto no supere el pago).',

        );

      },

    });

  }

}
```

![](images/clipboard-1853404731.png)

3.  Abre `frontend/src/app/features/liquidaciones/pages/liquidaciones-page.html`:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Liquidaciones a Propietarios</h2>

      <p class="text-sm text-slate-500 mt-1">

        Dispersión financiera con control estricto de invariante de saldo (/api/distribuciones-pago)

      </p>

    </div>

    <p-button label="Nueva Liquidación" icon="pi pi-plus" severity="success" (onClick)="openNew()" />

  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table [value]="items()" [loading]="loading()" [paginator]="true" [rows]="8">

      <ng-template #header>

        <tr>

          <th>ID</th>

          <th>Pago Base</th>

          <th>Propietario ID</th>

          <th>Concepto</th>

          <th>Monto Dispersado</th>

          <th>Estado</th>

        </tr>

      </ng-template>

      <ng-template #body let-item>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ item.id }}</td>

          <td>Pago #{{ item.pagoId }}</td>

          <td>Propietario #{{ item.propietarioId }}</td>

          <td class="font-medium">{{ item.nombre }}</td>

          <td class="font-mono font-semibold text-emerald-700">${{ item.monto | number: '1.0-0' }}</td>

          <td><p-tag [value]="item.estado || 'LIQUIDADO'" severity="success" /></td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr><td colspan="6" class="text-center py-6 text-slate-500">Sin liquidaciones registradas.</td></tr>

      </ng-template>

    </p-table>

  </div>

  <p-dialog

    header="Dispersar Liquidación a Propietario"

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

          <label class="text-xs font-semibold text-slate-600">Pago Recaudado *</label>

          <p-select formControlName="pagoId" [options]="cobrosService.pagos()" optionLabel="id" optionValue="id" appendTo="body" />

        </div>

        <div class="flex flex-col gap-1">

          <label class="text-xs font-semibold text-slate-600">Propietario *</label>

          <p-select formControlName="propietarioId" [options]="propietariosService.propietarios()" optionLabel="nombre" optionValue="id" appendTo="body" />

        </div>

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Concepto *</label>

        <input pInputText formControlName="nombre" />

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Monto a Transferir *</label>

        <p-inputnumber formControlName="monto" [min]="1" />

      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-slate-200">

        <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="dialogVisible.set(false)" />

        <p-button label="Liquidar" icon="pi pi-check" severity="success" type="submit" [loading]="saving()" />

      </div>

    </form>

  </p-dialog>

</div>
```

![](images/clipboard-1934058626.png)

### **Paso 4: Configurar la página de `Mantenimiento` (`/mantenimiento`)**

1.  Abre `frontend/src/app/features/mantenimiento/pages/mantenimiento-page.ts`:

```         
import { Component, OnInit, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { environment } from '../../../../environments/environment';

import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

import { InmueblesService } from '../../inmuebles/services/inmuebles.service';

export interface TicketMantenimiento {

  id: number;

  inmuebleId: number;

  nombre: string;

  descripcion: string;

  estado: string;

}

@Component({

  selector: 'app-mantenimiento-page',

  imports: [

    ReactiveFormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputTextModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './mantenimiento-page.html',

  styleUrl: './mantenimiento-page.css',

})

export class MantenimientoPage implements OnInit {

  private readonly http = inject(HttpClient);

  protected readonly inmueblesService = inject(InmueblesService);

  private readonly fb = inject(FormBuilder);

  private readonly apiUrl = `${environment.apiUrl}/tickets-mantenimiento`;

  protected readonly tickets = signal<TicketMantenimiento[]>([]);

  protected readonly loading = signal(false);

  protected readonly dialogVisible = signal(false);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({

    inmuebleId: [0, [Validators.required, Validators.min(1)]],

    nombre: ['', [Validators.required]],

    descripcion: ['', [Validators.required]],

  });

  ngOnInit(): void {

    this.load();

    this.inmueblesService.loadInmuebles();

  }

  protected load(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<TicketMantenimiento>>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          this.tickets.set(res.data?.items ?? res.data?.rows ?? []);

          this.loading.set(false);

        },

        error: () => this.loading.set(false),

      });

  }

  protected openNew(): void {

    this.form.reset({

      inmuebleId: this.inmueblesService.inmuebles()[0]?.id ?? 0,

      nombre: '',

      descripcion: '',

    });

    this.dialogVisible.set(true);

  }

  protected save(): void {

    if (this.form.invalid) return;

    this.saving.set(true);

    this.http.post(this.apiUrl, this.form.getRawValue()).subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

        this.load();

      },

      error: () => this.saving.set(false),

    });

  }

}
```

![](images/clipboard-4219426734.png)

2.  Abre `frontend/src/app/features/mantenimiento/pages/mantenimiento-page.html`:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Tickets de Mantenimiento Locativo</h2>

      <p class="text-sm text-slate-500 mt-1">

        Solicitudes correctivas y preventivas sobre inmuebles (/api/tickets-mantenimiento)

      </p>

    </div>

    <p-button label="Nuevo Ticket" icon="pi pi-plus" severity="success" (onClick)="openNew()" />

  </div>

  <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

    <p-table [value]="tickets()" [loading]="loading()" [paginator]="true" [rows]="8">

      <ng-template #header>

        <tr>

          <th>ID</th>

          <th>Inmueble ID</th>

          <th>Asunto</th>

          <th>Descripción</th>

          <th>Estado</th>

        </tr>

      </ng-template>

      <ng-template #body let-item>

        <tr>

          <td class="font-mono text-xs text-slate-500">#{{ item.id }}</td>

          <td>Inmueble #{{ item.inmuebleId }}</td>

          <td class="font-semibold">{{ item.nombre }}</td>

          <td class="text-sm text-slate-600">{{ item.descripcion }}</td>

          <td><p-tag [value]="item.estado || 'ABIERTO'" severity="warn" /></td>

        </tr>

      </ng-template>

      <ng-template #emptymessage>

        <tr><td colspan="5" class="text-center py-6 text-slate-500">No hay tickets de mantenimiento registrados.</td></tr>

      </ng-template>

    </p-table>

  </div>

  <p-dialog header="Registrar Ticket de Mantenimiento" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)" [modal]="true" [style]="{ width: '30rem' }">

    <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4 pt-2">

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Inmueble Afectado *</label>

        <p-select formControlName="inmuebleId" [options]="inmueblesService.inmuebles()" optionLabel="nombre" optionValue="id" appendTo="body" />

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Título del Daño / Solicitud *</label>

        <input pInputText formControlName="nombre" placeholder="Ej. Fuga en tubería de baño" />

      </div>

      <div class="flex flex-col gap-1">

        <label class="text-xs font-semibold text-slate-600">Descripción Detallada *</label>

        <input pInputText formControlName="descripcion" placeholder="Detalle de la novedad..." />

      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-slate-200">

        <p-button label="Cancelar" severity="secondary" [text]="true" (onClick)="dialogVisible.set(false)" />

        <p-button label="Guardar Ticket" icon="pi pi-check" severity="success" type="submit" [loading]="saving()" />

      </div>

    </form>

  </p-dialog>

</div>
```

![](images/clipboard-1627237546.png)

### **Paso 5: Configurar la Consola de `RBAC, Roles, Recursos y RefreshTokens` (`rbac-page.ts` y `rbac-page.html` — ISS-10 a ISS-14)** 

1.  Abre `frontend/src/app/features/auth/pages/rbac-page.ts`:

``` typescript
import { Component, inject, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { TagModule } from 'primeng/tag';

import { environment } from '../../../../environments/environment';

import { AuthService } from '../../../core/auth/services/auth.service';

import { HasRoleDirective } from '../../../core/auth/directives/has-role.directive';

@Component({

  selector: 'app-rbac-page',

  imports: [TableModule, ButtonModule, TagModule, HasRoleDirective],

  templateUrl: './rbac-page.html',

  styleUrl: './rbac-page.css',

})

export class RbacPage {

  protected readonly authService = inject(AuthService);

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  protected readonly statusMsg = signal<string | null>(null);

  protected readonly catalogRoles = [

    { name: 'ADMIN', description: 'Administrador General del Sistema (Acceso Total)', status: 'active' },

    { name: 'ASESOR', description: 'Asesor Comercial e Inmobiliario (Clientes, Inmuebles, Contratos)', status: 'active' },

    { name: 'CARTERA', description: 'Gestor de Cartera y Cobranzas (Cobros, Pagos, Liquidaciones)', status: 'active' },

    { name: 'MANTENIMIENTO', description: 'Técnico de Mantenimiento (Tickets y Órdenes)', status: 'active' },

    { name: 'PROPIETARIO_CONSULTA', description: 'Propietario con permisos exclusivos de consulta (Solo Lectura)', status: 'active' },

  ];

  protected readonly catalogResources = [

    { method: 'GET', path: '/api/health', mode: 'OPEN', roles: 'Público' },

    { method: 'GET', path: '/api/auth/me', mode: 'PROTECTED', roles: 'Cualquier JWT válido' },

    { method: 'POST', path: '/api/clients', mode: 'RBAC', roles: 'ADMIN, ASESOR' },

    { method: 'POST', path: '/api/contratos', mode: 'RBAC', roles: 'ADMIN, ASESOR' },

    { method: 'POST', path: '/api/cobros', mode: 'RBAC', roles: 'ADMIN, CARTERA' },

    { method: 'POST', path: '/api/pagos', mode: 'RBAC', roles: 'ADMIN, CARTERA' },

    { method: 'POST', path: '/api/distribuciones-pago', mode: 'RBAC', roles: 'ADMIN' },

    { method: 'POST', path: '/api/auth/refresh', mode: 'RTR', roles: 'Refresh Token Activo' },

  ];

  protected rotateSession(): void {

    this.authService.rotateRefreshToken().subscribe({

      next: () =>

        this.statusMsg.set('✅ Nuevo par de tokens (Access + Refresh) emitido por rotación RTR.'),

      error: (err) =>

        this.statusMsg.set(err?.error?.message ?? 'Error al rotar Refresh Token.'),

    });

  }

  protected revokeFamily(): void {

    const refreshToken = this.authService.refreshToken();

    if (!refreshToken) return;

    this.http.post(`${this.apiUrl}/revoke`, { refreshToken }).subscribe({

      next: () => {

        this.statusMsg.set('🔒 Familia de Refresh Tokens revocada exitosamente.');

        this.authService.clearSession();

      },

    });

  }

}
```

![](images/clipboard-2658657546.png)

2.  Abre `frontend/src/app/features/auth/pages/rbac-page.html`:

``` html
<div class="space-y-6">

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">

    <div>

      <h2 class="text-xl font-bold text-slate-800">Administración RBAC, Permisos y RefreshTokens (ISS-09 a ISS-14)</h2>

      <p class="text-sm text-slate-500 mt-1">

        Catálogo de Roles, Recursos HTTP en 3 modalidades (OPEN, PROTECTED, RBAC) y Sesiones Renovables (RTR)

      </p>

    </div>

    <!-- Demostración de Directiva Estructural *appHasRole (Solo visible para ADMIN) -->

    <div *appHasRole="['ADMIN']">

      <p-tag value="Modo Administrador Verificado (*appHasRole)" severity="success" />

    </div>

  </div>

  @if (statusMsg()) {

    <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">

      {{ statusMsg() }}

    </div>

  }

  <!-- Sección ISS-14: Gestión de RefreshTokens -->

  <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">

    <div class="flex items-center justify-between">

      <div>

        <h3 class="text-base font-bold text-slate-800">ISS-14 · Gestión de Sesión y Refresh Token Rotation (RTR)</h3>

        <p class="text-xs text-slate-500">

          Renovación de credenciales y revocación de familia de tokens (RFC 6819)

        </p>

      </div>

      <div class="flex gap-2">

        <p-button

          label="Rotar Token (POST /auth/refresh)"

          icon="pi pi-sync"

          size="small"

          severity="info"

          [disabled]="!authService.refreshToken()"

          (onClick)="rotateSession()"

        />

        <p-button

          label="Revocar Familia (POST /auth/revoke)"

          icon="pi pi-ban"

          size="small"

          severity="danger"

          [disabled]="!authService.refreshToken()"

          (onClick)="revokeFamily()"

        />

      </div>

    </div>

    <div class="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-900 text-slate-200 p-4 rounded-lg">

      <div class="truncate">

        <span class="text-emerald-400 block mb-1">Access Token (JWT):</span>

        {{ authService.accessToken() || 'Sin sesión activa' }}

      </div>

      <div class="truncate">

        <span class="text-amber-400 block mb-1">Refresh Token (RTR):</span>

        {{ authService.refreshToken() || 'Sin refresh token' }}

      </div>

    </div>

  </div>

  <!-- Sección ISS-10 / ISS-11 / ISS-12: Roles y Matriz de Recursos -->

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

      <h3 class="text-sm font-bold text-slate-700 mb-3 px-2">Catálogo de Roles RBAC (ISS-11 / ISS-12)</h3>

      <p-table [value]="catalogRoles">

        <ng-template #header>

          <tr>

            <th>Rol</th>

            <th>Descripción</th>

            <th>Estado</th>

          </tr>

        </ng-template>

        <ng-template #body let-r>

          <tr>

            <td class="font-mono font-bold text-xs">{{ r.name }}</td>

            <td class="text-xs text-slate-600">{{ r.description }}</td>

            <td><p-tag [value]="r.status" severity="success" /></td>

          </tr>

        </ng-template>

      </p-table>

    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">

      <h3 class="text-sm font-bold text-slate-700 mb-3 px-2">Políticas de Acceso por Recurso (ISS-13)</h3>

      <p-table [value]="catalogResources">

        <ng-template #header>

          <tr>

            <th>Método</th>

            <th>Recurso</th>

            <th>Modalidad</th>

            <th>Roles Autorizados</th>

          </tr>

        </ng-template>

        <ng-template #body let-res>

          <tr>

            <td><p-tag [value]="res.method" [severity]="res.method === 'GET' ? 'info' : 'warn'" /></td>

            <td class="font-mono text-xs">{{ res.path }}</td>

            <td class="font-semibold text-xs">{{ res.mode }}</td>

            <td class="text-xs text-slate-600">{{ res.roles }}</td>

          </tr>

        </ng-template>

      </p-table>

    </div>

  </div>

</div>
```

![](images/clipboard-551109021.png)

### **Paso 6: Registrar las rutas finales en `app.routes.ts` y agregar el enlace `/rbac` en `aside.ts`**

1.  En `frontend/src/app/core/layout/aside/aside.ts`, agrega el ítem de **Roles, Permisos y RTR** dentro del grupo `'Seguridad y RBAC (Fase II)'`:

``` typescript
{

      title: 'Seguridad y RBAC (Fase II)',

      items: [

        { label: 'Sesión y JWT (/me)', icon: 'pi pi-shield', route: '/login' },

        { label: 'Roles, Permisos y RTR', icon: 'pi pi-lock', route: '/rbac' },

      ],

    },
```

![](images/clipboard-843236839.png)

2.   En `frontend/src/app/app.routes.ts`, registra las tres rutas restantes (`liquidaciones`, `mantenimiento` y `rbac`):

``` typescript
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

import { LiquidacionesPage } from './features/liquidaciones/pages/liquidaciones-page';

import { MantenimientoPage } from './features/mantenimiento/pages/mantenimiento-page';

import { LoginPage } from './features/auth/pages/login-page';

import { RbacPage } from './features/auth/pages/rbac-page';

export const routes: Routes = [

  { path: 'dashboard', component: Dashboard },

  { path: 'clients', component: ClientsPage },

  { path: 'propietarios', component: PropietariosPage },

  { path: 'inmuebles', component: InmueblesPage },

  { path: 'contratos', component: ContratosPage },

  { path: 'cobros', component: CobrosPage },

  { path: 'liquidaciones', component: LiquidacionesPage },

  { path: 'mantenimiento', component: MantenimientoPage },

  { path: 'product-types', component: ProductTypesPage },

  { path: 'products', component: ProductsPage },

  { path: 'sales', component: SalesPage },

  { path: 'login', component: LoginPage },

  { path: 'rbac', component: RbacPage },

  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: '**', redirectTo: 'dashboard' },

];
```

![](images/clipboard-1725996255.png)

**LIQUIDACIONES**

![](images/clipboard-2564289569.png)

![](images/clipboard-1997470885.png)

**MANTENIMIENTO**

![](images/clipboard-1769319022.png)

![](images/clipboard-3564924524.png)

**ROLES, PERMISOS Y RTR**

![](images/clipboard-3917193312.png)
