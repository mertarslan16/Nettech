import { useState, useCallback } from 'react';
import { ApiResponse } from '../../api/types/api.types';

interface UseApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (apiCall: () => Promise<ApiResponse<T>>) => Promise<void>;
  reset: () => void;
}

/**
 * useApiRequest hook - Generic hook for making API requests with loading and error states
 *
 * Usage:
 * const { data, loading, error, execute, reset } = useApiRequest<User>();
 *
 * // Execute API call
 * await execute(() => userService.getProfile());
 */
export const useApiRequest = <T,>(): UseApiRequestState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute an API call
   */
  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Bir hata oluştu');
      }
    } catch (err: any) {
      console.error('API request error:', err);
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
