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