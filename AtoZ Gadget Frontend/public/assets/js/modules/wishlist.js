/**
 * Wishlist Module
 * Syncs wishlist state between user interface and backend API `/api/wishlist/...` endpoints.
 */

import { api } from '../api/api.js';

export const wishlist = {
  state: {
    items: []
  },

  /**
   * Fetch wishlist items
   */
  async get() {
    // Prevent unauthenticated calls which trigger auto-redirects
    const token = localStorage.getItem('access_token');
    if (!token) return [];

    try {
      const response = await api.request('/api/wishlist');
      if (response.success && response.data) {
        this.state.items = response.data;
        this.triggerUpdate();
        return this.state.items;
      }
      return [];
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      throw err;
    }
  },

  /**
   * Add item to wishlist
   */
  async add(productId) {
    try {
      const response = await api.request('/api/wishlist/add', {
        method: 'POST',
        body: { product_id: productId }
      });
      
      if (response.success) {
        await this.get(); // Refresh state
        document.dispatchEvent(new CustomEvent('wishlist:item:added', { detail: { productId } }));
      }
      return response;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      throw err;
    }
  },

  /**
   * Remove item from wishlist
   */
  async remove(productId) {
    try {
      const response = await api.request(`/api/wishlist/remove/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        await this.get(); // Refresh state
        document.dispatchEvent(new CustomEvent('wishlist:item:removed', { detail: { productId } }));
      }
      return response;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      throw err;
    }
  },

  /**
   * Check if a product is wishlisted locally
   */
  has(productId) {
    return this.state.items.some(item => item.product_id === productId || (item.product && item.product.id === productId));
  },

  triggerUpdate() {
    document.dispatchEvent(new CustomEvent('wishlist:updated', { detail: this.state }));
  }
};
