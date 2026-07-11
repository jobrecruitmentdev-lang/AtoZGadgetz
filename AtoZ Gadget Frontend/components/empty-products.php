<?php
declare(strict_types=1);
?>
<!-- Empty Catalog State (Inspired by Apple Store minimal empty results) -->
<div class="empty-state" id="catalog-empty-state" style="display: none;">
  <div class="empty-state-icon">
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
  </div>
  <h3 class="font-semibold text-xl" style="margin-bottom: var(--spacing-2);">No Products Found</h3>
  <p class="text-sm text-muted" style="max-width: 420px; margin: 0 auto var(--spacing-6) auto; line-height: 1.5;">We couldn't find any premium gadgets matching your active criteria. Try broadening your price range, toggling other brands, or clearing active filters.</p>
  <div class="empty-state-actions" style="display: flex; gap: var(--spacing-4); justify-content: center;">
    <button type="button" class="btn btn-secondary" id="empty-state-clear-btn">Reset Filters</button>
    <a href="<?php echo url('/products'); ?>" class="btn btn-primary">View All Products</a>
  </div>
</div>
