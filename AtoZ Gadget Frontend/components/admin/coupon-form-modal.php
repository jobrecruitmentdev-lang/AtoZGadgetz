<!-- Coupon Form Modal -->
<div id="admin-coupon-modal" class="modal" aria-hidden="true">
  <div class="modal-dialog" style="max-width: 600px;">
    <form id="admin-coupon-form">
      
      <div class="modal-header">
        <h3 class="modal-title">Create New Coupon</h3>
        <button type="button" class="modal-close" data-dismiss="modal">&times;</button>
      </div>

      <div class="modal-body">
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="coupon_code">Coupon Code (e.g. SUMMER50)</label>
          <input type="text" id="coupon_code" name="code" class="form-input" required style="text-transform: uppercase;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label" for="coupon_type">Discount Type</label>
            <select id="coupon_type" name="discount_type" class="form-input" required>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Fixed Amount (₹)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="coupon_value">Discount Value</label>
            <input type="number" id="coupon_value" name="discount_value" class="form-input" required min="1" step="0.01">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label" for="coupon_min_order">Minimum Purchase Amount (₹)</label>
            <input type="number" id="coupon_min_order" name="minimum_order_amount" class="form-input" value="0.00" min="0" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label" for="coupon_max_discount">Maximum Discount (Optional)</label>
            <input type="number" id="coupon_max_discount" name="maximum_discount" class="form-input" min="0" step="0.01">
            <small style="color: var(--text-muted);">Only applies to percentage discounts</small>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label" for="coupon_start">Start Date & Time</label>
            <input type="datetime-local" id="coupon_start" name="start_date" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="coupon_end">End Date & Time</label>
            <input type="datetime-local" id="coupon_end" name="end_date" class="form-input" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="coupon_limit">Total Usage Limit (Optional)</label>
          <input type="number" id="coupon_limit" name="usage_limit" class="form-input" min="1" placeholder="e.g. 100 uses total">
        </div>

      </div>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding: 16px;">
        <button type="button" class="btn btn-outline" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary" id="admin-coupon-submit">Create Coupon</button>
      </div>

    </form>
  </div>
</div>
