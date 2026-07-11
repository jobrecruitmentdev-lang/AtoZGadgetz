<?php
declare(strict_types=1);
// Protected route guard handled globally by session.js, 
// but we add a fallback PHP check if necessary (though API decides).
?>
<div class="container">
  <!-- Breadcrumbs -->
  <nav aria-label="breadcrumb" style="padding-top: var(--spacing-4);">
    <ol class="breadcrumb" style="display: flex; gap: 8px; list-style: none; font-size: var(--text-sm); color: var(--text-muted);">
      <li><a href="/" style="color: var(--primary); text-decoration: none;">Home</a></li>
      <li>/</li>
      <li aria-current="page" style="color: var(--text);">My Account</li>
    </ol>
  </nav>

  <div class="account-layout" id="account-container" style="display: none;">
    <!-- Sidebar Navigation -->
    <?php require_once COMPONENTS_PATH . '/account/sidebar.php'; ?>

    <!-- Main Content Area -->
    <div class="account-content">
      
      <!-- Dashboard Overview -->
      <div id="view-dashboard" class="account-view active">
        <?php require_once COMPONENTS_PATH . '/account/dashboard.php'; ?>
      </div>

      <!-- Profile Settings -->
      <div id="view-profile" class="account-view">
        <?php require_once COMPONENTS_PATH . '/account/profile.php'; ?>
      </div>

      <!-- Address Book -->
      <div id="view-addresses" class="account-view">
        <?php require_once COMPONENTS_PATH . '/account/addresses.php'; ?>
      </div>

      <!-- Order History -->
      <div id="view-orders" class="account-view">
        <?php require_once COMPONENTS_PATH . '/account/orders.php'; ?>
      </div>

      <!-- Order Details (Hidden by default, shown via JS when an order is clicked) -->
      <div id="view-order-details" class="account-view">
        <?php require_once COMPONENTS_PATH . '/account/order-details.php'; ?>
      </div>

    </div>
  </div>

  <!-- Loading State -->
  <div id="account-loading" style="padding: var(--spacing-10) 0; text-align: center;">
    <div class="spinner" style="width: 40px; height: 40px; border-width: 3px; border-top-color: var(--primary);"></div>
    <p style="margin-top: var(--spacing-4); color: var(--text-muted); font-weight: 600;">Loading your account...</p>
  </div>
</div>

<script type="module">
  import '<?php echo asset_url('js/pages/account.js'); ?>';
</script>
