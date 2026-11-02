import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();
  const role = authService.currentUser()?.role;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (role) {
    headers['x-user-role'] = role;
  } else if (!req.headers.has('x-user-role')) {
    headers['x-user-role'] = 'ADMIN';
  }
  if (Object.keys(headers).length > 0) {
    req = req.clone({ setHeaders: headers });
  }
  return next(req);
};