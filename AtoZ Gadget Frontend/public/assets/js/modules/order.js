/**
 * Order Management Module
 * Handles Order History, Tracking, and Cancellation APIs
 */

import { api } from '../api/api.js';

export const orderManager = {

  /**
   * Get all orders for the current user
   */
  async getMyOrders() {
    const res = await api.request('/api/orders', { method: 'GET' });
    if (!res.success) return [];
    return Array.isArray(res.data) ? res.data : (res.data?.items || []);
  },

  /**
   * Get details of a specific order
   */
  async getOrderDetails(orderId) {
    const res = await api.request(`/api/orders/${orderId}`, { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to load order details');
    return res.data;
  },

  /**
   * Cancel an order (if eligible)
   */
  async cancelOrder(orderId, reason = '') {
    const res = await api.request(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      body: { reason }
    });
    if (!res.success) throw new Error(res.message || 'Failed to cancel order');
    return res.data;
  }

};
