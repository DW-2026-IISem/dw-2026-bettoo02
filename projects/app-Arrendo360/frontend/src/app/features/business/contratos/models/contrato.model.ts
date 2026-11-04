export interface Contrato {
  id: number;
  inmuebleId: number;
  clienteId: number;
  numero: string;
  fechaInicio: string;
  fechaFin: string;
  valor: number;
  estado: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContratoDto {
  inmuebleId: number;
  clienteId: number;
  numero: string;
  fechaInicio: string;
  fechaFin: string;
  valor: number;
  estado?: string;
}

export type UpdateContratoDto = Partial<CreateContratoDto>;