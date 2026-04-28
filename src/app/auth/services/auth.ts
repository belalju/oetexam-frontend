import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth';
import { catchError, map, tap, throwError } from 'rxjs';
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
 
  // ─── Reactive Signals ───────────────────────────────────────────────────────
  private _currentUser = signal<CurrentUser | null>(this.getUserFromStorage());
  private _isLoading   = signal<boolean>(false);
 
  currentUser     = this._currentUser.asReadonly();
  isLoading       = this._isLoading.asReadonly();
  isAuthenticated = computed(() => !!this._currentUser());
  isAdmin         = computed(() => this._currentUser()?.role === 'ADMIN');
 
  // ─── Register ───────────────────────────────────────────────────────────────
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
 
  // ─── Login ──────────────────────────────────────────────────────────────────
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
 
  // ─── Refresh Token ──────────────────────────────────────────────────────────
  // Called automatically by the interceptor when a 401 is received.
  // Adjust the endpoint & payload shape to match your API.
  refreshAccessToken(refreshToken: string) {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/refresh`, { refreshToken })
      .pipe(
        tap(res => {
          // Save the new tokens without touching user info
          localStorage.setItem(this.ACCESS_TOKEN_KEY, res.data.accessToken);
          if (res.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
          }
        }),
        map(res => res.data.accessToken), // interceptor only needs the new token string
        catchError(err => throwError(() => err))
      );
  }
 
  // ─── Logout ─────────────────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
 
  // ─── Token Accessors ────────────────────────────────────────────────────────
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
 
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }


  // ─── ✅ Token Expiry Checks ──────────────────────────────────────────────────
 
  /** Returns true if the access token is missing or expired */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    return this.isJwtExpired(token);
  }
 
  /** Returns true if the refresh token is missing or expired */
  isRefreshTokenExpired(): boolean {
    const token = this.getRefreshToken();
    if (!token) return true;
    return this.isJwtExpired(token);
  }
 
  /**
   * Decodes a JWT and checks the `exp` claim.
   * Works for any standard JWT — no library needed.
   */
  private isJwtExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false; // No exp claim → treat as non-expiring
      const nowInSeconds = Math.floor(Date.now() / 1000);
      return payload.exp < nowInSeconds;
    } catch {
      return true; // Malformed token → treat as expired
    }
  }
 
  // ─── Private Helpers ────────────────────────────────────────────────────────
  private handleAuthSuccess(res: AuthResponse) {
    const { accessToken, refreshToken, email, firstName, lastName, role } = res.data;
 
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
 
    const user: CurrentUser = { email, firstName, lastName, role };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
    this._isLoading.set(false);
 
    this.router.navigate(role === 'ADMIN' ? ['/admin/dashboard'] : ['/student/home']);
  }
 
  private getUserFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
