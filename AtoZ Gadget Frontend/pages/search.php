<?php
declare(strict_types=1);
?>
<div class="container" style="padding-top: var(--spacing-4);">
  <!-- Breadcrumb Include -->
  <?php require_once COMPONENTS_PATH . '/breadcrumb.php'; ?>
  
  <div style="margin-bottom: var(--spacing-6); margin-top: var(--spacing-2);">
    <h1>Search Results</h1>
    <p class="text-sm text-muted" id="search-query-info">
      Showing matches for "<strong><?php echo escape($GLOBALS['route_params']['query'] ?? ''); ?></strong>"
    </p>
  </div>
  
  <!-- Products Grid container -->
  <div class="row" id="search-results-grid">
    <!-- populated dynamically by search.js -->
    <?php for ($i = 0; $i < 4; $i++): ?>
      <div class="span-lg-3 span-md-4 span-2">
        <div class="product-card">
          <div class="product-card-media skeleton"></div>
          <div class="product-card-body">
            <span class="skeleton skeleton-text" style="width: 30%;"></span>
            <h3 class="skeleton skeleton-title"></h3>
            <div class="product-card-footer">
              <span class="skeleton skeleton-text" style="width: 45%; height: 20px;"></span>
              <div class="skeleton skeleton-btn"></div>
            </div>
          </div>
        </div>
      </div>
    <?php endfor; ?>
  </div>

  <!-- Empty state portal (Section 53) -->
  <div id="search-empty-state" style="display: none; text-align: center; padding: var(--spacing-16) 0;">
    <div style="margin-bottom: var(--spacing-4); color: var(--text-muted);">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
    <h3>No Products Found</h3>
    <p class="text-sm text-muted" style="margin-top: var(--spacing-2); margin-bottom: var(--spacing-6);">We couldn't find any products matching your search term. Please double-check your spelling.</p>
    <a href="<?php echo url('/'); ?>" class="btn btn-secondary btn-sm">Return Home</a>
  </div>
</div>
