/**
 * Admin Coupon Manager Controller
 * Handles Listing and Creating Discount Coupons.
 * Note: Edit/Delete are natively unsupported by backend.
 */

import { adminApi } from './admin-api.js';
import { formatCurrency, formatDate } from '../helpers/helpers.js';
import { ui } from '../components/ui.js';

let allCoupons = [];

export async function loadCoupons() {
  const tbody = document.getElementById('admin-coupons-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading coupons...</td></tr>';
  
  try {
    allCoupons = await adminApi.getCoupons();
    renderCouponsTable(allCoupons);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Error loading coupons: ${e.message}</td></tr>`;
  }
}

function renderCouponsTable(coupons) {
  const tbody = document.getElementById('admin-coupons-table');
  if (!tbody) return;

  if (coupons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No active coupons found.</td></tr>';
    return;
  }

  tbody.innerHTML = coupons.map(c => `
    <tr>
      <td><strong><span style="font-family: monospace; background: var(--surface); padding: 4px 8px; border: 1px dashed var(--border-light); border-radius: 4px;">${c.code}</span></strong></td>
      <td><span class="admin-badge info">${c.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</span></td>
      <td>
        <strong>${c.discount_type === 'percentage' ? c.discount_value + '%' : formatCurrency(c.discount_value)}</strong>
        ${c.maximum_discount ? `<br><small style="color:var(--text-muted);">Max: ${formatCurrency(c.maximum_discount)}</small>` : ''}
      </td>
      <td>${c.minimum_order_amount > 0 ? formatCurrency(c.minimum_order_amount) : 'None'}</td>
      <td>
        <div style="font-size: 13px;">
          <div><span style="color:var(--text-muted);">Start:</span> ${formatDate(c.start_date)}</div>
          <div><span style="color:var(--text-muted);">End:</span> ${formatDate(c.end_date)}</div>
        </div>
      </td>
      <td>${c.usage_limit ? c.usage_limit + ' Uses' : 'Unlimited'}</td>
    </tr>
  `).join('');
}

// ── DOM Listeners ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('admin-coupon-modal');
  const form = document.getElementById('admin-coupon-form');
  const typeSelect = document.getElementById('coupon_type');
  const maxDiscountInput = document.getElementById('coupon_max_discount');

  if (!modal || !form) return;

  // Toggle Max Discount field based on type
  typeSelect?.addEventListener('change', (e) => {
    if (e.target.value === 'flat') {
      maxDiscountInput.value = '';
      maxDiscountInput.disabled = true;
    } else {
      maxDiscountInput.disabled = false;
    }
  });

  window.adminCouponManager = {
    openCreateModal: () => {
      form.reset();
      
      // Default to 1 week from now
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      document.getElementById('coupon_start').value = now.toISOString().slice(0,16);
      document.getElementById('coupon_end').value = nextWeek.toISOString().slice(0,16);
      
      modal.classList.add('active');
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('admin-coupon-submit');
    const ogText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Creating...';

    try {
      const fd = new FormData(form);
      const payload = {
        code: fd.get('code').toUpperCase(),
        discount_type: fd.get('discount_type'),
        discount_value: parseFloat(fd.get('discount_value')),
        minimum_order_amount: parseFloat(fd.get('minimum_order_amount')) || 0,
        start_date: new Date(fd.get('start_date')).toISOString(),
        end_date: new Date(fd.get('end_date')).toISOString(),
        status: 'active'
      };

      const max_desc = fd.get('maximum_discount');
      if (max_desc && payload.discount_type === 'percentage') {
        payload.maximum_discount = parseFloat(max_desc);
      }
      
      const limit = fd.get('usage_limit');
      if (limit) {
        payload.usage_limit = parseInt(limit, 10);
      }

      await adminApi.createCoupon(payload);
      
      ui.showToast('Success', 'Coupon created successfully!', 'success');
      modal.classList.remove('active');
      loadCoupons();
    } catch (err) {
      ui.showToast('Error', err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = ogText;
    }
  });
});
