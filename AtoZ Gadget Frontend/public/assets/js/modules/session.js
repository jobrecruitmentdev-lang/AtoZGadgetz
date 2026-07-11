/**
 * Session & Route Guarding Module
 * Protects private routes and manages global user session state.
 */

import { tokenManager } from './token.js';
import { auth } from './auth.js';

class SessionManager {
  constructor() {
    this.user = null;
    this.isInitializing = false;
    this.initialized = false;
    // Protected: only accessible when logged in
    this.protectedRoutes = ['/home', '/account', '/checkout', '/wishlist', '/admin', '/cart', '/order-success'];
    // Guest-only: redirect to /home if already logged in
    this.guestRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  }

  /**
   * Run route guards immediately based on path
   */
  async init() {
    if (this.initialized) return;
    this.isInitializing = true;
    
    const currentPath = window.location.pathname;
    const isRoot = currentPath === '/' || currentPath === '/index.php';

    // Root path (/) is the same as login — redirect to /home if already logged in
    if (isRoot && tokenManager.isAuthenticated()) {
      window.location.href = '/home';
      return;
    }

    // Fast check: if no token and route is protected, redirect to login immediately
    if (!tokenManager.isAuthenticated() && this.isProtectedRoute(currentPath)) {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }

    // Fast check: if token exists but on a guest-only route (e.g. /login), send to /home
    if (tokenManager.isAuthenticated() && this.isGuestRoute(currentPath)) {
      window.location.href = '/home';
      return;
    }

    // Validate session with backend (verify token is still valid)
    if (tokenManager.isAuthenticated()) {
      try {
        this.user = await auth.getMe();
        document.dispatchEvent(new CustomEvent('auth:ready', { detail: { user: this.user } }));
      } catch (e) {
        // Token is invalid/expired and refresh failed — clear tokens
        tokenManager.clearTokens();
        if (this.isProtectedRoute(currentPath)) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return;
        }
      }
    }

    this.initialized = true;
    this.isInitializing = false;
  }

  isProtectedRoute(path) {
    return this.protectedRoutes.some(route => path === route || path.startsWith(route + '/'));
  }

  isGuestRoute(path) {
    return this.guestRoutes.some(route => path === route || path.startsWith(route + '/'));
  }
}

export const session = new SessionManager();

// Automatically init session on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    session.init();
  });
} else {
  session.init();
}
