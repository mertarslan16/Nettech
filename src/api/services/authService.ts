import apiClient from '../client/apiClient';
import tokenManager from '../client/tokenManager';
import { API_ENDPOINTS } from '../config/apiConfig';
import { AuthResponse, LoginCredentials, VerifyTokenResponse } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

/**
 * AuthService - Handles authentication-related API operations
 */
class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      { skipAuth: true }
    );

    // If login successful, store tokens
    if (response.success && response.data) {
      await tokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        await tokenManager.setRefreshToken(response.data.refreshToken);
      }
      await tokenManager.setUser(response.data.user);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      // Call logout endpoint
      const response = await apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);

      // Clear tokens regardless of API response
      await tokenManager.clearTokens();

      return response;
    } catch (error) {
      // Always clear tokens even if API call fails
      await tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = await tokenManager.getRefreshToken();

    if (!refreshToken) {
      return {
        success: false,
        data: null as any,
        error: 'Refresh token bulunamadı',
      };
    }

    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken },
      { skipAuth: true }
    );

    // If refresh successful, update tokens
    if (response.success && response.data) {
      await tokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        await tokenManager.setRefreshToken(response.data.refreshToken);
      }
      await tokenManager.setUser(response.data.user);
    }

    return response;
  }

  /**
   * Verify if current token is valid
   */
  async verifyToken(): Promise<ApiResponse<VerifyTokenResponse>> {
    const hasToken = await tokenManager.hasToken();

    if (!hasToken) {
      return {
        success: false,
        data: { valid: false },
        error: 'Token bulunamadı',
      };
    }

    return apiClient.get<VerifyTokenResponse>(API_ENDPOINTS.AUTH.VERIFY);
  }

  /**
   * Check if user is authenticated (has token)
   */
  async isAuthenticated(): Promise<boolean> {
    return tokenManager.hasToken();
  }
}

export default new AuthService();
