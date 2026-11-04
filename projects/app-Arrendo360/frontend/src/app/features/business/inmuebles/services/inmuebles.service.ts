import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/api-response.model';
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