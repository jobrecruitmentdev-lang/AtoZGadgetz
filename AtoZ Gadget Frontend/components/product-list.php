<?php
declare(strict_types=1);
?>
<!-- Reusable Horizontal Product Card Template (List View) -->
<template id="product-list-card-template">
  <div class="product-list-card">
    <div class="list-card-media">
      <picture>
        <source class="list-card-img-webp" srcset="" type="image/webp">
        <img class="list-card-img" src="" alt="Product Image" loading="lazy">
      </picture>
      
      <!-- Compare Action -->
      <button class="list-compare-btn" data-product-id="" aria-label="Compare">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M20 21H4v-5M4 16l8-8"></path></svg>
      </button>
    </div>
    
    <div class="list-card-details">
      <div class="list-card-header">
        <div>
          <span class="product-card-meta list-brand"></span>
          <h4 class="list-title"><a href="" class="list-title-link"></a></h4>
          
          <!-- Rating -->
          <div class="product-card-rating" style="margin-top: 4px;">
            <div class="rating-stars" style="display: flex; gap: 2px;"></div>
            <span class="rating-count text-xs text-muted" style="margin-left: 6px;"></span>
          </div>
        </div>
        
        <!-- Wishlist -->
        <button class="wishlist-btn list-wishlist-btn" data-product-id="" aria-label="Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>
      
      <p class="list-description text-sm text-muted"></p>
      
      <div class="list-card-footer">
        <div class="price-box">
          <span class="price-current"></span>
          <span class="price-original" style="display: none;"></span>
        </div>
        
        <div class="list-card-actions">
          <button class="btn btn-secondary btn-sm quick-view-btn" data-product-id="">Quick View</button>
          <button class="btn btn-primary btn-sm add-to-cart-btn" data-product-id="">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>
