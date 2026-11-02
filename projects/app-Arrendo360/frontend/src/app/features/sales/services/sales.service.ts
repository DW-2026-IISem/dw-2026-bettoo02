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
