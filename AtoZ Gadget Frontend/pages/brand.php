<?php
declare(strict_types=1);
?>
<div class="container" style="padding-top: var(--spacing-4); padding-bottom: var(--spacing-16);">
  <!-- Breadcrumb Include -->
  <?php require_once COMPONENTS_PATH . '/breadcrumb.php'; ?>

  <!-- Brand Banner Block (Inspired by Apple Premium Retail partners header) -->
  <div class="brand-detail-header card" id="brand-banner-panel" style="margin-top: var(--spacing-2); margin-bottom: var(--spacing-8); padding: var(--spacing-6) var(--spacing-8); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-4); background-color: var(--surface);">
    <div style="display: flex; align-items: center; gap: var(--spacing-4);">
      <div class="brand-logo-frame" style="width: 75px; height: 75px; background-color: #fff; border-radius: var(--radius-md); border: 1px solid var(--border-light); padding: var(--spacing-2); display: flex; align-items: center; justify-content: center;">
        <img id="brand-header-logo" src="/public/assets/images/placeholder.png" alt="Brand Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
      </div>
      <div>
        <h1 id="brand-header-title">Official Store</h1>
        <p class="text-sm text-muted" id="brand-header-desc">Explore direct manufacturer warranty products and official components.</p>
      </div>
    </div>
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
