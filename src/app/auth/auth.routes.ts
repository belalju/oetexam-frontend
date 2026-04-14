import { Routes } from '@angular/router';
import { guestGuard } from './guards/auth-guard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    component: Login
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    component: Register
  }
];