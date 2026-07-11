/**
 * Shopping Cart Module
 * Syncs shopping cart state between the local memory/localStorage and the FastAPI backend.
 */

import { api } from '../api/api.js';

export const cart = {
  state: {
    items: [],
    subtotal: 0,
    total: 0
  },

  /**
   * Fetch cart details from backend
   */
  async get() {
    // Prevent unauthenticated calls which trigger auto-redirects
    const token = localStorage.getItem('access_token');
    if (!token) return this.state;

    try {
      const response = await api.request('/api/cart');
      if (response.success && response.data) {
        this.state = response.data;
        this.triggerUpdate();
        return this.state;
      }
      return this.state;
    } catch (err) {
      console.error('Error fetching cart:', err);
      // Fallback/offline behavior or bubble error up
      throw err;
    }
  },

  /**
   * Add a product item to cart
   */
  async add(productId, quantity = 1, variantId = null) {
    try {
      const response = await api.request('/api/cart/add', {
        method: 'POST',
        body: {
          product_id: productId,
          quantity: quantity,
          product_variant_id: variantId
        }
      });
      
      if (response.success) {
        await this.get(); // Refresh state
        document.dispatchEvent(new CustomEvent('cart:item:added', { detail: { productId, quantity } }));
      }
      return response;
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  },

  /**
   * Update quantity of a cart item
   */
  async update(itemId, quantity) {
    try {
      const response = await api.request(`/api/cart/update/${itemId}`, {
        method: 'PUT',
        body: {
          quantity: quantity
        }
      });
      
      if (response.success) {
        await this.get(); // Refresh state
        document.dispatchEvent(new CustomEvent('cart:item:updated', { detail: { itemId, quantity } }));
      }
      return response;
    } catch (err) {
      console.error('Error updating cart item:', err);
      throw err;
    }
  },

  /**
   * Remove a specific item from cart
   */
  async remove(itemId) {
    try {
      const response = await api.request(`/api/cart/remove/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        await this.get(); // Refresh state
        document.dispatchEvent(new CustomEvent('cart:item:removed', { detail: { itemId } }));
      }
      return response;
    } catch (err) {
      console.error('Error removing from cart:', err);
      throw err;
    }
  },

  /**
   * Clear all items in cart
   */
  async clear() {
    try {
      const response = await api.request('/api/cart/clear', {
        method: 'DELETE'
      });
      
      if (response.success) {
        this.state = { items: [], subtotal: 0, total: 0 };
        this.triggerUpdate();
      }
      return response;
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw err;
    }
  },

  /**
   * Dispatch custom event to notify listeners (e.g. Header badge)
   */
  triggerUpdate() {
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: this.state }));
  }
};
