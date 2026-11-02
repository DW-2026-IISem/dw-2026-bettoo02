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

    })
    ,
  ],

};