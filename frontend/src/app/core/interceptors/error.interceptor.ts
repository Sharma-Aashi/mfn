import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/common.model';
import { ToastService } from '../services/toast.service';
import { TokenService } from '../services/token.service';
import { SKIP_ERROR_TOAST } from './http-context.tokens';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const apiError = err.error as ApiError | undefined;
        const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/admin/login') ||
          req.url.includes('/auth/register');

        if (err.status === 401 && !isAuthEndpoint && tokenService.getToken()) {
          tokenService.clear();
          toast.info('Your session has expired. Please sign in again.');
          const isAdminArea = router.url.startsWith('/admin');
          router.navigate([isAdminArea ? '/admin/login' : '/account/login']);
        } else if (!req.context.get(SKIP_ERROR_TOAST)) {
          const message = err.status === 0
            ? 'Unable to reach the server. Check your connection and try again.'
            : (apiError?.message || 'Something went wrong. Please try again.');
          toast.error(message);
        }
      }
      return throwError(() => err);
    }),
  );
};
