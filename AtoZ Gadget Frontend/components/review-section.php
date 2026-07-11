<?php
declare(strict_types=1);
?>
<!-- Customer Testimonials Widget (Inspired by Apple verified user comments cards) -->
<div class="review-section" style="margin-top: var(--spacing-12); padding-bottom: var(--spacing-12);">
  <div class="section-header text-center" style="margin-bottom: var(--spacing-8);">
    <h3 class="section-title font-semibold text-2xl">Customer Testimonials</h3>
    <p class="text-sm text-muted">Verified reviews from verified AtoZ electronic buyers</p>
  </div>
  
  <div class="reviews-slider-container">
    <div class="reviews-grid" id="homepage-reviews-grid">
      <!-- Skeletons populated dynamically by home.js -->
      <?php for ($i = 0; $i < 3; $i++): ?>
        <div class="review-card skeleton-card flex flex-col justify-between" style="height: 190px; border-radius: var(--radius-md); padding: var(--spacing-4); background-color: var(--surface);">
          <div style="display: flex; gap: var(--spacing-2); align-items: center;">
            <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
            <div style="flex-grow: 1;">
              <div class="skeleton skeleton-text" style="width: 50%; height: 10px;"></div>
              <div class="skeleton skeleton-text" style="width: 30%; height: 8px; margin-top: 4px;"></div>
            </div>
          </div>
          <div class="skeleton skeleton-text" style="width: 90%; height: 12px; margin-top: var(--spacing-4);"></div>
          <div class="skeleton skeleton-text" style="width: 80%; height: 12px; margin-top: 4px;"></div>
          <div class="skeleton skeleton-text" style="width: 40%; height: 10px; margin-top: auto;"></div>
        </div>
      <?php endfor; ?>
    </div>
  </div>
</div>
