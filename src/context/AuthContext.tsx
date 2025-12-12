import React, { createContext, useState, useEffect, ReactNode } from 'react';
import tokenManager from '../api/client/tokenManager';
import authService from '../api/services/authService';
import { UserProfile } from '../api/types/auth.types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthToken: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize auth state on app start
   * Check if user has stored token and load user data
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check if token exists
      const hasToken = await tokenManager.hasToken();

      if (hasToken) {
        // Load user data from storage
        const storedUser = await tokenManager.getUser<UserProfile>();

        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Token exists but no user data, clear everything
          await tokenManager.clearTokens();
        }
      }
    } catch {
      await tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Set authentication token and user data
   * Called when WebView sends token via postMessage
   */
  const setAuthToken = async (
    token: string,
    userData: UserProfile,
  ): Promise<void> => {
    try {
      // Store token and user data
      await tokenManager.setToken(token);
      await tokenManager.setUser(userData);

      // Update state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   * Clear tokens and user data
   */
  const logout = async (): Promise<void> => {
    try {
      // Call logout service (will clear tokens)
      await authService.logout();

      // Update state
      setUser(null);
      setIsAuthenticated(false);
    } catch {
      // Clear state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Refresh user data from storage
   * Useful after profile updates
   */
  const refreshUserData = async (): Promise<void> => {
    try {
      const storedUser = await tokenManager.getUser<UserProfile>();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    setAuthToken,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
