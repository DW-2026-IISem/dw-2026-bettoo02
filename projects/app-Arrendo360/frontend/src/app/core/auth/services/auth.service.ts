import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  UserProfile,
  UserRole,
} from '../models/auth.model';
const ACCESS_TOKEN_KEY = 'arrendo360_access_token';
const REFRESH_TOKEN_KEY = 'arrendo360_refresh_token';
const USER_KEY = 'arrendo360_user';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  // Signals de estado de sesión
  readonly currentUser = signal<UserProfile | null>(this.loadStoredUser());
  readonly accessToken = signal<string | null>(
    localStorage.getItem(ACCESS_TOKEN_KEY),
  );
  readonly refreshToken = signal<string | null>(
    localStorage.getItem(REFRESH_TOKEN_KEY),
  );
  // Signals derivados (computed)
  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.currentUser());
  readonly userRole = computed<UserRole>(() => this.currentUser()?.role ?? 'ADMIN');
  private loadStoredUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
     return null;
    }
  }

  private saveSession(auth: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
    this.accessToken.set(auth.accessToken);
    if (auth.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
      this.refreshToken.set(auth.refreshToken);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    this.currentUser.set(auth.user);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.currentUser.set(null);
  }

  login(dto: LoginDto): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, dto)
      .pipe(tap((res) => this.saveSession(res.data)));
  }

  register(dto: RegisterDto): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, dto)
      .pipe(tap((res) => this.saveSession(res.data)));
  }

  fetchMe(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        this.currentUser.set(res.data);
      }),

    );
  }

  rotateRefreshToken(): Observable<ApiResponse<AuthResponse>> {
    const token = this.refreshToken();
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, {
        refreshToken: token,
      })
      .pipe(tap((res) => this.saveSession(res.data)));
  }

  logout(): void {
    const refreshToken = this.refreshToken();
    if (this.accessToken()) {
      this.http
        .post(`${this.apiUrl}/logout`, { refreshToken })
        .subscribe({
          next: () => this.finishLogout(),
          error: () => this.finishLogout(),
        });
    } else {
      this.finishLogout();
    }
  }
  private finishLogout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }
  hasRole(allowedRoles: UserRole[]): boolean {
    const current = this.currentUser();
    if (!current) return false;
    return allowedRoles.includes(current.role);
  }
}