import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
 
  // private readonly API_URL = 'http://103.144.200.101:8088'; // <-- Change this
  private readonly API_URL = environment.API_URL; // <-- Change this
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
 
  // Signals for reactive state
  private _currentUser = signal<CurrentUser | null>(this.getUserFromStorage());
  private _isLoading = signal<boolean>(false);
 
  // Public readonly computed signals
  currentUser = this._currentUser.asReadonly();
  isLoading = this._isLoading.asReadonly();
  isAuthenticated = computed(() => !!this._currentUser());
  isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
 
  register(payload: RegisterRequest) {
    this._isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, payload).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => {
        this._isLoading.set(false);
        return throwError(() => err);
      })
    );
  }
 
  login(payload: LoginRequest) {
    this._isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => {
        this._isLoading.set(false);
        return throwError(() => err);
      })
    );
  }
 
  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
 
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
 
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
 
  private handleAuthSuccess(res: AuthResponse) {
    const { accessToken, refreshToken, email, firstName, lastName, role } = res.data;
 
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
 
    const user: CurrentUser = { email, firstName, lastName, role };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
    this._isLoading.set(false);
 
    // Navigate based on role
    if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
 
  private getUserFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
