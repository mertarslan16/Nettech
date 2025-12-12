import { ApiError, ApiErrorType } from '../types/api.types';

/**
 * Turkish error messages for user-friendly display
 */
const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  [ApiErrorType.NETWORK_ERROR]: 'İnternet bağlantısı bulunamadı. Lütfen bağlantınızı kontrol edin.',
  [ApiErrorType.TIMEOUT]: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
  [ApiErrorType.UNAUTHORIZED]: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
  [ApiErrorType.FORBIDDEN]: 'Bu işlemi yapmaya yetkiniz yok.',
  [ApiErrorType.NOT_FOUND]: 'İstenen kayıt bulunamadı.',
  [ApiErrorType.SERVER_ERROR]: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  [ApiErrorType.VALIDATION_ERROR]: 'Lütfen girdiğiniz bilgileri kontrol edin.',
  [ApiErrorType.UNKNOWN]: 'Beklenmeyen bir hata oluştu.',
};

/**
 * ErrorHandler - Centralized error handling for API requests
 */
class ErrorHandler {
  /**
   * Handle and transform errors into user-friendly ApiError objects
   */
  handleError(error: any, statusCode?: number): ApiError {
    // Network error (no internet connection)
    if (error.message === 'Network request failed' || !navigator.onLine) {
      return this.createError(ApiErrorType.NETWORK_ERROR, statusCode);
    }

    // Timeout error
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return this.createError(ApiErrorType.TIMEOUT, statusCode);
    }

    // HTTP status code errors
    if (statusCode) {
      const errorType = this.getErrorTypeFromStatusCode(statusCode);
      return this.createError(errorType, statusCode, error.message);
    }

    // Default unknown error
    return this.createError(ApiErrorType.UNKNOWN, statusCode, error.message);
  }

  /**
   * Get error type based on HTTP status code
   */
  private getErrorTypeFromStatusCode(statusCode: number): ApiErrorType {
    if (statusCode === 401) {
      return ApiErrorType.UNAUTHORIZED;
    }
    if (statusCode === 403) {
      return ApiErrorType.FORBIDDEN;
    }
    if (statusCode === 404) {
      return ApiErrorType.NOT_FOUND;
    }
    if (statusCode === 400 || statusCode === 422) {
      return ApiErrorType.VALIDATION_ERROR;
    }
    if (statusCode >= 500) {
      return ApiErrorType.SERVER_ERROR;
    }
    return ApiErrorType.UNKNOWN;
  }

  /**
   * Create an ApiError object
   */
  private createError(
    type: ApiErrorType,
    statusCode?: number,
    customMessage?: string
  ): ApiError {
    return {
      type,
      message: customMessage || ERROR_MESSAGES[type],
      statusCode,
    };
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: ApiError): string {
    return error.message || ERROR_MESSAGES[error.type];
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(error: ApiError): boolean {
    return error.type === ApiErrorType.UNAUTHORIZED || error.type === ApiErrorType.FORBIDDEN;
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(error: ApiError): boolean {
    return error.type === ApiErrorType.NETWORK_ERROR;
  }
}

export default new ErrorHandler();
