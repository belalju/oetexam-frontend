import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
 
  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/auth/login']);
};
 
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
 
  if (auth.isAuthenticated() && auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
 
export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
 
  if (!auth.isAuthenticated()) {
    return true;
  }
  // Already logged in — redirect based on role
  return router.createUrlTree(
    auth.isAdmin() ? ['/admin/dashboard'] : ['/dashboard']
  );
  
};
