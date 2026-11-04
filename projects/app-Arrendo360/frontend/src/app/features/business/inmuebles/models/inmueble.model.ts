export interface Inmueble {
  id: number;
  propietarioId: number;
  nombre: string;
  descripcion: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInmuebleDto {
  propietarioId: number;
  nombre: string;
  descripcion?: string;
}

export type UpdateInmuebleDto = Partial<CreateInmuebleDto> & {
  isActive?: boolean;
};