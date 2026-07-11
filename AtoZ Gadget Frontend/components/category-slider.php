<?php
declare(strict_types=1);
?>
<!-- Category Slider Quick Links (Inspired by Reliance Digital & Croma) -->
<div class="category-slider-section" style="margin-top: var(--spacing-8);">
  <div class="section-header">
    <div>
      <h3 class="section-title font-semibold">Shop by Category</h3>
      <p class="text-sm text-muted">Browse our curated collections</p>
    </div>
  </div>
  
  <div class="category-circle-grid" id="homepage-categories-circles">
    <!-- Initial skeletons populated by home.js -->
    <?php for ($i = 0; $i < 4; $i++): ?>
      <div class="category-circle-item">
        <div class="category-circle-icon skeleton" style="width: 80px; height: 80px; border-radius: 50%;"></div>
        <span class="skeleton skeleton-text" style="width: 60px; height: 12px; margin-top: 8px;"></span>
      </div>
    <?php endfor; ?>
  </div>
</div>
