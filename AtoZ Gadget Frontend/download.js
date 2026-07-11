/**
 * Account Dashboard Controller
 */

import { account } from '../modules/account.js';
import { orderManager } from '../modules/order.js';
import { auth } from '../modules/auth.js';
import { ui } from '../components/ui.js';
import { formatPrice } from '../helpers/helpers.js';
import { session } from '../modules/session.js';

function initAccountPage() {
  // Only run if we are on the account page container
  const container = document.getElementById('account-container');
  if (!container) return;

  // ── State ───────────────────────────────────────────────────────────────
  let currentUser = null;
  let addresses = [];
  let orders = [];

  // ── Elements ────────────────────────────────────────────────────────────
  const views = document.querySelectorAll('.account-view');
  const navItems = document.querySelectorAll('.account-nav-item[data-target]');
  const loadingState = document.getElementById('account-loading');

  // Sidebar
  const sidebarName = document.getElementById('sidebar-name');
  const sidebarEmail = document.getElementById('sidebar-email');
  const sidebarAvatar = document.getElementById('sidebar-avatar');

  // ── Initialization ──────────────────────────────────────────────────────

  const initAccount = async (user) => {
    currentUser = user;
    if (loadingState) loadingState.style.display = 'none';
    container.style.display = 'flex';
    initUI();
    await loadInitialData();
  };

  if (session.initialized && session.user) {
    initAccount(session.user);
  } else {
    document.addEventListener('auth:ready', async (e) => {
      await initAccount(e.detail.user);
    });
  }

  function initUI() {
    // Populate Sidebar
    sidebarName.textContent = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'User';
    sidebarEmail.textContent = currentUser.email;
    sidebarAvatar.textContent = (currentUser.first_name ? currentUser.first_name.charAt(0) : 'U').toUpperCase();

    // Populate Profile Form
    document.getElementById('prof-fname').value = currentUser.first_name || '';
    document.getElementById('prof-lname').value = currentUser.last_name || '';
    document.getElementById('prof-email').value = currentUser.email || '';
    document.getElementById('prof-phone').value = currentUser.mobile || '';

    // Handle Hash Navigation
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Bind Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      auth.logout();
    });

    // Bind Profile Update
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);

    // Bind Address Modal
    document.getElementById('btn-add-address').addEventListener('click', () => openAddressModal());
    document.getElementById('btn-save-address').addEventListener('click', handleSaveAddress);

    // Bind Back to Orders
    document.getElementById('btn-back-to-orders').addEventListener('click', () => {
      window.location.hash = '#orders';
    });
  }

  async function loadInitialData() {
    try {
      // Load addresses and orders in parallel
      const [addrData, ordersData] = await Promise.all([
        account.getAddresses(),
        orderManager.getMyOrders()
      ]);
      
      addresses = addrData;
      orders = ordersData;

      renderDashboardStats();
      renderAddresses();
      renderOrders();
    } catch (e) {
      console.error('Failed to load account data', e);
      ui.showToast('Error', 'Failed to load some account data.', 'error');
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  
  function handleHashChange() {
    let hash = window.location.hash || '#dashboard';
    // If it's a deep link to an order detail: #orders/123
    let viewTarget = `view-${hash.replace('#', '').split('/')[0]}`;
    
    if (hash.startsWith('#orders/')) {
      viewTarget = 'view-order-details';
      const orderId = hash.split('/')[1];
      loadOrderDetails(orderId);
    }

    // Switch active view
    views.forEach(v => v.classList.remove('active'));
    const targetEl = document.getElementById(viewTarget);
    if (targetEl) targetEl.classList.add('active');

    // Update sidebar nav
    navItems.forEach(n => {
      n.classList.remove('active');
      if (n.getAttribute('href') === hash.split('/')[0] || n.getAttribute('href') === hash) {
        n.classList.add('active');
      }
    });
  }

  // ── Profile ─────────────────────────────────────────────────────────────

  async function handleProfileUpdate(e) {
    e.preventDefault();
    const btn = document.getElementById('prof-submit-btn');
    const first_name = document.getElementById('prof-fname').value.trim();
    const last_name = document.getElementById('prof-lname').value.trim();
    const mobile = document.getElementById('prof-phone').value.trim();

    try {
      btn.disabled = true;
      btn.innerHTML = 'Saving...';
      const updatedUser = await account.updateProfile({ first_name, last_name, mobile });
      
      currentUser = { ...currentUser, ...updatedUser };
      sidebarName.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
      
      ui.showToast('Success', 'Profile updated successfully.', 'success');
    } catch (e) {
      ui.showToast('Update Failed', e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Save Changes';
    }
  }

  // ── Dashboard ───────────────────────────────────────────────────────────

  function renderDashboardStats() {
    document.getElementById('dash-greeting-name').textContent = currentUser.first_name || 'User';
    document.getElementById('stat-orders-count').textContent = orders.length;
    
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    
    document.getElementById('stat-orders-delivered').textContent = delivered;
    document.getElementById('stat-orders-pending').textContent = pending;

    // Render 3 recent orders
    const container = document.getElementById('dash-recent-orders');
    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-state">You have no recent orders.</div>`;
      return;
    }

    const recent = [...orders].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);
    container.innerHTML = recent.map(o => createOrderCard(o)).join('');
  }

  // ── Addresses ───────────────────────────────────────────────────────────

  function renderAddresses() {
    const container = document.getElementById('address-list-container');
    if (addresses.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">You haven't saved any addresses yet.</div>`;
      return;
    }

    container.innerHTML = addresses.map(addr => `
      <div class="address-card ${addr.is_default ? 'is-default' : ''}">
        ${addr.is_default ? '<div class="address-badge">Default</div>' : ''}
        <div class="address-name">${addr.label || 'Address'}</div>
        <div class="address-lines">
          ${addr.street}<br>
          ${addr.city}, ${addr.state} ${addr.zip_code}<br>
          ${addr.country}
        </div>
        <div class="address-actions">
          <button class="action-link" onclick="window.accountApp.editAddress(${addr.id})">Edit</button>
          ${!addr.is_default ? `<button class="action-link" onclick="window.accountApp.setDefaultAddress(${addr.id})">Set Default</button>` : ''}
          <button class="action-link danger" onclick="window.accountApp.deleteAddress(${addr.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  function openAddressModal(addrId = null) {
    const form = document.getElementById('address-form');
    form.reset();
    document.getElementById('addr-id').value = '';
    document.getElementById('address-modal-title').textContent = 'Add New Address';

    if (addrId) {
      const addr = addresses.find(a => a.id === addrId);
      if (addr) {
        document.getElementById('address-modal-title').textContent = 'Edit Address';
        document.getElementById('addr-id').value = addr.id;
        document.getElementById('addr-label').value = addr.label || '';
        document.getElementById('addr-street').value = addr.street;
        document.getElementById('addr-city').value = addr.city;
        document.getElementById('addr-state').value = addr.state;
        document.getElementById('addr-zip').value = addr.zip_code;
        document.getElementById('addr-country').value = addr.country || 'US';
        document.getElementById('addr-default').checked = addr.is_default;
      }
    }
    
    document.getElementById('address-modal').classList.add('active');
  }

  async function handleSaveAddress() {
    const id = document.getElementById('addr-id').value;
    const isDefault = document.getElementById('addr-default').checked;
    
    const data = {
      label: document.getElementById('addr-label').value,
      street: document.getElementById('addr-street').value,
      city: document.getElementById('addr-city').value,
      state: document.getElementById('addr-state').value,
      zip_code: document.getElementById('addr-zip').value,
      country: document.getElementById('addr-country').value,
      is_default: isDefault
    };

    if (!data.street || !data.city || !data.state || !data.zip_code) {
      ui.showToast('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }

    try {
      document.getElementById('btn-save-address').disabled = true;
      if (id) {
        await account.updateAddress(id, data);
        ui.showToast('Success', 'Address updated successfully.', 'success');
      } else {
        await account.addAddress(data);
        ui.showToast('Success', 'Address added successfully.', 'success');
      }
      
      document.getElementById('address-modal').classList.remove('active');
      addresses = await account.getAddresses();
      renderAddresses();

    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    } finally {
      document.getElementById('btn-save-address').disabled = false;
    }
  }

  async function deleteAddress(id) {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await account.deleteAddress(id);
      addresses = addresses.filter(a => a.id !== id);
      renderAddresses();
      ui.showToast('Success', 'Address deleted.', 'success');
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  }

  async function setDefaultAddress(id) {
    try {
      await account.setDefaultAddress(id);
      addresses = await account.getAddresses();
      renderAddresses();
      ui.showToast('Success', 'Default address updated.', 'success');
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  }

  // Expose to window for inline onclick handlers
  window.accountApp = {
    editAddress: openAddressModal,
    deleteAddress,
    setDefaultAddress
  };

  // ── Orders ──────────────────────────────────────────────────────────────

  function createOrderCard(order) {
    const d = new Date(order.created_at).toLocaleDateString();
    return `
      <div class="order-item">
        <div class="order-meta">
          <div class="order-id">Order #${order.id}</div>
          <div class="order-date">Placed on ${d}</div>
        </div>
        <div class="order-status status-${order.status.toLowerCase()}">${order.status}</div>
        <div class="order-total">${formatPrice(order.total_amount)}</div>
        <div>
          <a href="#orders/${order.id}" class="btn btn-outline" style="padding: 6px 12px; font-size: 13px;">View Details</a>
        </div>
      </div>
    `;
  }

  function renderOrders() {
    const container = document.getElementById('order-history-list');
    if (orders.length === 0) {
      container.innerHTML = `<div class="empty-state">You have not placed any orders yet.</div>`;
      return;
    }
    // Sort descending
    const sorted = [...orders].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    container.innerHTML = sorted.map(o => createOrderCard(o)).join('');
  }

  async function loadOrderDetails(orderId) {
    const container = document.getElementById('order-details-content');
    container.innerHTML = `<div class="empty-state"><span class="spinner" style="border-top-color:var(--primary);width:30px;height:30px;margin-bottom:16px;"></span><br>Loading details...</div>`;
    
    try {
      const order = await orderManager.getOrderDetails(orderId);
      renderOrderDetailView(order);
    } catch (e) {
      container.innerHTML = `<div class="empty-state" style="color:var(--danger)">Failed to load order. ${e.message}</div>`;
    }
  }

  function renderOrderDetailView(order) {
    const tpl = document.getElementById('order-detail-template').content.cloneNode(true);
    
    document.getElementById('detail-order-title').textContent = `Order #${order.id}`;
    document.getElementById('detail-order-date').textContent = `Placed on ${new Date(order.created_at).toLocaleString()}`;
    
    tpl.querySelector('#tpl-order-status').textContent = order.status.toUpperCase();
    tpl.querySelector('#tpl-order-status').className = `order-status status-${order.status.toLowerCase()}`;
    tpl.querySelector('#tpl-order-total').textContent = formatPrice(order.total_amount);

    // Items
    const itemsHtml = order.items.map(item => `
      <div style="display: flex; gap: var(--spacing-4); align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: var(--spacing-3);">
        <img src="${item.product_image || '/public/assets/images/placeholder.png'}" alt="" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); background: var(--background);">
        <div style="flex: 1;">
          <div style="font-weight: 700; color: var(--text);">${item.product_name}</div>
          <div style="font-size: var(--text-sm); color: var(--text-muted);">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
        </div>
        <div style="font-weight: 700;">${formatPrice(item.quantity * item.price)}</div>
      </div>
    `).join('');
    tpl.querySelector('#tpl-order-items').innerHTML = itemsHtml;

    // Address
    if (order.shipping_address) {
      const addr = order.shipping_address;
      tpl.querySelector('#tpl-order-address').innerHTML = `
        ${addr.label ? `<strong>${addr.label}</strong><br>` : ''}
        ${addr.street}<br>
        ${addr.city}, ${addr.state} ${addr.zip_code}<br>
        ${addr.country}
      `;
    } else {
      tpl.querySelector('#tpl-order-address').textContent = 'No shipping address recorded.';
    }

    // Actions
    if (order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing') {
      tpl.querySelector('#tpl-order-actions').innerHTML = `
        <button class="btn btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="window.accountApp.cancelOrder(${order.id})">Cancel Order</button>
      `;
    }

    const container = document.getElementById('order-details-content');
    container.innerHTML = '';
    container.appendChild(tpl);
  }

  window.accountApp.cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order? This cannot be undone.')) return;
    try {
      await orderManager.cancelOrder(orderId, 'Customer requested cancellation');
      ui.showToast('Success', 'Order has been cancelled.', 'success');
      loadOrderDetails(orderId);
      // Update local list state
      const idx = orders.findIndex(o => o.id === parseInt(orderId));
      if (idx > -1) orders[idx].status = 'cancelled';
      renderDashboardStats();
    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    }
  };

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccountPage);
} else {
  initAccountPage();
}
