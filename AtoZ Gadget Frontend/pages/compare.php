<?php
declare(strict_types=1);
?>
<main class="container compare-main-wrapper" style="padding-top: var(--spacing-6); padding-bottom: var(--spacing-10);">

  <nav aria-label="Breadcrumb" style="margin-bottom: var(--spacing-6);">
    <ol style="display: flex; gap: 4px; list-style: none; padding: 0; margin: 0; font-size: var(--text-xs); color: var(--text-muted);">
      <li><a href="/" style="color: var(--text-muted);">Home</a> <span style="margin: 0 4px;">/</span></li>
      <li><span style="color: var(--text); font-weight: 600;">Product Comparison</span></li>
    </ol>
  </nav>

  <h1 class="font-bold text-2xl" style="margin-bottom: var(--spacing-6); color: var(--text);">Compare Products</h1>

  <!-- Empty state fallback panel -->
  <?php require_once COMPONENTS_PATH . '/compare-empty.php'; ?>

  <!-- Compare Specs Grid Matrix Table -->
  <div id="compare-main-container" style="display: none;">
    <p class="text-xs text-muted" style="margin-bottom: var(--spacing-4);">Highlighting structural and hardware parameters across selected devices.</p>
    <?php require_once COMPONENTS_PATH . '/compare-table.php'; ?>
  </div>

</main>
