/**
 * Account Management Module
 * Handles User Profile and Address Book APIs
 */

import { api } from '../api/api.js';

export const account = {
  
  // ── Profile APIs ────────────────────────────────────────────────────────
  
  /**
   * Get current user profile
   */
  async getProfile() {
    const res = await api.request('/api/auth/me', { method: 'GET' });
    return res.success ? res.data : null;
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    // The backend router uses /api/profile
    const res = await api.request('/api/profile', {
      method: 'PUT',
      body: profileData
    });
    if (!res.success) throw new Error(res.message || 'Failed to update profile');
    return res.data;
  },


  // ── Address APIs ────────────────────────────────────────────────────────

  /**
   * Get all saved addresses for current user
   */
  async getAddresses() {
    const res = await api.request('/api/address', { method: 'GET' });
    return res.success ? (res.data || []) : [];
  },

  /**
   * Add a new address
   */
  async addAddress(addressData) {
    const res = await api.request('/api/address', {
      method: 'POST',
      body: addressData
    });
    if (!res.success) throw new Error(res.message || 'Failed to add address');
    return res.data;
  },

  /**
   * Update an existing address
   */
  async updateAddress(id, addressData) {
    const res = await api.request(`/api/address/${id}`, {
      method: 'PUT',
      body: addressData
    });
    if (!res.success) throw new Error(res.message || 'Failed to update address');
    return res.data;
  },

  /**
   * Delete an address
   */
  async deleteAddress(id) {
    const res = await api.request(`/api/address/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete address');
    return res.data;
  },

  /**
   * Set address as default
   */
  async setDefaultAddress(id) {
    const res = await api.request(`/api/address/${id}/default`, { method: 'POST' });
    if (!res.success) throw new Error(res.message || 'Failed to set default address');
    return res.data;
  }

};
