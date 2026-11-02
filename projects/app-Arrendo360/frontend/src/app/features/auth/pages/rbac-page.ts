import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth.service';
import { HasRoleDirective } from '../../../core/auth/directives/has-role.directive';

@Component({
  selector: 'app-rbac-page',
  imports: [TableModule, ButtonModule, TagModule, HasRoleDirective],
  templateUrl: './rbac-page.html',
  styleUrl: './rbac-page.css',
})

export class RbacPage {
  protected readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  protected readonly statusMsg = signal<string | null>(null);

  protected readonly catalogRoles = [
    { name: 'ADMIN', description: 'Administrador General del Sistema (Acceso Total)', status: 'active' },
    { name: 'ASESOR', description: 'Asesor Comercial e Inmobiliario (Clientes, Inmuebles, Contratos)', status: 'active' },
    { name: 'CARTERA', description: 'Gestor de Cartera y Cobranzas (Cobros, Pagos, Liquidaciones)', status: 'active' },
    { name: 'MANTENIMIENTO', description: 'Técnico de Mantenimiento (Tickets y Órdenes)', status: 'active' },
    { name: 'PROPIETARIO_CONSULTA', description: 'Propietario con permisos exclusivos de consulta (Solo Lectura)', status: 'active' },
  ];

  protected readonly catalogResources = [
    { method: 'GET', path: '/api/health', mode: 'OPEN', roles: 'Público' },
    { method: 'GET', path: '/api/auth/me', mode: 'PROTECTED', roles: 'Cualquier JWT válido' },
    { method: 'POST', path: '/api/clients', mode: 'RBAC', roles: 'ADMIN, ASESOR' },
    { method: 'POST', path: '/api/contratos', mode: 'RBAC', roles: 'ADMIN, ASESOR' },
    { method: 'POST', path: '/api/cobros', mode: 'RBAC', roles: 'ADMIN, CARTERA' },
    { method: 'POST', path: '/api/pagos', mode: 'RBAC', roles: 'ADMIN, CARTERA' },
    { method: 'POST', path: '/api/distribuciones-pago', mode: 'RBAC', roles: 'ADMIN' },
    { method: 'POST', path: '/api/auth/refresh', mode: 'RTR', roles: 'Refresh Token Activo' },
  ];

  protected rotateSession(): void {
    this.authService.rotateRefreshToken().subscribe({
      next: () =>
        this.statusMsg.set('✅ Nuevo par de tokens (Access + Refresh) emitido por rotación RTR.'),
      error: (err) =>
        this.statusMsg.set(err?.error?.message ?? 'Error al rotar Refresh Token.'),
    });
  }

  protected revokeFamily(): void {
    const refreshToken = this.authService.refreshToken();
    if (!refreshToken) return;
    this.http.post(`${this.apiUrl}/revoke`, { refreshToken }).subscribe({
      next: () => {
        this.statusMsg.set('🔒 Familia de Refresh Tokens revocada exitosamente.');
        this.authService.clearSession();
      },
    });
  }
}
