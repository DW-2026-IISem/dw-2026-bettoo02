import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { HasRoleDirective } from '../../../core/auth/directives/has-role.directive';

export interface RoleCatalogItem {
  id?: number;
  name: string;
  description: string;
  status: string;
}

export interface ResourceCatalogItem {
  id?: number;
  name?: string;
  method: string;
  path: string;
  mode?: string;
  roles?: string;
  status?: string;
}

export interface RefreshSessionItem {
  id: number;
  jti: string;
  familyId: string;
  userId: number;
  isUsed: boolean;
  isRevoked: boolean;
  expiresAt: string;
}

@Component({
  selector: 'app-rbac-page',
  imports: [TableModule, ButtonModule, TagModule, HasRoleDirective],
  templateUrl: './rbac-page.html',
  styleUrl: './rbac-page.css',
})
export class RbacPage implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  protected readonly statusMsg = signal<string | null>(null);

  protected readonly catalogRoles = signal<RoleCatalogItem[]>([
    { name: 'ADMIN', description: 'Administrador General del Sistema (Acceso Total)', status: 'active' },
    { name: 'ASESOR', description: 'Asesor Comercial e Inmobiliario (Clientes, Inmuebles, Contratos)', status: 'active' },
    { name: 'CARTERA', description: 'Gestor de Cartera y Cobranzas (Cobros, Pagos, Liquidaciones)', status: 'active' },
    { name: 'MANTENIMIENTO', description: 'Técnico de Mantenimiento (Tickets y Órdenes)', status: 'active' },
    { name: 'PROPIETARIO_CONSULTA', description: 'Propietario con permisos exclusivos de consulta (Solo Lectura)', status: 'active' },
  ]);

  protected readonly catalogResources = signal<ResourceCatalogItem[]>([
    { method: 'GET', path: '/api/health', mode: 'OPEN', roles: 'Público' },
    { method: 'GET', path: '/api/auth/me', mode: 'PROTECTED', roles: 'Cualquier JWT válido' },
    { method: 'POST', path: '/api/clients', mode: 'RBAC', roles: 'ADMIN, ASESOR' },
    { method: 'POST', path: '/api/contratos', mode: 'RBAC', roles: 'ADMIN, ASESOR' },
    { method: 'POST', path: '/api/cobros', mode: 'RBAC', roles: 'ADMIN, CARTERA' },
    { method: 'POST', path: '/api/pagos', mode: 'RBAC', roles: 'ADMIN, CARTERA' },
    { method: 'POST', path: '/api/distribuciones-pago', mode: 'RBAC', roles: 'ADMIN' },
    { method: 'POST', path: '/api/auth/refresh', mode: 'RTR', roles: 'Refresh Token Activo' },
  ]);

  protected readonly sessions = signal<RefreshSessionItem[]>([]);

  ngOnInit(): void {
    this.loadBackendCatalogs();
  }

  protected loadBackendCatalogs(): void {
    this.http
      .get<ApiResponse<PaginatedResponse<RoleCatalogItem>>>(`${this.apiUrl}/roles`)
      .subscribe({
        next: (res) => {
          const items = res.data?.items ?? res.data?.rows ?? [];
          if (items.length > 0) {
            this.catalogRoles.set(items);
          }
        },
      });

    this.http
      .get<ApiResponse<PaginatedResponse<ResourceCatalogItem>>>(`${this.apiUrl}/resources`)
      .subscribe({
        next: (res) => {
          const items = res.data?.items ?? res.data?.rows ?? [];
          if (items.length > 0) {
            this.catalogResources.set(
              items.map((r) => ({
                ...r,
                mode: r.path.includes('/health') || r.path.includes('/docs') ? 'OPEN' : r.path.includes('/auth/') ? 'PROTECTED' : 'RBAC',
                roles: r.name || 'ADMIN',
              })),
            );
          }
        },
      });

    this.http
      .get<ApiResponse<PaginatedResponse<RefreshSessionItem>>>(`${this.apiUrl}/refresh-tokens`)
      .subscribe({
        next: (res) => {
          this.sessions.set(res.data?.items ?? res.data?.rows ?? []);
        },
      });
  }

  protected rotateSession(): void {
    this.authService.rotateRefreshToken().subscribe({
      next: () => {
        this.statusMsg.set('✅ Nuevo par de tokens (Access + Refresh) emitido por rotación RTR.');
        this.loadBackendCatalogs();
      },
      error: (err) =>
        this.statusMsg.set(err?.error?.message ?? 'Error al rotar Refresh Token.'),
    });
  }

  protected revokeFamily(): void {
    const refreshToken = this.authService.refreshToken();
    if (!refreshToken) return;
    this.http.post(`${this.apiUrl}/auth/revoke`, { refreshToken }).subscribe({
      next: () => {
        this.statusMsg.set('🔒 Familia de Refresh Tokens revocada exitosamente.');
        this.authService.clearSession();
        this.loadBackendCatalogs();
      },
    });
  }

  protected purgeExpiredTokens(): void {
    this.http.delete<{ data: { message: string } }>(`${this.apiUrl}/refresh-tokens/purge`).subscribe({
      next: (res) => {
        this.statusMsg.set(`🧹 ${res.data?.message ?? 'Tokens expirados/revocados purgados.'}`);
        this.loadBackendCatalogs();
      },
    });
  }
}
