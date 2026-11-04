export interface ProductType {

  id: number;

  name: string;

  description: string | null;

  status: 'active' | 'inactive';

  createdAt?: string;

  updatedAt?: string;

}

export interface CreateProductTypeDto {

  name: string;

  description?: string | null;

}

export type UpdateProductTypeDto = Partial<CreateProductTypeDto> & {

  status?: 'active' | 'inactive';

};