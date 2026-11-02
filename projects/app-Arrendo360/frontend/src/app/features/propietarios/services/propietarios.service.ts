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

@Injectable(    {
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