/**
 * Centralized Fetch API Client Wrapper
 * Handles auto headers, session retries, token refresh interceptors, and loading states.
 */

const API_BASE_URL = 'http://localhost:8000';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.activeRequests = 0;
  }

  /**
   * Return base headers with auth token if available
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Core request wrapper
   */
  async request(endpoint, options = {}, retries = 0) {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
    const controller = new AbortController();
    const timeout = options.timeout || 15000;
    
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Build Headers natively to handle FormData
    const headers = { ...options.headers };
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let reqBody = options.body;
    if (reqBody && !(reqBody instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      reqBody = JSON.stringify(reqBody);
    }
    // If it is FormData, DO NOT set Content-Type, let the browser set it with boundary
    
    const fetchOptions = {
      method: options.method || 'GET',
      headers: headers,
      signal: controller.signal,
    };

    if (reqBody) {
      fetchOptions.body = reqBody;
    }

    try {
      this.incrementLoading();
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Handle 401 Unauthorized & Token Refresh Intercept
      if (response.status === 401 && !options._isRetry) {
        options._isRetry = true;
        const refreshed = await this.handleTokenRefresh();
        
        if (refreshed) {
          // Retry the request with new token
          fetchOptions.headers = this.getHeaders(options.headers);
          const retryResponse = await fetch(url, fetchOptions);
          return await this.parseResponse(retryResponse);
        } else {
          this.triggerLogout();
        }
      }

      return await this.parseResponse(response);

    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        throw new Error('Connection timeout. Please verify backend connection.');
      }
      
      if (retries > 0) {
        console.warn(`Request failed. Retrying... (${retries} retries left)`);
        return this.request(endpoint, options, retries - 1);
      }
      
      throw err;
    } finally {
      this.decrementLoading();
    }
  }

  /**
   * Handle HTTP response parsing
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    let body = null;
    
    if (contentType && contentType.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (body && body.detail) || (body && body.message) || response.statusText || 'Unknown error';
      throw new Error(errorMsg);
    }

    return body;
  }

  /**
   * Perform token refresh operations
   */
  async handleTokenRefresh() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data.access_token) {
          localStorage.setItem('access_token', json.data.access_token);
          if (json.data.refresh_token) {
            localStorage.setItem('refresh_token', json.data.refresh_token);
          }
          return true;
        }
      }
    } catch (e) {
      console.error('API token refresh error:', e);
    }
    return false;
  }

  /**
   * Reset local tokens and trigger redirect
   */
  triggerLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.dispatchEvent(new CustomEvent('auth:loggedout'));
    const guestRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (!guestRoutes.includes(window.location.pathname)) {
      window.location.href = '/login';
    }
  }

  /**
   * Show dynamic loader progress
   */
  incrementLoading() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      document.dispatchEvent(new CustomEvent('api:loading:start'));
    }
  }

  /**
   * Hide dynamic loader progress
   */
  decrementLoading() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      document.dispatchEvent(new CustomEvent('api:loading:end'));
    }
  }
}

export const api = new ApiClient();

/**
 * Convenience wrapper: fetchAPI(endpoint, options?)
 * Drop-in replacement for modules that import { fetchAPI } from '../api/api.js'
 * Usage: fetchAPI('/api/products') — same as api.request('/api/products')
 */
export async function fetchAPI(endpoint, options = {}) {
  return api.request(endpoint, options);
}
