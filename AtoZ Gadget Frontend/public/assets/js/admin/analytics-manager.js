/**
 * Admin Analytics & BI Manager
 * Handles fetching and visualizing complex data natively.
 */

import { adminApi } from './admin-api.js';
import { formatCurrency } from '../helpers/helpers.js';

export async function loadAnalytics() {
  await Promise.all([
    loadTimeReport('daily'),
    loadFunnel(),
    loadOperationalData()
  ]);
}

// ── Time Based Reports ──────────────────────────────────────────────────
async function loadTimeReport(timeframe) {
  const container = document.getElementById('bi-time-cards');
  if (!container) return;
  container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Loading data...</div>';

  try {
    const data = await adminApi.getAnalyticsReport(timeframe);
    
    container.innerHTML = `
      <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
        <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Total Revenue (${timeframe})</div>
        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${formatCurrency(data.total_revenue || 0)}</div>
      </div>
      <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
        <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Total Orders</div>
        <div style="font-size: 32px; font-weight: 700;">${data.total_orders || 0}</div>
      </div>
      <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
        <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Active Users</div>
        <div style="font-size: 32px; font-weight: 700;">${data.active_users || 0}</div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div style="grid-column:1/-1; color:red; text-align:center;">Failed to load report: ${e.message}</div>`;
  }
}

// ── Conversion Funnel ───────────────────────────────────────────────────
async function loadFunnel() {
  const container = document.getElementById('bi-funnel-container');
  if (!container) return;

  try {
    const data = await adminApi.getAnalyticsFunnel();
    
    // Normalize data (backend might return dictionary mapping stage to count)
    // Common stages: page_view, add_to_cart, begin_checkout, purchase
    const stages = [
      { key: 'page_view', label: 'Site Visitors' },
      { key: 'add_to_cart', label: 'Added to Cart' },
      { key: 'begin_checkout', label: 'Initiated Checkout' },
      { key: 'purchase', label: 'Successful Purchases' }
    ];

    const maxCount = Math.max(...stages.map(s => data[s.key] || 0), 1); // prevent div/0

    container.innerHTML = stages.map((stage, i) => {
      const count = data[stage.key] || 0;
      const widthPct = (count / maxCount) * 100;
      
      let dropoffHtml = '';
      if (i > 0) {
        const prevCount = data[stages[i-1].key] || 0;
        const dropRate = prevCount > 0 ? (((prevCount - count) / prevCount) * 100).toFixed(1) : 0;
        dropoffHtml = `<div style="font-size: 12px; color: var(--danger); text-align: center; margin-bottom: 8px;">&darr; ${dropRate}% drop-off</div>`;
      }

      return `
        ${dropoffHtml}
        <div class="funnel-stage">
          <div class="funnel-bar" style="width: ${widthPct}%"></div>
          <div class="funnel-content">
            <strong style="font-size: 16px;">${stage.label}</strong>
            <span style="font-size: 18px; font-weight: 700;">${count.toLocaleString()}</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (e) {
    container.innerHTML = `<div style="color:red; text-align:center;">Failed to load funnel: ${e.message}</div>`;
  }
}

// ── Operational Data ────────────────────────────────────────────────────
async function loadOperationalData() {
  const prods = document.getElementById('bi-top-products');
  const custs = document.getElementById('bi-top-customers');
  if (!prods || !custs) return;

  try {
    const [productsData, customersData] = await Promise.all([
      adminApi.getTopProducts().catch(() => []),
      adminApi.getTopCustomers().catch(() => [])
    ]);

    prods.innerHTML = productsData.length ? productsData.map(p => `
      <tr>
        <td><strong>${p.name || `Product #${p.product_id}`}</strong></td>
        <td>${p.total_quantity_sold || 0}</td>
        <td style="color: var(--primary); font-weight:600;">${formatCurrency(p.total_revenue || 0)}</td>
      </tr>
    `).join('') : '<tr><td colspan="3">No data available.</td></tr>';

    custs.innerHTML = customersData.length ? customersData.map(c => `
      <tr>
        <td><strong>${c.user_name || `User #${c.user_id}`}</strong><br><small style="color:var(--text-muted);">${c.user_email || ''}</small></td>
        <td>${c.total_orders || 0}</td>
        <td style="color: var(--primary); font-weight:600;">${formatCurrency(c.total_spent || 0)}</td>
      </tr>
    `).join('') : '<tr><td colspan="3">No data available.</td></tr>';

  } catch (e) {
    prods.innerHTML = `<tr><td colspan="3" style="color:red;">Error: ${e.message}</td></tr>`;
    custs.innerHTML = `<tr><td colspan="3" style="color:red;">Error: ${e.message}</td></tr>`;
  }
}

// ── DOM Listeners ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Tabs logic
  const tabs = document.querySelectorAll('.bi-tab');
  const panels = document.querySelectorAll('.bi-panel');
  
  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
      });
    });
  }

  const timeframeSelect = document.getElementById('bi-timeframe');
  if (timeframeSelect) {
    timeframeSelect.addEventListener('change', (e) => {
      loadTimeReport(e.target.value);
    });
  }
});
