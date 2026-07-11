<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px;">Security & System Monitor</div>

<!-- System Tabs -->
<div style="display: flex; gap: var(--spacing-4); margin-bottom: 24px; border-bottom: 1px solid var(--border-light);">
  <button class="sys-tab active" data-tab="sys-health">System Health</button>
  <button class="sys-tab" data-tab="sys-audit">Audit Logs</button>
</div>

<style>
  .sys-tab { background: none; border: none; padding: 12px 16px; font-weight: 600; font-size: 14px; color: var(--text-muted); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
  .sys-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
  .sys-panel { display: none; }
  .sys-panel.active { display: block; }
  
  .health-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
  .health-indicator.ok { background: var(--success); box-shadow: 0 0 8px var(--success); }
  .health-indicator.error { background: var(--danger); box-shadow: 0 0 8px var(--danger); }
</style>

<!-- TAB 1: System Health -->
<div id="sys-health" class="sys-panel active">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;" id="sys-health-grid">
    <div style="grid-column: 1/-1; text-align: center;">Running health diagnostics...</div>
  </div>
</div>

<!-- TAB 2: Audit Logs -->
<div id="sys-audit" class="sys-panel">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <p style="color: var(--text-secondary);">Enterprise security audit trail mapping all administrative and user actions.</p>
    <button class="btn btn-outline" onclick="window.adminSystemManager.refreshLogs()">Refresh Logs</button>
  </div>

  <div class="admin-table-wrapper">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>User ID</th>
          <th>Module</th>
          <th>Action</th>
          <th>Status</th>
          <th>IP Address</th>
        </tr>
      </thead>
      <tbody id="sys-audit-table">
        <tr><td colspan="6" style="text-align: center;">Loading audit trail...</td></tr>
      </tbody>
    </table>
  </div>
</div>
