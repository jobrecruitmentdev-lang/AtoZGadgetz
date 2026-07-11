<?php
declare(strict_types=1);
?>
<aside class="filter-sidebar" aria-label="Catalog Filters">
  <!-- Categories Filter -->
  <div class="filter-group">
    <h4 class="filter-group-title">Categories</h4>
    <div class="filter-options" id="filter-categories-list">
      <!-- Skeletons populated by JS or PHP -->
      <span class="skeleton skeleton-text" style="width: 80%;"></span>
      <span class="skeleton skeleton-text" style="width: 70%;"></span>
      <span class="skeleton skeleton-text" style="width: 75%;"></span>
    </div>
  </div>

  <!-- Brands Filter -->
  <div class="filter-group">
    <h4 class="filter-group-title">Brands</h4>
    <div class="filter-options" id="filter-brands-list">
      <span class="skeleton skeleton-text" style="width: 60%;"></span>
      <span class="skeleton skeleton-text" style="width: 85%;"></span>
      <span class="skeleton skeleton-text" style="width: 50%;"></span>
    </div>
  </div>

  <!-- Price Range Filter -->
  <div class="filter-group">
    <h4 class="filter-group-title">Price Range</h4>
    <div style="padding: 10px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span id="price-min-label" class="text-xs text-muted">₹ 0</span>
        <span id="price-max-label" class="text-xs text-muted">₹ 2,00,000+</span>
      </div>
      <input type="range" id="price-range-input" min="0" max="250000" step="5000" value="250000" style="width: 100%; accent-color: var(--primary);">
    </div>
  </div>

  <!-- Sort Options -->
  <div class="filter-group">
    <h4 class="filter-group-title">Sort By</h4>
    <div class="filter-options">
      <label class="checkbox-label">
        <input type="radio" name="catalog-sort" value="latest" checked class="checkbox-input">
        <span>Latest Arrivals</span>
      </label>
      <label class="checkbox-label">
        <input type="radio" name="catalog-sort" value="price_low_high" class="checkbox-input">
        <span>Price: Low to High</span>
      </label>
      <label class="checkbox-label">
        <input type="radio" name="catalog-sort" value="price_high_low" class="checkbox-input">
        <span>Price: High to Low</span>
      </label>
      <label class="checkbox-label">
        <input type="radio" name="catalog-sort" value="popular" class="checkbox-input">
        <span>Customer Popularity</span>
      </label>
    </div>
  </div>
</aside>
