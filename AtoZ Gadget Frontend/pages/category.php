<?php
declare(strict_types=1);
?>
<div class="container" style="padding-top: var(--spacing-4); padding-bottom: var(--spacing-16);">
  <!-- Breadcrumb Include -->
  <?php require_once COMPONENTS_PATH . '/breadcrumb.php'; ?>

  <!-- Title Headers -->
  <div style="margin-top: var(--spacing-2); margin-bottom: var(--spacing-6);">
    <h1 id="category-header-title">Collection</h1>
    <p class="text-sm text-muted" id="category-header-desc">Browse specialized tech gadgets from this collection.</p>
  </div>

  <div class="catalog-layout">
    <!-- Filter Sidebar Drawer Panel -->
    <?php require_once COMPONENTS_PATH . '/filter-sidebar.php'; ?>

    <!-- Catalog Core Listings Container -->
    <div class="catalog-main">
      <!-- Active Filtering Chips Panel -->
      <?php require_once COMPONENTS_PATH . '/active-filters.php'; ?>

      <!-- Filter Toolbar Toggles -->
      <?php require_once COMPONENTS_PATH . '/product-toolbar.php'; ?>

      <!-- Empty state results -->
      <?php require_once COMPONENTS_PATH . '/empty-products.php'; ?>

      <!-- Products Grid List -->
      <?php require_once COMPONENTS_PATH . '/product-grid.php'; ?>

      <!-- Sub-templates inclusions -->
      <?php require_once COMPONENTS_PATH . '/product-card.php'; ?>
      <?php require_once COMPONENTS_PATH . '/product-list.php'; ?>
      <?php require_once COMPONENTS_PATH . '/skeleton-product.php'; ?>
      <?php require_once COMPONENTS_PATH . '/filter-chip.php'; ?>

      <!-- Pagination Footer -->
      <?php require_once COMPONENTS_PATH . '/pagination.php'; ?>
    </div>
  </div>
</div>
