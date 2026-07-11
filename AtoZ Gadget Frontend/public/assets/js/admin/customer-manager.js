/**
 * Admin Customer Manager Controller (CRM)
 * Handles Master List, Address Books, Order Histories, and Access Toggles.
 */

import { adminApi } from './admin-api.js';
import { formatCurrency, formatDate } from '../helpers/helpers.js';
import { ui } from '../components/ui.js';

let allCustomers = [];
let currentCustomer = null;

export async function loadCustomers() {
  const tbody = document.getElementById('admin-customers-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading CRM...</td></tr>';
  
  try {
    allCustomers = await adminApi.getCustomers();
    renderCustomersTable(allCustomers);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red;">Error loading customers: ${e.message}</td></tr>`;
  }
}

function renderCustomersTable(customers) {
  const tbody = document.getElementById('admin-customers-table');
  if (!tbody) return;

  if (customers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No customers found matching criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map(c => `
    <tr>
      <td><strong>#${c.id}</strong></td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:30px; height:30px; border-radius:50%; background:var(--admin-primary); color:white; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold;">
            ${(c.first_name?.[0] || '')}${(c.last_name?.[0] || '')}
          </div>
          ${c.first_name} ${c.last_name || ''}
        </div>
      </td>
      <td>${c.email}</td>
      <td>${c.mobile || '-'}</td>
      <td>${formatDate(c.created_at)}</td>
      <td>
        <span class="admin-badge ${c.is_active ? 'success' : 'danger'}">${c.is_active ? 'Active' : 'Suspended'}</span>
      </td>
      <td>
        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;" onclick="window.adminCustomerManager.openCustomer(${c.id})">View CRM</button>
      </td>
    </tr>
  `).join('');
}

// ── DOM Listeners ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('admin-customer-modal');
  if (!modal) return;

  // Search & Filters
  document.getElementById('admin-customer-filter-btn')?.addEventListener('click', () => {
    const q = document.getElementById('admin-customer-search').value.toLowerCase();
    const status = document.getElementById('admin-customer-status-filter').value;

    let filtered = allCustomers.filter(c => {
      const matchQ = `${c.first_name} ${c.last_name} ${c.email} ${c.mobile}`.toLowerCase().includes(q) || String(c.id) === q;
      const matchS = status === '' || 
                    (status === 'active' && c.is_active) || 
                    (status === 'banned' && !c.is_active);
      return matchQ && matchS;
    });

    renderCustomersTable(filtered);
  });

  // Modal Tabs
  const tabs = document.querySelectorAll('.cm-tab');
  const panels = document.querySelectorAll('.cm-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
  });

  // Attach global functions
  window.adminCustomerManager = {
    openCustomer: async (id) => {
      try {
        ui.showToast('Info', 'Fetching deep CRM profile...', 'info');
        const data = await adminApi.getCustomerDetails(id);
        if (!data || !data.customer) throw new Error("Customer payload invalid");
        currentCustomer = data;
        
        populateCustomerModal();
        
        // Reset tabs to first
        tabs[0].click();
        modal.classList.add('active');
      } catch (e) {
        ui.showToast('Error', e.message, 'error');
      }
    },

    toggleStatus: async () => {
      if (!currentCustomer || !currentCustomer.customer) return;
      const c = currentCustomer.customer;
      const newStatus = !c.is_active;
      
      const confirmMsg = newStatus ? `Reactivate ${c.first_name}'s account?` : `Suspend ${c.first_name}'s account? They will be unable to login.`;
      if (!confirm(confirmMsg)) return;

      try {
        await adminApi.updateCustomerStatus(c.id, newStatus);
        ui.showToast('Success', `Account has been ${newStatus ? 'activated' : 'suspended'}.`, 'success');
        
        // Refresh detail view and master list
        await window.adminCustomerManager.openCustomer(c.id);
        loadCustomers();
      } catch (e) {
        ui.showToast('Error', e.message, 'error');
      }
    }
  };

  function populateCustomerModal() {
    const c = currentCustomer.customer;
    const addresses = currentCustomer.addresses || [];
    const orders = currentCustomer.orders || [];

    // --- TAB 1: SUMMARY ---
    document.getElementById('cm-full-name').textContent = `${c.first_name} ${c.last_name || ''}`;
    document.getElementById('cm-email').textContent = c.email;
    document.getElementById('cm-mobile').textContent = c.mobile || 'Not Provided';
    document.getElementById('cm-joined').textContent = formatDate(c.created_at);
    document.getElementById('cm-user-id').textContent = `#${c.id}`;
    
    document.getElementById('cm-avatar-initials').textContent = `${(c.first_name?.[0] || '')}${(c.last_name?.[0] || '')}`;

    const statusBadge = document.getElementById('cm-status-badge');
    const toggleBtn = document.getElementById('cm-toggle-status-btn');
    
    if (c.is_active) {
      statusBadge.textContent = 'Active';
      statusBadge.className = 'admin-badge success';
      toggleBtn.textContent = 'Suspend Account';
      toggleBtn.className = 'btn btn-outline';
      toggleBtn.style.color = 'var(--danger)';
      toggleBtn.style.borderColor = 'var(--danger)';
    } else {
      statusBadge.textContent = 'Suspended';
      statusBadge.className = 'admin-badge danger';
      toggleBtn.textContent = 'Activate Account';
      toggleBtn.className = 'btn btn-primary';
      toggleBtn.style.color = '';
      toggleBtn.style.borderColor = '';
    }

    toggleBtn.onclick = window.adminCustomerManager.toggleStatus;

    // --- TAB 2: ADDRESSES ---
    const addrGrid = document.getElementById('cm-address-grid');
    if (addresses.length === 0) {
      addrGrid.innerHTML = `<div style="grid-column:1/-1; padding:24px; text-align:center; border:1px solid var(--border-light); border-radius:8px;">No saved addresses.</div>`;
    } else {
      addrGrid.innerHTML = addresses.map(a => `
        <div style="background:var(--surface); border:1px solid var(--border-light); border-radius:8px; padding:16px; position:relative;">
          ${a.is_default ? `<span class="admin-badge info" style="position:absolute; top:12px; right:12px; font-size:10px;">Default</span>` : ''}
          <div style="font-weight:600; margin-bottom:8px;">${a.full_name} (${a.address_type})</div>
          <div style="color:var(--text-secondary); font-size:14px; line-height:1.5;">
            ${a.address_line1}<br>
            ${a.address_line2 ? a.address_line2 + '<br>' : ''}
            ${a.city}, ${a.state} ${a.pincode}<br>
            ${a.country}<br>
            <span style="color:var(--text-muted); margin-top:8px; display:block;">Mobile: ${a.mobile}</span>
          </div>
        </div>
      `).join('');
    }

    // --- TAB 3: ORDERS ---
    const ordTable = document.getElementById('cm-orders-table');
    if (orders.length === 0) {
      ordTable.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px;">No order history found.</td></tr>`;
    } else {
      ordTable.innerHTML = orders.map(o => `
        <tr>
          <td><strong>${o.order_number}</strong></td>
          <td>${formatDate(o.created_at)}</td>
          <td><span class="admin-badge ${o.order_status === 'delivered' ? 'success' : o.order_status === 'cancelled' ? 'danger' : 'info'}">${o.order_status}</span></td>
          <td>${o.payment_status}</td>
          <td>${formatCurrency(o.total_amount)}</td>
          <td>
            <button class="btn btn-outline" style="padding:4px 8px; font-size:12px;" onclick="window.adminOrderManager.openOrder(${o.id})">View Order</button>
          </td>
        </tr>
      `).join('');
    }
  }

});
