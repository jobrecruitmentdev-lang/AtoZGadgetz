<?php
declare(strict_types=1);
?>
<!-- Template Schema: Cart Listing Line Item Row -->
<template id="cart-item-row-template">
  <div class="cart-item-card" data-item-id="" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: var(--spacing-4); margin-bottom: var(--spacing-4); flex-wrap: wrap; gap: var(--spacing-4);">
    
    <!-- Left Column: Image + Info -->
    <div style="display: flex; gap: var(--spacing-4); align-items: center; flex: 1; min-width: 260px;">
      <a href="" class="item-img-anchor">
        <picture>
          <source class="item-img-webp" srcset="" type="image/webp">
          <img class="item-img" src="/public/assets/images/placeholder.png" alt="Cart item thumbnail" width="72" height="72" style="object-fit: contain; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background-color: #fff;">
        </picture>
      </a>

      <div>
        <span class="item-brand text-xs uppercase tracking-wider font-semibold text-secondary">Brand</span>
        <h4 style="margin: 2px 0 6px 0;"><a href="" class="item-title-link font-semibold text-sm" style="color: var(--text);">Product Name</a></h4>
        
        <div style="display: flex; gap: var(--spacing-4); align-items: center; flex-wrap: wrap;">
          <!-- Quantity buttons -->
          <div style="display: flex; align-items: center; border: 1px solid var(--border); border-radius: var(--radius-xs); height: 28px; overflow: hidden; background: var(--surface);">
            <button type="button" class="item-qty-minus" style="width: 24px; border: none; background: none; cursor: pointer; color: var(--text); font-weight: bold;">-</button>
            <input type="number" class="item-qty-input" value="1" min="1" max="10" readonly style="width: 28px; border: none; text-align: center; font-size: var(--text-xs); background: none; color: var(--text); font-weight: bold;">
            <button type="button" class="item-qty-plus" style="width: 24px; border: none; background: none; cursor: pointer; color: var(--text); font-weight: bold;">+</button>
          </div>

          <button type="button" class="item-remove-btn text-xs font-semibold" style="border: none; background: none; color: var(--danger); cursor: pointer; padding: 2px 0;">Remove</button>
          <button type="button" class="item-save-later text-xs font-semibold" style="border: none; background: none; color: var(--primary); cursor: pointer; padding: 2px 0;">Save For Later</button>
        </div>
      </div>
    </div>

    <!-- Right Column: Price details -->
    <div style="text-align: right; min-width: 100px;">
      <span class="item-price-current font-bold text-base" style="color: var(--text); display: block;">₹0</span>
      <span class="item-price-original text-xs text-muted" style="text-decoration: line-through; display: none;">₹0</span>
    </div>
    
  </div>
</template>
