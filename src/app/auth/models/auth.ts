
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