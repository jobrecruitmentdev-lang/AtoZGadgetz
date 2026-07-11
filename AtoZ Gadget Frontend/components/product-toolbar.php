<?php
declare(strict_types=1);
?>
<!-- Catalog Toolbar Component (Inspired by Samsung Store filters row) -->
<div class="product-toolbar">
  <div class="toolbar-left">
    <!-- Mobile Filter Open Button -->
    <button type="button" class="btn btn-secondary mobile-filter-open-btn" id="mobile-filter-open-btn">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--spacing-2); vertical-align: middle;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
      Filter
    </button>
    <span class="toolbar-count text-sm text-muted" id="toolbar-product-count">0 items loaded</span>
  </div>
  
  <div class="toolbar-right">
    <!-- Grid/List layout toggle -->
    <div class="view-toggles" id="view-toggles-container">
      <button type="button" class="view-toggle-btn active" data-view="grid" aria-label="Switch to Grid View">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      </button>
      <button type="button" class="view-toggle-btn" data-view="list" aria-label="Switch to List View">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
      </button>
    </div>
    
    <!-- Sort select dropdown -->
    <?php require COMPONENTS_PATH . '/sort-dropdown.php'; ?>
  </div>
</div>
