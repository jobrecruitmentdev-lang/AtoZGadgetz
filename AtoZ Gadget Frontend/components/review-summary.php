<?php
declare(strict_types=1);
?>
<!-- Reviews & Star Ratings Summary -->
<div class="reviews-summary-wrapper card" style="background-color: var(--surface); padding: var(--spacing-6); border: 1px solid var(--border); display: flex; gap: var(--spacing-6); flex-wrap: wrap; margin-bottom: var(--spacing-6);">
  
  <!-- Average Rating Circle -->
  <div style="flex: 1; min-width: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-right: 1px solid var(--border-light); padding-right: var(--spacing-6);">
    <h4 class="text-5xl font-bold" id="pdp-avg-rating-val" style="line-height: 1;">5.0</h4>
    <div class="rating-stars" id="pdp-avg-stars-box" style="color: #ffb800; margin: var(--spacing-2) 0; display: flex; gap: 2px;">
      <!-- JS injected stars -->
    </div>
    <span class="text-xs text-muted" id="pdp-total-reviews-label">Based on 1 review</span>
  </div>
  
  <!-- Ratings Distribution Progress Bars -->
  <div style="flex: 2; min-width: 220px; display: flex; flex-direction: column; justify-content: center; gap: var(--spacing-2);" id="pdp-rating-distribution-rows">
    <!-- Dynamically loaded review score distribution bars -->
  </div>
  
</div>
