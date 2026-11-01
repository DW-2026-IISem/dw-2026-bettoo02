/**

 * Espejo exacto de ResponseInterceptor del backend Arrendo360

 */

export interface ApiResponse<T> {

  statusCode: number;

  message: string;

  data: T;

  timestamp?: string;

}

/**

 * Estructura estándar para respuestas paginadas del backend

 */

export interface PaginatedResponse<T> {

  items?: T[];

  rows?: T[];

  total: number;

  page: number;

  limit: number;

}

export interface HealthStatus {

  status: string;

}