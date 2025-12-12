export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserSettings {
  notifications: boolean;
  language: string;
  theme?: 'light' | 'dark';
}
