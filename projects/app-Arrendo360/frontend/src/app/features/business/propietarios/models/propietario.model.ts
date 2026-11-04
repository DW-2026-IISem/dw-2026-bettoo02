export interface Propietario {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  telefono: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePropietarioDto {
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  telefono?: string;
  email?: string;
}

export type UpdatePropietarioDto = Partial<CreatePropietarioDto> & {
  isActive?: boolean;
};