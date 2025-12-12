import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

/**
 * useAuth hook - Easy access to authentication context
 *
 * Usage:
 * const { user, isAuthenticated, setAuthToken, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
