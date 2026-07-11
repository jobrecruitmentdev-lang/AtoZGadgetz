<?php
declare(strict_types=1);
?>
<!-- Customer Feedback Creation Portal -->
<div class="write-review-block card" style="background-color: var(--surface); padding: var(--spacing-6); border: 1px solid var(--border); margin-top: var(--spacing-8);">
  <h4 class="font-semibold text-lg" style="margin-bottom: var(--spacing-1);">Share Your Review</h4>
  <p class="text-xs text-muted" style="margin-bottom: var(--spacing-4);">Help other shoppers choose the right gadget by writing about your experience.</p>
  
  <form id="pdp-write-review-form" style="display: flex; flex-direction: column; gap: var(--spacing-4);">
    
    <!-- Stars picker -->
    <div>
      <span class="text-xs font-bold text-secondary uppercase tracking-wider" style="display: block; margin-bottom: var(--spacing-1);">Rating score</span>
      <div class="stars-selector-row" id="pdp-stars-selector" style="display: flex; gap: var(--spacing-1); font-size: 24px; color: var(--border); cursor: pointer;">
        <span data-val="1">&#9733;</span>
        <span data-val="2">&#9733;</span>
        <span data-val="3">&#9733;</span>
        <span data-val="4">&#9733;</span>
        <span data-val="5">&#9733;</span>
      </div>
      <input type="hidden" id="pdp-review-rating" value="5" required>
    </div>

    <!-- Review message input -->
    <div>
      <label for="pdp-review-body" class="text-xs font-bold text-secondary uppercase tracking-wider" style="display: block; margin-bottom: var(--spacing-1);">Review Comments</label>
      <textarea id="pdp-review-body" class="form-control text-sm" placeholder="Review description details..." rows="4" required style="width: 100%; border: 1px solid var(--border); padding: var(--spacing-2); font-family: inherit; resize: vertical;"></textarea>
    </div>

    <button type="submit" class="btn btn-primary" id="pdp-review-submit-btn" style="align-self: flex-start; height: 38px; min-width: 140px;">Submit Review</button>
  </form>
</div>
