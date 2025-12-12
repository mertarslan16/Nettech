import { ApiResponse } from '../types/api.types';

/**
 * ResponseNormalizer - Normalizes different API response formats into a standard format
 *
 * Handles various response structures:
 * - { data: {...} }
 * - { result: {...} }
 * - { success: true, data: {...} }
 * - Direct object {...}
 * - Error responses with various formats
 */
class ResponseNormalizer {
  /**
   * Normalize any API response into standard ApiResponse format
   */
  normalize<T>(response: any, status: number): ApiResponse<T> {
    // If response is already in standard format
    if (this.isStandardFormat(response)) {
      return response as ApiResponse<T>;
    }

    // Handle error responses
    if (this.isErrorResponse(response, status)) {
      return this.normalizeError<T>(response, status);
    }

    // Handle success responses
    return this.normalizeSuccess<T>(response, status);
  }

  /**
   * Check if response is already in standard ApiResponse format
   */
  private isStandardFormat(response: any): boolean {
    return (
      typeof response === 'object' &&
      response !== null &&
      'success' in response &&
      'data' in response
    );
  }

  /**
   * Check if response indicates an error
   */
  private isErrorResponse(response: any, status: number): boolean {
    // Check HTTP status code
    if (status >= 400) {
      return true;
    }

    // Check for error field in response
    if (typeof response === 'object' && response !== null) {
      return 'error' in response || 'errors' in response || response.success === false;
    }

    return false;
  }

  /**
   * Normalize error response
   */
  private normalizeError<T>(response: any, status: number): ApiResponse<T> {
    let errorMessage = 'Bir hata oluştu';

    if (typeof response === 'object' && response !== null) {
      // Try different error message fields
      errorMessage =
        response.error ||
        response.message ||
        response.errorMessage ||
        (response.errors && typeof response.errors === 'string' ? response.errors : errorMessage);
    }

    return {
      success: false,
      data: null as any,
      error: errorMessage,
    };
  }

  /**
   * Normalize success response
   */
  private normalizeSuccess<T>(response: any, status: number): ApiResponse<T> {
    let data: T;
    let message: string | undefined;

    if (typeof response === 'object' && response !== null) {
      // Extract data from common field names
      if ('data' in response) {
        data = response.data;
        message = response.message;
      } else if ('result' in response) {
        data = response.result;
        message = response.message;
      } else if ('payload' in response) {
        data = response.payload;
        message = response.message;
      } else {
        // Use the entire response as data
        data = response as T;
      }
    } else {
      // Primitive types or null
      data = response as T;
    }

    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * Extract error message from various error response formats
   */
  extractErrorMessage(response: any): string {
    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null) {
      // Try common error message fields
      const errorFields = ['error', 'message', 'errorMessage', 'msg', 'detail'];
      for (const field of errorFields) {
        if (response[field]) {
          return typeof response[field] === 'string' ? response[field] : JSON.stringify(response[field]);
        }
      }

      // Handle errors array
      if (response.errors) {
        if (Array.isArray(response.errors)) {
          return response.errors.map((e: any) => (typeof e === 'string' ? e : e.message || JSON.stringify(e))).join(', ');
        }
        if (typeof response.errors === 'string') {
          return response.errors;
        }
      }
    }

    return 'Bir hata oluştu';
  }
}

export default new ResponseNormalizer();
