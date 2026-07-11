<?php
declare(strict_types=1);
?>
<!-- Global Sliding Mini-Cart Drawer Portal -->

<!-- Overlay (darkens & blurs background) -->
<div id="mini-cart-overlay" role="dialog" aria-modal="true" aria-label="Shopping Cart">

  <!-- Drawer Panel (slides in from right) -->
  <div id="mini-cart-drawer">

    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="mini-cart-header">
      <h2 class="mini-cart-header-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        Shopping Cart
      </h2>
      <button type="button" id="mini-cart-close-btn" aria-label="Close cart drawer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- ── Empty State ─────────────────────────────────────────── -->
    <div id="mini-cart-empty" style="display: none;">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--border); margin-bottom: var(--spacing-3);">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      <p class="text-sm font-semibold" style="color: var(--text);">Your cart is empty</p>
      <p class="text-xs text-muted" style="margin-top: 4px;">Explore our premium gadgets collection.</p>
      <a href="/products" class="btn btn-primary btn-sm" style="margin-top: var(--spacing-4);">Browse Products</a>
    </div>

    <!-- ── Items Body (dynamically rendered by mini-cart.js) ──── -->
    <div id="mini-cart-items">
      <!-- Initial loader shown before JS runs -->
      <div class="mini-cart-loader">
        <span class="spinner" style="width:28px;height:28px;border-width:2px;"></span>
      </div>
    </div>

    <!-- ── Footer (shown only when cart has items) ──────────────── -->
    <div id="mini-cart-footer" style="display: none;">
      <div class="mini-cart-total-row">
        <span class="mini-cart-total-label">Estimated Total</span>
        <span class="mini-cart-total-price" id="mini-cart-total-price">₹0</span>
      </div>

      <div class="mini-cart-actions">
        <button type="button" class="mini-cart-checkout-btn" onclick="window.location.href='/checkout'">
          Proceed to Checkout →
        </button>
        <a href="/cart" class="mini-cart-view-btn">View Full Cart</a>
      </div>
    </div>

  </div><!-- /mini-cart-drawer -->
</div><!-- /mini-cart-overlay -->
