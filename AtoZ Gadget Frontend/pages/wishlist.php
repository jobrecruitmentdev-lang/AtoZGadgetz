<?php
declare(strict_types=1);
?>
<main class="container wishlist-main-wrapper" style="padding-top: var(--spacing-6); padding-bottom: var(--spacing-10);">

  <nav aria-label="Breadcrumb" style="margin-bottom: var(--spacing-6);">
    <ol style="display: flex; gap: 4px; list-style: none; padding: 0; margin: 0; font-size: var(--text-xs); color: var(--text-muted);">
      <li><a href="/" style="color: var(--text-muted);">Home</a> <span style="margin: 0 4px;">/</span></li>
      <li><span style="color: var(--text); font-weight: 600;">My Wishlist</span></li>
    </ol>
  </nav>

  <h1 class="font-bold text-2xl" style="margin-bottom: var(--spacing-6); color: var(--text);">My Wishlist</h1>

  <!-- Empty state fallback panel -->
  <?php require_once COMPONENTS_PATH . '/wishlist-empty.php'; ?>

  <!-- Wishlist Grid Showcase -->
  <div class="grid" id="wishlist-items-grid" style="display: none; gap: var(--spacing-5); grid-template-columns: repeat(12, 1fr);">
    <!-- Injected dynamically by wishlist-card.php templates cards -->
  </div>

</main>

<!-- Load Wishlist Card Template -->
<?php require_once COMPONENTS_PATH . '/wishlist-card.php'; ?>
