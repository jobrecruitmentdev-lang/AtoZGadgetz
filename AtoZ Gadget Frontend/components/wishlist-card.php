<?php
declare(strict_types=1);
?>
<!-- Template: Wishlist Product Grid Card -->
<template id="wishlist-card-template">
  <div class="wishlist-grid-card card" data-product-id="" style="position: relative; background-color: var(--surface); padding: var(--spacing-4); border: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
    
    <!-- Close / Remove heart button -->
    <button type="button" class="wishlist-delete-btn" aria-label="Remove product from wishlist" style="position: absolute; top: var(--spacing-2); right: var(--spacing-2); border: none; background: none; cursor: pointer; color: var(--danger); font-size: 20px; font-weight: bold; z-index: 10; line-height: 1;">&times;</button>
    
    <a href="" class="wishlist-card-img-anchor" style="display: block; text-align: center; margin: var(--spacing-2) 0 var(--spacing-4) 0;">
      <picture>
        <source class="wishlist-card-webp" srcset="" type="image/webp">
        <img class="wishlist-card-img" src="/public/assets/images/placeholder.png" alt="Wishlist item image" width="130" height="130" style="object-fit: contain; max-height: 130px; margin: 0 auto;">
      </picture>
    </a>

    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-end;">
      <span class="wishlist-card-brand text-xs uppercase tracking-wider font-semibold text-secondary">Brand</span>
      <h4 style="margin: 2px 0 var(--spacing-3) 0;"><a href="" class="wishlist-card-title font-semibold text-sm" style="color: var(--text);">Product Name</a></h4>
      
      <div style="display: flex; align-items: baseline; gap: var(--spacing-2); margin-bottom: var(--spacing-4);">
        <span class="wishlist-card-price-current font-bold text-base" style="color: var(--text);">₹0</span>
        <span class="wishlist-card-price-original text-xs text-muted" style="text-decoration: line-through; display: none;">₹0</span>
      </div>
      
      <button type="button" class="btn btn-primary btn-sm wishlist-add-to-cart-btn" style="width: 100%; height: 34px; font-size: 11px; padding: 0;">Add To Cart</button>
    </div>

  </div>
</template>
