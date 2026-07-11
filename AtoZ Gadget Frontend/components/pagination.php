<?php
declare(strict_types=1);
?>
<!-- Reusable Pagination Controls (Section 44) -->
<nav aria-label="Store Pagination" class="flex justify-center align-center gap-2" style="padding: var(--spacing-6) 0; width: 100%;">
  <button type="button" class="btn btn-outline btn-sm" id="pagination-prev" disabled aria-label="Previous Page">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    <span>Previous</span>
  </button>
  
  <span class="text-sm font-semibold text-muted" id="pagination-indicator" style="margin: 0 var(--spacing-2);">Page 1 of 1</span>
  
  <button type="button" class="btn btn-outline btn-sm" id="pagination-next" disabled aria-label="Next Page">
    <span>Next</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  </button>
</nav>
