/**
 * Admin SPA Controller
 */

import { adminApi } from './admin-api.js';
import { auth } from '../modules/auth.js';
import { formatPrice } from '../helpers/helpers.js';
import { ui } from '../components/ui.js';
import { loadProducts } from './product-manager.js';
import { loadCategories, loadBrands } from './taxonomy-manager.js';
import { loadOrders } from './order-manager.js';
import { loadCustomers } from './customer-manager.js';
import { loadCoupons } from './coupon-manager.js';
import { loadCMS } from './cms-manager.js';
import { loadInventory } from './inventory-manager.js';
import { loadAnalytics } from './analytics-manager.js';
import { loadSystem } from './system-manager.js';
import { session } from '../modules/session.js';

function initAdminPage() {
  const guard = document.getElementById('admin-auth-guard');
  const appContainer = document.getElementById('admin-app');
  let currentAdmin = null;

  window.adminApp = window.adminApp || {};
  window.adminApp.loadCategories = loadCategories;
  window.adminApp.loadBrands = loadBrands;
  window.adminApp.loadOrders = loadOrders;
  window.adminApp.loadCustomers = loadCustomers;
  window.adminApp.loadCoupons = loadCoupons;
  window.adminApp.loadCMS = loadCMS;
  window.adminApp.loadInventory = loadInventory;
  window.adminApp.loadAnalytics = loadAnalytics;
  window.adminApp.loadSystem = loadSystem;

  // ── Auth Guard ──────────────────────────────────────────────────────────
  const initAdminApp = async (user) => {
    // Check role (super_admin or admin required)
    if (user.role_id !== 1 && user.role_id !== 2) {
      window.location.href = '/'; // Kick out normal users
      return;
    }

    currentAdmin = user;
    document.getElementById('admin-user-name').textContent = `${user.first_name || 'Admin'} (${user.role})`;
    
    // Show App
    if (guard) guard.style.display = 'none';
    if (appContainer) appContainer.style.opacity = '1';

    initApp();
  };

  if (session.initialized && session.user) {
    initAdminApp(session.user);
  } else {
    document.addEventListener('auth:ready', async (e) => {
      await initAdminApp(e.detail.user);
    });
  }

  // ── Initialization & Routing ────────────────────────────────────────────
  function initApp() {
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    document.getElementById('admin-logout').addEventListener('click', () => {
      auth.logout();
    });
  }

  function handleHashChange() {
    const hash = window.location.hash || '#dashboard';
    const viewTarget = `view-${hash.replace('#', '')}`;

    // Update active nav
    document.querySelectorAll('.admin-nav-item[data-target]').forEach(n => {
      n.classList.remove('active');
      if (n.getAttribute('href') === hash) n.classList.add('active');
    });

    // Update active view
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    const targetEl = document.getElementById(viewTarget);
    if (targetEl) targetEl.classList.add('active');

    // Update title
    const navItem = document.querySelector(`.admin-nav-item[href="${hash}"]`);
    if (navItem) document.getElementById('admin-page-title').textContent = navItem.textContent;

    // Load data based on view
    if (hash === '#dashboard') loadDashboard();
    if (hash === '#orders') window.adminApp.loadOrders();
    if (hash === '#products') loadProducts();
    if (hash === '#categories') window.adminApp.loadCategories();
    if (hash === '#brands') window.adminApp.loadBrands();
    if (hash === '#customers') window.adminApp.loadCustomers();
    if (hash === '#coupons') window.adminApp.loadCoupons();
    if (hash === '#cms') window.adminApp.loadCMS();
    if (hash === '#inventory') window.adminApp.loadInventory();
    if (hash === '#analytics') window.adminApp.loadAnalytics();
    if (hash === '#system') window.adminApp.loadSystem();
  }

  // ── Dashboard View ──────────────────────────────────────────────────────
  let salesChartInstance = null;

  async function loadDashboard() {
    try {
      // 1. Stats
      const stats = await adminApi.getDashboardStats();
      if (stats) {
        document.getElementById('stat-revenue').textContent = formatPrice(stats.total_revenue || 0);
        document.getElementById('stat-orders').textContent = stats.total_orders || 0;
        document.getElementById('stat-customers').textContent = stats.total_customers || 0;
      }

      // 2. Chart
      const chartData = await adminApi.getSalesChart();
      if (chartData && window.Chart) {
        renderSalesChart(chartData);
      }

      // 3. Recent Orders
      const orders = await adminApi.getOrders(); // For now just pull all and slice top 5
      const tbody = document.getElementById('admin-recent-orders');
      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent orders.</td></tr>';
      } else {
        const recent = orders.slice(0, 5);
        tbody.innerHTML = recent.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>User ID: ${o.user_id}</td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td style="font-weight:700;">${formatPrice(o.total_amount)}</td>
            <td><span class="admin-badge ${getBadgeColor(o.status)}">${o.status}</span></td>
          </tr>
        `).join('');
      }

    } catch (e) {
      console.error('Dashboard load failed', e);
      ui.showToast('Error', 'Failed to load dashboard metrics.', 'error');
    }
  }

  function getBadgeColor(status) {
    if (!status) return 'badge-secondary';
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'active') return 'badge-success';
    if (s === 'pending' || s === 'processing') return 'badge-warning';
    if (s === 'cancelled' || s === 'failed') return 'badge-danger';
    return 'badge-secondary';
  }

  function renderSalesChart(data) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    if (salesChartInstance) salesChartInstance.destroy();

    salesChartInstance = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels || [],
        datasets: [{
          label: 'Revenue',
          data: data.values || [],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminPage);
} else {
  initAdminPage();
}
