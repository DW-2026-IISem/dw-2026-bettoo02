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