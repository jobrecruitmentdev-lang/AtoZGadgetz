<?php
declare(strict_types=1);
?>
<!-- Cart Order Summary Totals Card -->
<div class="cart-summary-box">

  <!-- Header -->
  <div class="cart-summary-header">
    <h3 class="cart-summary-title">Order Summary</h3>
  </div>

  <!-- Body: Line Items -->
  <div class="cart-summary-body">

    <div class="summary-line">
      <span>Subtotal (MRP)</span>
      <span class="summary-line-val" id="cart-summary-subtotal">₹0</span>
    </div>

    <div class="summary-line summary-line-discount" id="cart-summary-savings-row" style="display: none;">
      <span>Coupon Discount</span>
      <span class="summary-line-val" id="cart-summary-discount">—</span>
    </div>

    <div class="summary-line">
      <span>Shipping</span>
      <span class="summary-line-val" id="cart-summary-shipping" style="color: var(--success);">FREE</span>
    </div>

    <div class="summary-line">
      <span>GST (Included)</span>
      <span class="summary-line-val" style="color: var(--text-muted);">Included</span>
    </div>

    <div class="summary-divider"></div>

    <!-- Savings Pill -->
    <div class="summary-savings-pill" id="cart-summary-savings-row" style="display: none;">
      🎉 You save <span id="cart-summary-savings-amount">₹0</span> on this order!
    </div>

    <!-- Grand Total -->
    <div class="summary-total-line">
      <span class="summary-total-label">Total</span>
      <span class="summary-total-price" id="cart-summary-total">₹0</span>
    </div>

  </div>

  <!-- CTA Footer -->
  <div class="cart-summary-footer">
    <a href="/checkout" class="cart-summary-cta">
      Proceed to Checkout →
    </a>

    <!-- Trust Badges -->
    <div class="summary-trust-row" style="margin-top: var(--spacing-3);">
      <span class="trust-badge-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Secure Payment
      </span>
      <span class="trust-badge-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Easy Returns
      </span>
      <span class="trust-badge-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        Fast Delivery
      </span>
    </div>
  </div>

</div>
