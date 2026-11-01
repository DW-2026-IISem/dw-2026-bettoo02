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