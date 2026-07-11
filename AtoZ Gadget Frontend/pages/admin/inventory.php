<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px;">Inventory & Warehouse</div>

<!-- Top Metrics Dashboard -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px;">
  <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
    <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Total SKUs</div>
    <div style="font-size: 28px; font-weight: 700;" id="inv-total-skus">--</div>
  </div>
  <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
    <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Total Stock Quantity</div>
    <div style="font-size: 28px; font-weight: 700;" id="inv-total-stock">--</div>
  </div>
  <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light); border-left: 4px solid var(--danger);">
    <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Low Stock Alerts</div>
    <div style="font-size: 28px; font-weight: 700; color: var(--danger);" id="inv-low-stock">--</div>
  </div>
  <div class="stat-card" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light); border-left: 4px solid var(--danger);">
    <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Out of Stock</div>
    <div style="font-size: 28px; font-weight: 700; color: var(--danger);" id="inv-out-of-stock">--</div>
  </div>
</div>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
  <input type="text" id="inv-search" class="form-input" placeholder="Search by Product Name or SKU..." style="width: 400px;">
  
  <select id="inv-status-filter" class="form-input" style="width: 200px;">
    <option value="">All Stock</option>
    <option value="in_stock">In Stock</option>
    <option value="low_stock">Low Stock</option>
    <option value="out_of_stock">Out of Stock</option>
  </select>
</div>

<div class="admin-table-wrapper" style="margin-bottom: 32px;">
  <table class="admin-table">
    <thead>
      <tr>
        <th>Product</th>
        <th>SKU</th>
        <th>Category</th>
        <th>Current Stock</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="admin-inventory-table">
      <tr><td colspan="6" style="text-align: center;">Loading inventory...</td></tr>
    </tbody>
  </table>
</div>

<!-- Mount point for Stock Adjustment Modal -->
<div id="inv-modal-mount">
  <?php require_once COMPONENTS_PATH . '/admin/stock-adjustment-modal.php'; ?>
</div>
