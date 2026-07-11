<!-- Stock Adjustment Modal -->
<div id="admin-stock-modal" class="modal" aria-hidden="true">
  <div class="modal-dialog" style="max-width: 400px;">
    <form id="admin-stock-form">
      <input type="hidden" id="stock_product_id" name="product_id">
      
      <div class="modal-header">
        <h3 class="modal-title">Adjust Stock Level</h3>
        <button type="button" class="modal-close" data-dismiss="modal">&times;</button>
      </div>

      <div class="modal-body">
        
        <div style="margin-bottom: 24px;">
          <h4 id="stock_product_name" style="margin: 0; font-size: 16px;">---</h4>
          <div id="stock_product_sku" style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">---</div>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="stock_quantity">New Total Quantity</label>
          <input type="number" id="stock_quantity" name="stock_quantity" class="form-input" required min="0" style="font-size: 20px; font-weight: 600;">
          <small style="color: var(--text-muted); display: block; margin-top: 8px;">Enter the exact new total quantity on hand. This will overwrite the current stock level.</small>
        </div>

      </div>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding: 16px;">
        <button type="button" class="btn btn-outline" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary" id="admin-stock-submit">Update Stock</button>
      </div>

    </form>
  </div>
</div>
