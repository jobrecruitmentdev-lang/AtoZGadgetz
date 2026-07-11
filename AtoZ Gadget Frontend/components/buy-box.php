<?php
declare(strict_types=1);
?>
<!-- PDP Buy Box Operations Container -->
<div class="buy-box-container" style="display: flex; flex-direction: column; gap: var(--spacing-4); margin-bottom: var(--spacing-6);">
  <div style="display: flex; align-items: center; gap: var(--spacing-4);">
    <!-- Quantity Counter -->
    <div class="quantity-counter flex align-center" style="border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; height: 42px;">
      <button type="button" class="qty-btn" id="pdp-qty-minus" style="width: 36px; height: 100%; border: none; background: none; cursor: pointer; color: var(--text); font-weight: bold;">-</button>
      <input type="number" id="pdp-qty-input" value="1" min="1" max="10" readonly style="width: 40px; height: 100%; border: none; text-align: center; font-weight: 600; background: none; color: var(--text);">
      <button type="button" class="qty-btn" id="pdp-qty-plus" style="width: 36px; height: 100%; border: none; background: none; cursor: pointer; color: var(--text); font-weight: bold;">+</button>
    </div>

    <!-- Add to wishlist button -->
    <button type="button" class="btn btn-secondary pdp-wishlist-toggle-btn" id="pdp-wishlist-btn" aria-label="Add to wishlist" style="height: 42px; width: 42px; display: flex; align-items: center; justify-content: center; padding: 0;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    </button>
  </div>

  <div style="display: flex; gap: var(--spacing-3); flex-wrap: wrap;">
    <button type="button" class="btn btn-primary btn-lg" id="pdp-add-cart-btn" style="flex: 1; height: 46px;">Add to Cart</button>
    <button type="button" class="btn btn-primary btn-lg" id="pdp-buy-now-btn" style="flex: 1; height: 46px; background-color: var(--text); color: var(--background);">Buy Now</button>
  </div>
  
  <div style="display: flex; gap: var(--spacing-4); align-items: center; font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--spacing-2);">
    <span style="display: flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Official Warranty</span>
    <span style="display: flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 12 15 7 10 2 15"></polyline></svg> 7 Days Returns</span>
  </div>
</div>
