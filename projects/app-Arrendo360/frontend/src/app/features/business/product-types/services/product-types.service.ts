import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/api-response.model';
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