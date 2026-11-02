export type UserRole =
  | 'ADMIN'
  | 'ASESOR'
  | 'CARTERA'
  | 'MANTENIMIENTO'
  | 'PROPIETARIO_CONSULTA';

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserProfile;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
  role?: UserRole;
}