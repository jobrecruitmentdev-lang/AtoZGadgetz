<?php
declare(strict_types=1);
?>
<main class="container cart-main-wrapper" style="padding-top: var(--spacing-6); padding-bottom: var(--spacing-10);">

  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb" style="margin-bottom: var(--spacing-4);">
    <ol style="display: flex; gap: 4px; list-style: none; padding: 0; margin: 0; font-size: var(--text-xs); color: var(--text-muted);">
      <li><a href="/" style="color: var(--text-muted);">Home</a> <span style="margin: 0 4px;">/</span></li>
      <li><span style="color: var(--text); font-weight: 600;">Shopping Cart</span></li>
    </ol>
  </nav>

  <h1 class="font-bold" style="font-size: var(--text-2xl); margin-bottom: var(--spacing-6); color: var(--text);">
    Shopping Cart
  </h1>

  <!-- Loading State -->
  <div id="cart-loading-container">
    <?php require_once COMPONENTS_PATH . '/cart-loader.php'; ?>
  </div>

  <!-- Empty State -->
  <div id="cart-empty-state" style="display: none;">
    <?php require_once COMPONENTS_PATH . '/cart-empty.php'; ?>
  </div>

  <!-- Main Content Grid (shown by cart.js when items exist) -->
  <div id="cart-content-layout" class="cart-page-grid" style="display: none;">

    <!-- Left: Items + Save For Later -->
    <div>
      <div id="cart-items-list" style="display: flex; flex-direction: column; gap: var(--spacing-3);">
        <!-- Rendered by cart.js via renderCartItems() -->
      </div>

      <!-- Save for Later section (rendered by save-for-later.js) -->
      <div id="save-for-later-container" style="margin-top: var(--spacing-6);">
        <!-- Empty unless save-for-later.js populates it -->
      </div>
    </div>

    <!-- Right: Order Summary -->
    <div>

      <!-- Coupon Code -->
      <div style="margin-bottom: var(--spacing-4);">
        <?php require_once COMPONENTS_PATH . '/coupon-box.php'; ?>
      </div>

      <!-- Shipping Options -->
      <div class="shipping-section" style="margin-bottom: var(--spacing-4);">
        <h3 style="font-size: var(--text-sm); font-weight: 700; margin-bottom: var(--spacing-3); color: var(--text);">Shipping Method</h3>
        <div id="shipping-options-container">
          <!-- Rendered by shipping.js -->
        </div>
      </div>

      <!-- Cart Summary -->
      <?php require_once COMPONENTS_PATH . '/cart-summary.php'; ?>

    </div>

  </div>

</main>
