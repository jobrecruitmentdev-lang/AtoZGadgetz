<?php
declare(strict_types=1);
?>
<!-- Reviews List and Filter Options -->
<div class="reviews-list-block" style="margin-bottom: var(--spacing-8);">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-4); flex-wrap: wrap; gap: var(--spacing-2);">
    <h4 class="font-semibold text-lg">Product Feedback</h4>
    
    <!-- Sorting Reviews -->
    <div>
      <select id="pdp-reviews-sort" class="form-control text-xs" style="height: 32px; width: 140px; padding: 0 var(--spacing-2);">
        <option value="latest">Most Recent</option>
        <option value="highest">Highest Rated</option>
        <option value="lowest">Lowest Rated</option>
      </select>
    </div>
  </div>

  <!-- Review List Items -->
  <div id="pdp-reviews-feed-container" style="display: flex; flex-direction: column; gap: var(--spacing-4);">
    <!-- Loaded dynamically by reviews.js -->
  </div>

  <!-- Pagination links -->
  <div id="pdp-reviews-pagination-row" style="margin-top: var(--spacing-4);"></div>
</div>
