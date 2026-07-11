<?php
declare(strict_types=1);
?>
<!-- Skeleton Product Loader Template (Inspired by Apple clean loading grids) -->
<template id="product-skeleton-template">
  <div class="product-card skeleton-card">
    <div class="product-card-media skeleton" style="height: 220px; border-radius: var(--radius-md); border-bottom-left-radius: 0; border-bottom-right-radius: 0;"></div>
    <div class="product-card-body" style="padding-top: var(--spacing-4);">
      <div class="skeleton skeleton-text" style="width: 35%; height: 10px; margin-bottom: var(--spacing-2);"></div>
      <div class="skeleton skeleton-text" style="width: 85%; height: 14px; margin-bottom: var(--spacing-3);"></div>
      <div class="skeleton skeleton-text" style="width: 50%; height: 10px; margin-bottom: var(--spacing-4);"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
        <div class="skeleton skeleton-text" style="width: 30%; height: 16px;"></div>
        <div class="skeleton" style="width: 60px; height: 30px; border-radius: var(--radius-sm);"></div>
      </div>
    </div>
  </div>
</template>
