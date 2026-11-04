import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/api-response.model';
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