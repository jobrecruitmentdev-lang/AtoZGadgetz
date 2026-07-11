<?php
declare(strict_types=1);

// Ensure product slug exists
$slug = $routeParams['slug'] ?? '';
if (empty($slug)) {
    redirect('/');
}
?>
<main class="container pdp-main-wrapper" style="padding-top: var(--spacing-6); padding-bottom: var(--spacing-10);">

  <!-- Breadcrumbs -->
  <?php require_once COMPONENTS_PATH . '/product-breadcrumb.php'; ?>

  <!-- Main Grid Layout split (Gallery + Info panel column) -->
  <div class="grid" style="display: grid; gap: var(--spacing-8); grid-template-columns: repeat(12, 1fr); margin-bottom: var(--spacing-8);">
    
    <!-- Left Column: Media Gallery Showcase -->
    <div class="span-lg-7 span-md-6 span-4">
      <?php require_once COMPONENTS_PATH . '/product-gallery.php'; ?>
    </div>

    <!-- Right Column: Buying Box panel controls -->
    <div class="span-lg-5 span-md-6 span-4" style="display: flex; flex-direction: column;">
      <?php require_once COMPONENTS_PATH . '/product-info.php'; ?>
      <?php require_once COMPONENTS_PATH . '/product-price.php'; ?>
      <?php require_once COMPONENTS_PATH . '/variant-selector.php'; ?>
      <?php require_once COMPONENTS_PATH . '/buy-box.php'; ?>
      <?php require_once COMPONENTS_PATH . '/share-buttons.php'; ?>
      
      <div style="margin-top: var(--spacing-6);">
        <?php require_once COMPONENTS_PATH . '/offer-box.php'; ?>
        <?php require_once COMPONENTS_PATH . '/delivery-check.php'; ?>
      </div>
    </div>

  </div>

  <!-- Detailed Technical Tabs section -->
  <div class="pdp-details-tabs-wrapper">
    <?php require_once COMPONENTS_PATH . '/description.php'; ?>
    <?php require_once COMPONENTS_PATH . '/features.php'; ?>
    <?php require_once COMPONENTS_PATH . '/specifications.php'; ?>
  </div>

  <!-- Customer QA and Reviews Grid Split -->
  <div class="grid" style="display: grid; gap: var(--spacing-8); grid-template-columns: repeat(12, 1fr); margin-top: var(--spacing-8);">
    
    <!-- Q&A block -->
    <div class="span-lg-6 span-md-12 span-4">
      <?php require_once COMPONENTS_PATH . '/question-answer.php'; ?>
    </div>

    <!-- Reviews listing portal -->
    <div class="span-lg-6 span-md-12 span-4" style="margin-top: var(--spacing-10); padding-top: var(--spacing-8); border-top: 1px solid var(--border-light);">
      <h3 class="font-semibold text-xl" style="margin-bottom: var(--spacing-4);">Customer Feedback & Ratings</h3>
      <?php require_once COMPONENTS_PATH . '/review-summary.php'; ?>
      <?php require_once COMPONENTS_PATH . '/review-list.php'; ?>
      <?php require_once COMPONENTS_PATH . '/write-review.php'; ?>
    </div>

  </div>

  <!-- Similar items showcase -->
  <?php require_once COMPONENTS_PATH . '/related-products.php'; ?>
  <?php require_once COMPONENTS_PATH . '/recent-products.php'; ?>

</main>

<!-- Bottom Mobile Floating Sticky Buy Bar -->
<?php require_once COMPONENTS_PATH . '/sticky-buy-bar.php'; ?>
