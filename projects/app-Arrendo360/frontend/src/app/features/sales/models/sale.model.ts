export interface SaleItem {
  id?: number;
  product_id: number;
  quantity: number;
  unit_price?: number;
  line_total?: number;
  status?: 'active' | 'inactive';
  product?: {
    id: number;
    name: string;
    brand: string;
  };
}

export interface Sale {
  id: number;
  sale_date: string;
  subtotal: number;
  tax: number;
  discounts: number;
  total: number;
  client_id: number;
  status: 'active' | 'inactive';
  items?: SaleItem[];
  client?: {
    id: number;
    nombre: string;
  };
}

export interface CreateSaleDto {
  client_id: number;
  tax?: number;
  discounts?: number;
  items: {
    product_id: number;
    quantity: number;
  }[];
}