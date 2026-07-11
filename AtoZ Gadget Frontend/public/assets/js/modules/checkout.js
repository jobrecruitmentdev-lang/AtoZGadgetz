/**
 * Checkout API Module
 * Connects to the backend checkout preview and order creation endpoints.
 */

import { api } from '../api/api.js';

export const checkoutApi = {
  
  /**
   * Preview the checkout totals (subtotal, tax, shipping, discounts)
   * Expected backend endpoint: POST /api/checkout/preview
   */
  async previewCheckout(couponCode = null) {
    const payload = couponCode ? { coupon_code: couponCode } : {};
    
    const res = await api.request('/api/checkout/preview', {
      method: 'POST',
      body: payload
    });
    
    if (!res.success) throw new Error(res.message || 'Failed to preview checkout');
    return res.data;
  },

  /**
   * Create a new order
   * Expected backend endpoint: POST /api/orders/create
   * Expected schema: { address_id: int, coupon_code: Optional[str] }
   */
  async createOrder(addressId, couponCode = null) {
    const payload = { address_id: addressId };
    if (couponCode) {
      payload.coupon_code = couponCode;
    }

    const res = await api.request('/api/orders/create', {
      method: 'POST',
      body: payload
    });

    if (!res.success) throw new Error(res.message || 'Failed to place order');
    return res.data;
  }

};
