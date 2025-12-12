export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatar?: string;
  role?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: UserProfile;
}
