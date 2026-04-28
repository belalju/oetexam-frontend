import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take
} from 'rxjs';
import { Auth } from '../services/auth';

// ─── Module-level refresh state (shared across all interceptor calls) ─────────
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// ─── Main Interceptor ─────────────────────────────────────────────────────────
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);

  // Never add token to auth endpoints themselves
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const clonedReq = token ? addToken(req, token) : req;

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

// ─── 401 Handler ─────────────────────────────────────────────────────────────
function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: Auth
) {
  if (isRefreshing) {
    // Another request already triggered refresh — wait for the new token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(req, token!)))
    );
  }

  // Start refresh flow
  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refreshToken = authService.getRefreshToken();

  if (!refreshToken) {
    // No refresh token stored → go to login immediately
    isRefreshing = false;
    authService.logout();
    return throwError(() => new Error('Session expired. Please log in again.'));
  }

  return authService.refreshAccessToken(refreshToken).pipe(
    switchMap((newAccessToken: string) => {
      isRefreshing = false;
      refreshTokenSubject.next(newAccessToken);           // Unblock queued requests
      return next(addToken(req, newAccessToken));         // Retry original request
    }),
    catchError(err => {
      // Refresh token itself is expired/invalid → force logout → login page
      isRefreshing = false;
      refreshTokenSubject.next(null);
      authService.logout();                               // ← This navigates to /auth/login
      return throwError(() => err);
    })
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh')
  );
}