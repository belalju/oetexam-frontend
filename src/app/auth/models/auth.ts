
// Request Models
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profession: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface RegisterData {
  message: string;
  email: string;
}

export interface RegisterResponse {
  timestamp: string;
  status: number;
  data: RegisterData;
  error: string | null;
}

// Response Models
export interface AuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  role: 'ADMIN' | 'USER';
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  timestamp: string;
  status: number;
  data: AuthData;
  error: string | null;
}

export interface CurrentUser {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
}