/**
 * Admin Inventory & Warehouse Controller
 * Handles Dashboard Metrics, Master List, and Quick Adjustments.
 */

import { adminApi } from './admin-api.js';
import { formatCurrency } from '../helpers/helpers.js';
import { ui } from '../components/ui.js';

let allInventory = [];

export async function loadInventory() {
  const tbody = document.getElementById('admin-inventory-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading inventory...</td></tr>';
  
  try {
    // Fetch dashboard stats and master list concurrently
    const [dash, list] = await Promise.all([
      adminApi.getInventoryDashboard(),
      adminApi.getInventoryList()
    ]);

    // Update Top Metrics
    document.getElementById('inv-total-skus').textContent = dash.total_products || 0;
    document.getElementById('inv-total-stock').textContent = dash.total_stock_items || 0;
    document.getElementById('inv-low-stock').textContent = dash.low_stock_products || 0;
    document.getElementById('inv-out-of-stock').textContent = dash.out_of_stock_products || 0;

    // Render Master Table
    allInventory = list.items || [];
    renderInventoryTable(allInventory);

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Error loading inventory: ${e.message}</td></tr>`;
  }
}

function renderInventoryTable(items) {
  const tbody = document.getElementById('admin-inventory-table');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No inventory records found.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(inv => {
    // Determine status badge based on logic from the backend
    let badgeClass = 'success';
    let badgeText = 'In Stock';
    if (inv.stock_quantity === 0) {
      badgeClass = 'danger';
      badgeText = 'Out of Stock';
    } else if (inv.stock_quantity <= inv.low_stock_threshold) {
      badgeClass = 'warning';
      badgeText = 'Low Stock';
    }

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="http://localhost:8000${inv.image_url}" alt="" style="width:40px; height:40px; object-fit:cover; border-radius:4px; border:1px solid var(--border-light);">
            <strong>${inv.product_name}</strong>
          </div>
        </td>
        <td><span style="font-family: monospace; background: var(--surface); padding: 4px; border: 1px solid var(--border-light); border-radius: 4px;">${inv.sku || 'N/A'}</span></td>
        <td>${inv.category_name || '-'}</td>
        <td style="font-size: 16px; font-weight: 700;">${inv.stock_quantity}</td>
        <td><span class="admin-badge ${badgeClass}">${badgeText}</span></td>
        <td>
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;" onclick="window.adminInventoryManager.openAdjustModal(${inv.product_id}, '${(inv.product_name || '').replace(/'/g, "\\'")}', '${inv.sku || ''}', ${inv.stock_quantity})">Adjust Stock</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── DOM Listeners ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('admin-stock-modal');
  const form = document.getElementById('admin-stock-form');
  if (!modal || !form) return;

  // Search & Filters
  const searchInput = document.getElementById('inv-search');
  const statusFilter = document.getElementById('inv-status-filter');

  function filterTable() {
    const q = searchInput.value.toLowerCase();
    const s = statusFilter.value;

    const filtered = allInventory.filter(inv => {
      const matchQ = inv.product_name.toLowerCase().includes(q) || (inv.sku || '').toLowerCase().includes(q);
      
      let matchS = true;
      if (s === 'out_of_stock') matchS = inv.stock_quantity === 0;
      else if (s === 'low_stock') matchS = inv.stock_quantity > 0 && inv.stock_quantity <= inv.low_stock_threshold;
      else if (s === 'in_stock') matchS = inv.stock_quantity > inv.low_stock_threshold;

      return matchQ && matchS;
    });

    renderInventoryTable(filtered);
  }

  searchInput?.addEventListener('input', filterTable);
  statusFilter?.addEventListener('change', filterTable);

  // Expose global methods
  window.adminInventoryManager = {
    openAdjustModal: (productId, productName, sku, currentQty) => {
      form.reset();
      document.getElementById('stock_product_id').value = productId;
      document.getElementById('stock_product_name').textContent = productName;
      document.getElementById('stock_product_sku').textContent = `SKU: ${sku || 'N/A'}`;
      document.getElementById('stock_quantity').value = currentQty;
      
      modal.classList.add('active');
      // Auto-focus the quantity input for rapid data entry
      setTimeout(() => document.getElementById('stock_quantity').focus(), 100);
    }
  };

  // Submit Stock Adjustment
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('admin-stock-submit');
    const ogText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Updating...';

    try {
      const productId = document.getElementById('stock_product_id').value;
      const newQty = parseInt(document.getElementById('stock_quantity').value, 10);
      
      // Note: Backend supports variantId, but current table list structure only exposes products.
      await adminApi.updateStock(productId, null, newQty);
      
      ui.showToast('Success', 'Stock level updated successfully!', 'success');
      modal.classList.remove('active');
      
      // Refresh inventory master view
      loadInventory();
      // Also refresh dashboard if it's hooked
    } catch (err) {
      ui.showToast('Error', err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = ogText;
    }
  });

});
