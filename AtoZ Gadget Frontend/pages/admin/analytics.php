<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px;">Executive Analytics & BI Dashboard</div>

<!-- BI Tabs -->
<div style="display: flex; gap: var(--spacing-4); margin-bottom: 24px; border-bottom: 1px solid var(--border-light);">
  <button class="bi-tab active" data-tab="bi-time">Time Reports</button>
  <button class="bi-tab" data-tab="bi-funnel">Conversion Funnel</button>
  <button class="bi-tab" data-tab="bi-ops">Operational Data</button>
</div>

<style>
  .bi-tab { background: none; border: none; padding: 12px 16px; font-weight: 600; font-size: 14px; color: var(--text-muted); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
  .bi-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
  .bi-panel { display: none; }
  .bi-panel.active { display: block; }
  
  .funnel-stage { background: var(--surface); border: 1px solid var(--border-light); padding: 16px; border-radius: 8px; margin-bottom: 8px; position: relative; overflow: hidden; }
  .funnel-bar { position: absolute; top: 0; left: 0; height: 100%; background: rgba(var(--primary-rgb), 0.1); z-index: 0; border-right: 2px solid var(--primary); transition: width 1s ease-in-out; }
  .funnel-content { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; }
</style>

<!-- TAB 1: Time Reports -->
<div id="bi-time" class="bi-panel active">
  <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
    <select id="bi-timeframe" class="form-input" style="width: 200px;">
      <option value="daily">Daily Report</option>
      <option value="weekly">Weekly Report</option>
      <option value="monthly">Monthly Report</option>
    </select>
  </div>

  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px;" id="bi-time-cards">
    <!-- Generated via JS -->
    <div style="grid-column: 1/-1; text-align: center;">Loading data...</div>
  </div>
</div>

<!-- TAB 2: Conversion Funnel -->
<div id="bi-funnel" class="bi-panel">
  <p style="color: var(--text-secondary); margin-bottom: 24px;">Visualize user drop-off from initial site visit to final purchase.</p>
  
  <div id="bi-funnel-container" style="max-width: 800px; margin: 0 auto;">
    <div style="text-align: center;">Loading funnel data...</div>
  </div>
</div>

<!-- TAB 3: Operational Data -->
<div id="bi-ops" class="bi-panel">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
    
    <div>
      <h3 style="margin-bottom: 16px;">Top Products (By Revenue)</h3>
      <table class="admin-table">
        <thead><tr><th>Product</th><th>Sold</th><th>Revenue</th></tr></thead>
        <tbody id="bi-top-products"><tr><td colspan="3">Loading...</td></tr></tbody>
      </table>
    </div>

    <div>
      <h3 style="margin-bottom: 16px;">Top Customers (By LTV)</h3>
      <table class="admin-table">
        <thead><tr><th>Customer</th><th>Orders</th><th>LTV</th></tr></thead>
        <tbody id="bi-top-customers"><tr><td colspan="3">Loading...</td></tr></tbody>
      </table>
    </div>

  </div>
</div>
