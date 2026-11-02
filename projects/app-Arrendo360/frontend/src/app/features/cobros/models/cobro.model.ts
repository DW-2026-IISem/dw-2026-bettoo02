export interface Cobro {
  id: number;
  referenciaId: number; // ID del Contrato
  fecha: string;
  valor: number;
  estado: 'PENDIENTE' | 'PAGADO' | 'ANULADO' | string;
  observaciones?: string;
  createdAt?: string;
}

export interface CreateCobroDto {
  referenciaId: number;
  fecha: string;
  valor: number;
  observaciones?: string;
}

export interface Pago {
  id: number;
  referenciaTipo: string;
  referenciaId: number; // ID del Cobro
  metodo: string;
  monto: number;
  fecha: string;
  estado: string;
}

export interface CreatePagoDto {
  referenciaId: number;
  metodo: string;
  monto: number;
  fecha: string;
}