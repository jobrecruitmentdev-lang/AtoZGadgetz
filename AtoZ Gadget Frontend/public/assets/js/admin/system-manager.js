/**
 * System & Security Manager
 * Handles API Health Checks and Audit Log visualizations.
 */

import { adminApi } from './admin-api.js';

export async function loadSystem() {
  await Promise.all([
    loadHealth(),
    loadAuditLogs()
  ]);
}

// ── System Health ───────────────────────────────────────────────────────
async function loadHealth() {
  const grid = document.getElementById('sys-health-grid');
  if (!grid) return;

  try {
    const health = await adminApi.getSystemHealth();
    
    // Convert backend dict to visual cards
    grid.innerHTML = `
      <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center;">
          <span class="health-indicator ${health.status === 'ok' ? 'ok' : 'error'}"></span> Global Status
        </div>
        <div style="color: var(--text-secondary); font-size: 14px;">
          Version: <strong>${health.version || 'Unknown'}</strong><br>
          Timestamp: <strong>${new Date(health.timestamp).toLocaleString()}</strong>
        </div>
      </div>

      <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center;">
          <span class="health-indicator ${health.database?.status === 'connected' ? 'ok' : 'error'}"></span> Database Core
        </div>
        <div style="color: var(--text-secondary); font-size: 14px;">
          Latency: <strong>${health.database?.latency_ms || 0} ms</strong><br>
          Status: <strong>${health.database?.status || 'Unknown'}</strong>
        </div>
      </div>

      <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center;">
          <span class="health-indicator ok"></span> Frontend App
        </div>
        <div style="color: var(--text-secondary); font-size: 14px;">
          Environment: <strong>Production</strong><br>
          Service Worker: <strong>${'serviceWorker' in navigator ? 'Active' : 'Not Supported'}</strong>
        </div>
      </div>
    `;

  } catch (e) {
    grid.innerHTML = `<div style="grid-column: 1/-1; color: var(--danger); padding: 24px; background: var(--surface); border: 1px solid var(--danger); border-radius: 8px;">
      <strong>Critical Alert:</strong> Cannot connect to backend Health API.<br>
      Error: ${e.message}
    </div>`;
  }
}

// ── Audit Logs ──────────────────────────────────────────────────────────
async function loadAuditLogs() {
  const tbody = document.getElementById('sys-audit-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading audit trail...</td></tr>';

  try {
    const data = await adminApi.getAuditLogs();
    const logs = data.items || [];

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No audit logs found.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(log => `
      <tr>
        <td style="font-size: 13px; color: var(--text-secondary);">${new Date(log.created_at).toLocaleString()}</td>
        <td><strong>#${log.user_id}</strong></td>
        <td><span class="admin-badge info">${log.module}</span></td>
        <td>${log.action}</td>
        <td><span class="admin-badge ${log.status === 'success' ? 'success' : 'danger'}">${log.status}</span></td>
        <td style="font-family: monospace; font-size: 12px;">${log.ip_address || 'Unknown'}</td>
      </tr>
    `).join('');

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Failed to load logs: ${e.message}</td></tr>`;
  }
}

// ── DOM Listeners ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.sys-tab');
  const panels = document.querySelectorAll('.sys-panel');
  
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

  window.adminSystemManager = {
    refreshLogs: () => {
      loadAuditLogs();
    }
  };
});
