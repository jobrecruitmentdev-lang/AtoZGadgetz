<?php
declare(strict_types=1);
?>
<!-- Reusable Product Card Template (Inspired by Apple Store minimal UI) -->
<template id="product-card-template">
  <div class="product-card">
    <div class="product-card-media">
      <picture>
        <source class="card-img-webp" srcset="" type="image/webp">
        <img class="product-card-img" src="" alt="Product Image" loading="lazy" decoding="async">
      </picture>
      
      <!-- Badges Layer -->
      <div class="product-card-badges">
        <span class="badge badge-new" style="display: none;">New</span>
        <span class="badge badge-sale" style="display: none;">Offer</span>
      </div>
      
      <!-- Compare Button -->
      <div class="product-card-compare">
        <button class="compare-btn" data-product-id="" aria-label="Compare product">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M20 21H4v-5M4 16l8-8"></path></svg>
        </button>
      </div>

      <!-- Wishlist Action -->
      <div class="product-card-wishlist">
        <button class="wishlist-btn" data-product-id="" aria-label="Add to wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>

      <!-- Quick Actions Hover Layer -->
      <div class="product-card-actions">
        <button class="btn btn-secondary btn-sm quick-view-btn" data-product-id="">Quick View</button>
      </div>
    </div>
    
    <div class="product-card-body">
      <span class="product-card-meta card-brand"></span>
      <a href="" class="product-card-title"></a>
      
      <!-- Dynamic Ratings & Review Counts -->
      <div class="product-card-rating">
        <div class="rating-stars" style="display: flex; gap: 2px;">
          <!-- SVGs injected via script -->
        </div>
        <span class="rating-count text-xs text-muted"></span>
      </div>
      
      <!-- Availability Stock Indicator -->
      <div class="product-stock-status text-xs" style="margin-top: 4px; font-weight: 500;">
        <span class="stock-badge stock-in" style="display: none;">In Stock</span>
        <span class="stock-badge stock-out" style="display: none;">Out of Stock</span>
      </div>

      <div class="product-card-footer">
        <div class="price-box">
          <span class="price-current"></span>
          <span class="price-original" style="display: none;"></span>
        </div>
        <button class="btn btn-primary btn-sm add-to-cart-btn" data-product-id="">Add</button>
      </div>
    </div>
  </div>
</template>
