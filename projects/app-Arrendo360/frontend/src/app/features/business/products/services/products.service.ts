import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-response.model';
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