import apiClient from '../client/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ApiResponse } from '../types/api.types';
import { User, UpdateUserProfileRequest, ChangePasswordRequest } from '../types/user.types';

/**
 * UserService - Handles user-related API operations
 */
class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserProfileRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/user/change-password', data);
  }

  /**
   * Get user by ID (admin functionality)
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/user/${userId}`);
  }
}

export default new UserService();
