import storage from '../../utils/storage';

const TOKEN_KEY = '@nettech:access_token';
const REFRESH_TOKEN_KEY = '@nettech:refresh_token';
const USER_KEY = '@nettech:user';

/**
 * TokenManager - Manages authentication tokens in AsyncStorage
 */
class TokenManager {
  /**
   * Get the access token from storage
   */
  async getToken(): Promise<string | null> {
    try {
      return await storage.getItem<string>(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Set the access token in storage
   */
  async setToken(token: string): Promise<void> {
    try {
      await storage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  }

  /**
   * Get the refresh token from storage
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await storage.getItem<string>(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Set the refresh token in storage
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await storage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
      throw error;
    }
  }

  /**
   * Get the user data from storage
   */
  async getUser<T>(): Promise<T | null> {
    try {
      return await storage.getItem<T>(USER_KEY);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Set the user data in storage
   */
  async setUser(user: any): Promise<void> {
    try {
      await storage.setItem(USER_KEY, user);
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  }

  /**
   * Clear all tokens and user data from storage
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        storage.removeItem(TOKEN_KEY),
        storage.removeItem(REFRESH_TOKEN_KEY),
        storage.removeItem(USER_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  }

  /**
   * Check if user has a valid token stored
   */
  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && token.length > 0;
  }
}

export default new TokenManager();
