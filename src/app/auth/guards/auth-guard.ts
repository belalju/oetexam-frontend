import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(Auth);
  const router = inject(Router);
 
  // Not logged in at all
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }
 
  // Token exists but is it expired?
  if (auth.isTokenExpired()) {
    // Try to get a new one using the refresh token
    const refreshToken = auth.getRefreshToken();
 
    if (!refreshToken) {
      auth.logout();
      return router.createUrlTree(['/auth/login']);
    }
 
    // Synchronous check — if refresh token is also expired, logout immediately
    if (auth.isRefreshTokenExpired()) {
      auth.logout();
      return router.createUrlTree(['/auth/login']);
    }
 
    // Refresh token still valid — let the interceptor handle the refresh
    // when the first HTTP call fires. Allow navigation to continue.
    return true;
  }
 
  return true;
};
 
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
 
  if (auth.isAuthenticated() && auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/student/home']);
};
 
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
 
  if (!auth.isAuthenticated()) {
    return true;
  }
  // Already logged in — redirect based on role
  return router.createUrlTree(
    auth.isAdmin() ? ['/admin/dashboard'] : ['/student/home']
  );
  
};
