import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserRole } from '../../../core/auth/models/auth.model';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})

export class LoginPage {

  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly loading = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly successMsg = signal<string | null>(null);

  protected readonly rolesOptions: { label: string; value: UserRole }[] = [
    { label: 'Administrador General (ADMIN)', value: 'ADMIN' },
    { label: 'Asesor Inmobiliario (ASESOR)', value: 'ASESOR' },
    { label: 'Gestor de Cartera (CARTERA)', value: 'CARTERA' },
    { label: 'Mantenimiento (MANTENIMIENTO)', value: 'MANTENIMIENTO' },
    { label: 'Propietario Solo Consulta (PROPIETARIO_CONSULTA)', value: 'PROPIETARIO_CONSULTA' },
  ];

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['admin.master@arrendo360.com', [Validators.required, Validators.email]],
    password: ['PasswordSegura2026*', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly registerForm = this.fb.nonNullable.group({

    nombre: ['Alberto Ortiz', [Validators.required, Validators.minLength(2)]],

    email: ['betto@arrendo360.com', [Validators.required, Validators.email]],

    password: ['PasswordSegura2026*', [Validators.required, Validators.minLength(6)]],

    role: ['ADMIN' as UserRole, [Validators.required]],

  });

  protected onLogin(): void {

    if (this.loginForm.invalid) return;

    this.loading.set(true);

    this.errorMsg.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({

      next: () => {

        this.loading.set(false);

        void this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        this.loading.set(false);

        this.errorMsg.set(

          err?.error?.message ?? 'Credenciales inválidas. Puedes registrar la cuenta en la pestaña Registro.',

        );

      },

    });

  }

  protected onRegister(): void {

    if (this.registerForm.invalid) return;

    this.loading.set(true);

    this.errorMsg.set(null);

    this.authService.register(this.registerForm.getRawValue()).subscribe({

      next: () => {

        this.loading.set(false);

        void this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        this.loading.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al registrar el usuario.');

      },

    });

  }

  protected testVerifyMe(): void {

    this.errorMsg.set(null);

    this.successMsg.set(null);

    this.authService.fetchMe().subscribe({

      next: (res) => {

        this.successMsg.set(`Token verificado en /api/auth/me: ${res.data.nombre} (${res.data.role})`);

      },

      error: (err) => {

        this.errorMsg.set(err?.error?.message ?? 'Token inválido o expirado.');

      },

    });

  }

  protected testRotateToken(): void {

    this.errorMsg.set(null);

    this.successMsg.set(null);

    this.authService.rotateRefreshToken().subscribe({

      next: () => {

        this.successMsg.set('¡Refresh Token rotado con éxito (RTR - RFC 6819)!');

      },

      error: (err) => {

        this.errorMsg.set(err?.error?.message ?? 'No se pudo rotar el Refresh Token.');

      },

    });

  }

}