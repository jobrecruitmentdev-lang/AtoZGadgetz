<?php
declare(strict_types=1);
// Check if seoData exists, fallback if index.php not run directly
if (!isset($seoData)) {
    $seoData = get_seo_meta($GLOBALS['current_page'] ?? 'home');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Meta Tags (Section 11 & Section 15) -->
  <title><?php echo escape($seoData['title']); ?></title>
  <meta name="description" content="<?php echo escape($seoData['description']); ?>">
  <link rel="canonical" href="<?php echo escape($seoData['canonical']); ?>">
  
  <!-- Open Graph / Facebook (Section 15) -->
  <meta property="og:type" content="<?php echo escape($seoData['og_type']); ?>">
  <meta property="og:title" content="<?php echo escape($seoData['title']); ?>">
  <meta property="og:description" content="<?php echo escape($seoData['description']); ?>">
  <meta property="og:url" content="<?php echo escape($seoData['canonical']); ?>">
  <meta property="og:image" content="<?php echo escape($seoData['og_image']); ?>">
  <meta property="og:site_name" content="<?php echo escape(APP_NAME); ?>">

  <!-- Twitter (Section 15) -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?php echo escape($seoData['title']); ?>">
  <meta name="twitter:description" content="<?php echo escape($seoData['description']); ?>">
  <meta name="twitter:image" content="<?php echo escape($seoData['og_image']); ?>">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="<?php echo asset_url('images/favicon.png'); ?>">

  <!-- Google Fonts (Section 36 & Section 39) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Core Layout Stylesheets (Section 49) -->
  <link rel="stylesheet" href="<?php echo asset_url('css/base/variables.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/base/reset.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/base/typography.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/layout/grid.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/layout/header.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/layout/navbar.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/layout/footer.css'); ?>">

  <!-- Reusable Component Stylesheets (Section 44) -->
  <link rel="stylesheet" href="<?php echo asset_url('css/components/button.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/card.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/modal.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/toast.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/loader.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/product-card.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/filter.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/toolbar.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/pagination.css'); ?>">
  <link rel="stylesheet" href="<?php echo asset_url('css/components/mini-cart.css'); ?>">

  <!-- Page Specific Stylesheet (Section 49) -->
  <?php 
  $currentPage = $GLOBALS['current_page'] ?? 'home';
  $authPages = ['login', 'register', 'forgot-password', 'reset-password'];
  if (in_array($currentPage, $authPages)) {
      echo '<link rel="stylesheet" href="' . asset_url('css/pages/auth.css') . '">';
  }
  if (file_exists(PUBLIC_PATH . '/assets/css/pages/' . $currentPage . '.css')): ?>
    <link rel="stylesheet" href="<?php echo asset_url('css/pages/' . $currentPage . '.css'); ?>">
  <?php endif; ?>

  <!-- JSON-LD Structured Schema (Section 15) -->
  <?php if (!empty($seoData['schema'])): ?>
    <script type="application/ld+json">
      <?php echo $seoData['schema']; ?>
    </script>
  <?php endif; ?>
  <!-- Expose route configuration parameters to Javascript modules -->
  <script>
    window.APP_CONFIG = {
      currentPage: '<?php echo $currentPage; ?>',
      routeParams: <?php echo json_encode($GLOBALS['route_params'] ?? []); ?>
    };
  </script>
  <!-- PWA -->
  <link rel="manifest" href="/manifest.json">
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js?v=<?php echo ASSETS_VERSION; ?>').catch(err => console.log('SW setup failed: ', err));
      });
    }
  </script>
</head>
<body>
  
  <div class="page-wrapper">
    <!-- Header Navigation Include -->
    <?php require_once COMPONENTS_PATH . '/navbar.php'; ?>
    
    <main class="main-content">
