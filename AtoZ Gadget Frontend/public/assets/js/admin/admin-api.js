/**
 * Admin API Module
 * Handles all backend administrative requests.
 */

import { api } from '../api/api.js';

export const adminApi = {
  
  // ── Dashboard ─────────────────────────────────────────────────────────
  async getDashboardStats() {
    const res = await api.request('/api/admin/dashboard', { method: 'GET' });
    return res.success ? res.data : null;
  },

  async getSalesChart() {
    const res = await api.request('/api/admin/dashboard/sales-chart', { method: 'GET' });
    return res.success ? res.data : null;
  },

  async getTopProducts() {
    const res = await api.request('/api/admin/dashboard/top-products', { method: 'GET' });
    return res.success ? res.data : null;
  },

  // ── Orders ─────────────────────────────────────────────────────────────
  async getOrders() {
    const res = await api.request('/api/admin/orders', { method: 'GET' });
    if (!res.success) return [];
    return Array.isArray(res.data) ? res.data : (res.data?.items || []);
  },

  async getOrder(id) {
    const res = await api.request(`/api/admin/orders/${id}`, { method: 'GET' });
    return res.success ? res.data : null;
  },

  async updateOrderStatus(id, statusStr) {
    const res = await api.request(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: { order_status: statusStr }
    });
    if (!res.success) throw new Error(res.message || 'Failed to update order status');
    return res.data;
  },

  // ── Shipments ──────────────────────────────────────────────────────────
  async getShipment(orderId) {
    const res = await api.request(`/api/orders/${orderId}/shipment`, { method: 'GET' });
    return res.success ? res.data : null;
  },

  async createShipment(data) {
    const res = await api.request('/api/admin/shipment/create', { method: 'POST', body: data });
    if (!res.success) throw new Error(res.message || 'Failed to create shipment');
    return res.data;
  },

  async updateShipmentStatus(id, statusStr) {
    const res = await api.request(`/api/admin/shipment/update-status/${id}`, {
      method: 'PUT',
      body: { status: statusStr }
    });
    if (!res.success) throw new Error(res.message || 'Failed to update shipment status');
    return res.data;
  },

  // ── Returns ────────────────────────────────────────────────────────────
  async updateReturnStatus(id, statusStr, notes = '') {
    const res = await api.request(`/api/admin/returns/${id}/status`, {
      method: 'PUT',
      body: { status: statusStr, admin_notes: notes }
    });
    if (!res.success) throw new Error(res.message || 'Failed to update return status');
    return res.data;
  },

  // ── Coupons ────────────────────────────────────────────────────────────
  async getCoupons() {
    const res = await api.request('/api/coupons', { method: 'GET' });
    return res.success ? (res.data || []) : [];
  },

  async createCoupon(data) {
    const res = await api.request('/api/admin/coupons', { method: 'POST', body: data });
    if (!res.success) throw new Error(res.message || 'Failed to create coupon');
    return res.data;
  },

  // ── Customers ──────────────────────────────────────────────────────────
  async getCustomers() {
    // Note: API returns pagination, but we extract items array or return direct data if possible.
    const res = await api.request('/api/admin/customers', { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to fetch customers');
    // Handle paginated structure: res.data.items, or fallback to res.data if array
    return Array.isArray(res.data) ? res.data : (res.data?.items || []);
  },

  async getCustomerDetails(id) {
    const res = await api.request(`/api/admin/customers/${id}`, { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to fetch customer details');
    return res.data;
  },

  async updateCustomerStatus(customerId, is_active) {
    const res = await api.request(`/api/admin/customers/${customerId}/status`, {
      method: 'PUT',
      body: { is_active }
    });
    if (!res.success) throw new Error(res.message || 'Failed to update customer status');
    return res.data;
  },

  // ── Products ───────────────────────────────────────────────────────────
  async getProducts() {
    // The admin might want to fetch all products regardless of stock
    const res = await api.request('/api/products', { method: 'GET' });
    return res.success ? (res.data || []) : [];
  },

  async getProduct(id) {
    const res = await api.request(`/api/products/${id}`, { method: 'GET' });
    return res.success ? res.data : null;
  },

  async createProduct(data) {
    const res = await api.request('/api/products', {
      method: 'POST',
      body: data
    });
    if (!res.success) throw new Error(res.message || 'Failed to create product');
    return res.data;
  },

  async updateProduct(id, data) {
    const res = await api.request(`/api/products/${id}`, {
      method: 'PUT',
      body: data
    });
    if (!res.success) throw new Error(res.message || 'Failed to update product');
    return res.data;
  },

  async deleteProduct(id) {
    const res = await api.request(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete product');
    return true;
  },

  // ── Product Images ─────────────────────────────────────────────────────
  async uploadProductImage(productId, fileData, isPrimary = false) {
    const formData = new FormData();
    formData.append('file', fileData);
    
    // Some backend APIs use query params for flags: ?is_primary=true
    const url = `/api/products/${productId}/images` + (isPrimary ? '?is_primary=true' : '');
    
    const res = await api.request(url, {
      method: 'POST',
      body: formData
    });
    if (!res.success) throw new Error(res.message || 'Failed to upload image');
    return res.data;
  },

  async deleteProductImage(imageId) {
    const res = await api.request(`/api/product-images/${imageId}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete image');
    return true;
  },

  // ── Product Variants ───────────────────────────────────────────────────
  async addProductVariant(productId, data) {
    const res = await api.request(`/api/products/${productId}/variants`, {
      method: 'POST',
      body: data
    });
    if (!res.success) throw new Error(res.message || 'Failed to add variant');
    return res.data;
  },

  async deleteProductVariant(variantId) {
    const res = await api.request(`/api/product-variants/${variantId}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete variant');
    return true;
  },

  // ── Product Attributes ─────────────────────────────────────────────────
  async addProductAttribute(productId, data) {
    const res = await api.request(`/api/products/${productId}/attributes`, {
      method: 'POST',
      body: data
    });
    if (!res.success) throw new Error(res.message || 'Failed to add attribute');
    return res.data;
  },

  async deleteProductAttribute(attrId) {
    const res = await api.request(`/api/product-attributes/${attrId}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete attribute');
    return true;
  },

  // ── CMS (Banners) ───────────────────────────────────────────────────────
  async getBanners() {
    const res = await api.request('/api/banners', { method: 'GET' });
    return res.success ? (res.data || []) : [];
  },
  async createBanner(formData) {
    const res = await api.request('/api/admin/banners', { method: 'POST', body: formData });
    if (!res.success) throw new Error(res.message || 'Failed to create banner');
    return res.data;
  },
  async updateBanner(id, formData) {
    const res = await api.request(`/api/admin/banners/${id}`, { method: 'PUT', body: formData });
    if (!res.success) throw new Error(res.message || 'Failed to update banner');
    return res.data;
  },
  async deleteBanner(id) {
    const res = await api.request(`/api/admin/banners/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete banner');
    return res.data;
  },

  // ── Media Library ────────────────────────────────────────────────────────
  async getMedia() {
    const res = await api.request('/api/media', { method: 'GET' });
    return res.success ? (res.data || []) : [];
  },
  async uploadMedia(formData) {
    const res = await api.request('/api/media/upload', { method: 'POST', body: formData });
    if (!res.success) throw new Error(res.message || 'Failed to upload media');
    return res.data;
  },
  async deleteMedia(id) {
    const res = await api.request(`/api/media/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete media');
    return res.data;
  },

  // ── Inventory ──────────────────────────────────────────────────────────
  async getInventoryDashboard() {
    const res = await api.request('/api/admin/inventory/dashboard', { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to load inventory dashboard');
    return res.data;
  },
  async getInventoryList() {
    const res = await api.request('/api/admin/inventory', { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to load inventory list');
    return res.data;
  },
  async updateStock(productId, variantId, qty) {
    const url = `/api/admin/inventory/${productId}` + (variantId ? `?variant_id=${variantId}` : '');
    const res = await api.request(url, {
      method: 'PUT',
      body: { stock_quantity: qty }
    });
    if (!res.success) throw new Error(res.message || 'Failed to update stock');
    return res.data;
  },

  // ── Analytics & BI ───────────────────────────────────────────────────────
  async getAnalyticsReport(timeframe = 'daily') {
    const res = await api.request(`/api/analytics/reports/${timeframe}`, { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to fetch analytics report');
    return res.data;
  },
  async getAnalyticsFunnel() {
    const res = await api.request('/api/analytics/funnel', { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to fetch funnel data');
    return res.data;
  },
  async getTopProducts() {
    const res = await api.request('/api/admin/reports/products', { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to fetch top products');
    return res.data;
  },
  async getTopCustomers() {
    const res = await api.request('/api/admin/reports/customers', { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to fetch top customers');
    return res.data;
  },

  // ── System & Security ──────────────────────────────────────────────────
  async getAuditLogs() {
    const res = await api.request('/api/admin/audit-logs', { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to fetch audit logs');
    return res.data;
  },
  async getSystemHealth() {
    const res = await api.request('/api/health', { method: 'GET' });
    if (!res.success) throw new Error(res.message || 'Failed to fetch system health');
    return res.data;
  },

  // ── Global Uploads ─────────────────────────────────────────────────────
  async uploadGlobalFile(fileData, type = 'categories') {
    const formData = new FormData();
    formData.append('file', fileData);
    const res = await api.request(`/api/uploads?type=${type}`, {
      method: 'POST',
      body: formData
    });
    if (!res.success) throw new Error(res.message || 'Failed to upload file');
    return res.data;
  },

  // ── Categories ─────────────────────────────────────────────────────────
  async getCategories() {
    const res = await api.request('/api/categories', { method: 'GET' });
    return res.success ? (res.data || []) : [];
  },

  async createCategory(data) {
    const res = await api.request('/api/categories', { method: 'POST', body: data });
    if (!res.success) throw new Error(res.message || 'Failed to create category');
    return res.data;
  },

  async updateCategory(id, data) {
    const res = await api.request(`/api/categories/${id}`, { method: 'PUT', body: data });
    if (!res.success) throw new Error(res.message || 'Failed to update category');
    return res.data;
  },

  async deleteCategory(id) {
    const res = await api.request(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete category');
    return true;
  },

  // ── SubCategories ──────────────────────────────────────────────────────
  async getSubCategories() {
    const res = await api.request('/api/subcategories', { method: 'GET' });
    return res.success ? (res.data || []) : [];
  },

  async createSubCategory(data) {
    const res = await api.request('/api/subcategories', { method: 'POST', body: data });
    if (!res.success) throw new Error(res.message || 'Failed to create subcategory');
    return res.data;
  },

  async updateSubCategory(id, data) {
    const res = await api.request(`/api/subcategories/${id}`, { method: 'PUT', body: data });
    if (!res.success) throw new Error(res.message || 'Failed to update subcategory');
    return res.data;
  },

  async deleteSubCategory(id) {
    const res = await api.request(`/api/subcategories/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete subcategory');
    return true;
  },

  // ── Brands ─────────────────────────────────────────────────────────────
  async getBrands() {
    const res = await api.request('/api/brands', { method: 'GET' });
    return res.success ? (res.data || []) : [];
  },

  async createBrand(data) {
    const res = await api.request('/api/brands', { method: 'POST', body: data });
    if (!res.success) throw new Error(res.message || 'Failed to create brand');
    return res.data;
  },

  async updateBrand(id, data) {
    const res = await api.request(`/api/brands/${id}`, { method: 'PUT', body: data });
    if (!res.success) throw new Error(res.message || 'Failed to update brand');
    return res.data;
  },

  async deleteBrand(id) {
    const res = await api.request(`/api/brands/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error(res.message || 'Failed to delete brand');
    return true;
  }

};
