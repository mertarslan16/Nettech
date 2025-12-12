import { API_CONFIG } from '../config/apiConfig';
import { ApiResponse, RequestConfig } from '../types/api.types';
import tokenManager from './tokenManager';
import errorHandler from './errorHandler';
import responseNormalizer from './responseNormalizer';

/**
 * ApiClient - Core fetch wrapper for all API requests
 * Handles authentication, error handling, and response normalization
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultTimeout = API_CONFIG.timeout;
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T>(
    url: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * Core request method
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const timeout = config?.timeout || this.defaultTimeout;

    try {
      // Prepare headers
      const headers = await this.prepareHeaders(config);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      // Add body for non-GET requests
      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data);
      }

      // Make the request
      const response = await fetch(fullUrl, requestOptions);

      // Clear timeout
      clearTimeout(timeoutId);

      // Parse response
      const responseData = await this.parseResponse(response);

      // Normalize response
      const normalizedResponse = responseNormalizer.normalize<T>(
        responseData,
        response.status,
      );

      // Handle authentication errors
      if (response.status === 401) {
        await tokenManager.clearTokens();
      }

      return normalizedResponse;
    } catch (error: any) {
      // Handle error
      const apiError = errorHandler.handleError(error);

      return {
        success: false,
        data: null as any,
        error: apiError.message,
      };
    }
  }

  /**
   * Prepare request headers with authentication
   */
  private async prepareHeaders(
    config?: RequestConfig,
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...API_CONFIG.headers,
      ...config?.headers,
    };

    // Add authentication token if not skipped
    if (!config?.skipAuth) {
      const token = await tokenManager.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Parse response body
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');

    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        // If JSON parsing fails, return empty object
        return {};
      }
    }

    // Try to get text response
    try {
      const text = await response.text();
      // Try to parse as JSON
      if (text) {
        try {
          return JSON.parse(text);
        } catch {
          return { message: text };
        }
      }
      return {};
    } catch {
      return {};
    }
  }

  /**
   * Set custom base URL (useful for testing)
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

export default new ApiClient();
