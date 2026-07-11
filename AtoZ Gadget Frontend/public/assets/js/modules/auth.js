/**
 * Authentication Module
 * Wraps backend API endpoints for login, register, password reset, etc.
 */

import { api } from '../api/api.js';
import { tokenManager } from './token.js';

export const auth = {
  /**
   * Login user with credentials
   */
  async login(email, password) {
    // Note: FastAPI's OAuth2PasswordRequestForm expects form data, not JSON
    // But let's check the backend. If it's standard JSON we pass JSON.
    // The backend `auth.py` router.post("/login") actually accepts JSON: `UserLoginSchema`
    
    const response = await api.request('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    if (response.success && response.data) {
      tokenManager.setTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  },

  /**
   * Register a new user
   */
  async register(userData) {
    const response = await api.request('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    
    if (response.success && response.data) {
      // Sometimes register auto-logins and returns tokens
      if (response.data.access_token) {
        tokenManager.setTokens(response.data.access_token, response.data.refresh_token);
      }
      return response.data;
    }
    throw new Error(response.message || 'Registration failed');
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      // Notify backend if token revocation is supported
      if (tokenManager.isAuthenticated()) {
        await api.request('/api/auth/logout', { method: 'POST' });
      }
    } catch (e) {
      console.warn('Backend logout failed, proceeding with local logout', e);
    } finally {
      tokenManager.clearTokens();
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response = await api.request('/api/auth/me', { method: 'GET' });
    return response.success ? response.data : null;
  }
};
