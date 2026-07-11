<?php
declare(strict_types=1);
?>
<!-- Sidebar Filter Panel (Inspired by Nothing.tech filters drawer) -->
<aside class="filter-sidebar" id="catalog-filter-sidebar">
  <div class="filter-sidebar-header">
    <h3 class="font-semibold text-lg">Filters</h3>
    <!-- Mobile close cross -->
    <button type="button" class="close-filter-btn" id="close-filter-btn" aria-label="Close filters drawer">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  </div>
  
  <div class="filter-groups">
    <!-- Category Checkboxes Group -->
    <div class="filter-group">
      <h4 class="filter-title">Categories</h4>
      <div class="filter-options" id="filter-categories-container">
        <!-- Injected via products.js -->
        <p class="text-xs text-muted">Loading categories...</p>
      </div>
    </div>

    <!-- Brands Checkboxes Group -->
    <div class="filter-group">
      <h4 class="filter-title">Brands</h4>
      <div class="filter-options" id="filter-brands-container">
        <!-- Injected via products.js -->
        <p class="text-xs text-muted">Loading brands...</p>
      </div>
    </div>

    <!-- Price Slider Max Value Group -->
    <div class="filter-group">
      <h4 class="filter-title">Price Range</h4>
      <div class="filter-options">
        <div class="price-slider-wrapper">
          <input type="range" id="filter-price-slider" min="0" max="150000" step="2000" value="150000" class="price-range-slider" aria-label="Price range filter slider">
          <div class="price-labels">
            <span class="text-xs text-muted">Min: ₹0</span>
            <span class="text-xs font-semibold" id="price-slider-max-display">Max: ₹1,50,000</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Availability & Discounts Toggle Checkboxes -->
    <div class="filter-group">
      <h4 class="filter-title">Status</h4>
      <div class="filter-options">
        <label class="filter-checkbox-label">
          <input type="checkbox" id="filter-in-stock-only" class="filter-checkbox">
          <span>In Stock Only</span>
        </label>
        <label class="filter-checkbox-label" style="margin-top: var(--spacing-2);">
          <input type="checkbox" id="filter-discount-only" class="filter-checkbox">
          <span>Offers & Discounts</span>
        </label>
      </div>
    </div>
  </div>

  <div class="filter-sidebar-footer">
    <button type="button" class="btn btn-secondary w-full" id="filter-clear-all-btn">Reset Filters</button>
  </div>
</aside>
