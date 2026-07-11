<aside class="order-summary-sidebar">
  <h2 class="summary-title">Order Summary</h2>
  
  <div class="summary-item-list" id="checkout-item-list">
    <div class="empty-state" style="font-size: var(--text-sm);">Loading cart...</div>
  </div>

  <div style="margin-bottom: var(--spacing-4);">
    <div style="display: flex; gap: 8px;">
      <input type="text" id="checkout-coupon-input" class="form-input" placeholder="Coupon Code" style="flex: 1; height: 38px;">
      <button type="button" class="btn btn-outline" id="btn-apply-coupon" style="height: 38px; padding: 0 16px;">Apply</button>
    </div>
    <div id="checkout-coupon-msg" style="font-size: var(--text-xs); margin-top: 4px; display: none;"></div>
  </div>

  <div class="summary-totals" id="checkout-totals-box" style="opacity: 0.5; pointer-events: none;">
    <div class="summary-row">
      <span>Subtotal</span>
      <span id="summary-subtotal">$0.00</span>
    </div>
    <div class="summary-row" id="summary-discount-row" style="display: none;">
      <span>Discount</span>
      <span id="summary-discount" class="summary-row discount">-$0.00</span>
    </div>
    <div class="summary-row">
      <span>Tax</span>
      <span id="summary-tax">$0.00</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span id="summary-shipping">$0.00</span>
    </div>
    <div class="summary-row grand-total">
      <span>Total</span>
      <span id="summary-grand-total">$0.00</span>
    </div>
  </div>

  <div class="checkout-btn-wrapper">
    <button type="button" class="btn btn-primary w-full" id="btn-place-order" disabled style="height: 48px; font-size: var(--text-base);">
      Place Order
    </button>
    <p style="text-align: center; font-size: 11px; color: var(--text-muted); margin-top: var(--spacing-3);">
      By placing your order, you agree to our Terms of Service and Privacy Policy.
    </p>
  </div>
</aside>
