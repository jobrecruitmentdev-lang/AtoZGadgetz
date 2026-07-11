<?php
declare(strict_types=1);
?>
<!-- Active Filtering Chips Panel (Inspired by Samsung Store filters) -->
<div class="active-filters-panel" id="active-filters-panel" style="display: none; align-items: center; flex-wrap: wrap; gap: var(--spacing-2); margin-bottom: var(--spacing-6);">
  <span class="text-xs text-muted">Active Filters:</span>
  <div class="active-chips-list" id="active-chips-list" style="display: flex; flex-wrap: wrap; gap: var(--spacing-2); align-items: center;">
    <!-- JS will populate chips dynamically -->
  </div>
  <button type="button" class="clear-all-chips-btn" id="clear-all-chips-btn">Clear All</button>
</div>
