<?php
declare(strict_types=1);

// Resolve current page paths for breadcrumbs
$currentPage = $GLOBALS['current_page'] ?? 'home';
$routeParams = $GLOBALS['route_params'] ?? [];
?>
<nav aria-label="Breadcrumb" style="padding: var(--spacing-4) 0; font-size: 0.8rem; color: var(--text-muted); width: 100%;">
  <ol style="display: flex; align-items: center; flex-wrap: wrap; gap: var(--spacing-2); list-style: none;">
    
    <li>
      <a href="<?php echo url('/'); ?>" style="opacity: 0.8; transition: opacity var(--transition-fast); display: flex; align-items: center; gap: 4px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Home
      </a>
    </li>
    
    <?php if ($currentPage !== 'home'): ?>
      <li style="display: flex; align-items: center; opacity: 0.5;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </li>
      
      <?php if ($currentPage === 'category'): ?>
        <?php if (!empty($routeParams['category_slug'])): ?>
          <li><span style="text-transform: capitalize; color: var(--text); font-weight: 600;"><?php echo escape($routeParams['category_slug']); ?></span></li>
        <?php elseif (!empty($routeParams['brand_slug'])): ?>
          <li><span style="text-transform: capitalize; color: var(--text); font-weight: 600;"><?php echo escape($routeParams['brand_slug']); ?></span></li>
        <?php else: ?>
          <li><span style="color: var(--text); font-weight: 600;">Store Catalog</span></li>
        <?php endif; ?>
        
      <?php elseif ($currentPage === 'product'): ?>
        <li>
          <a href="<?php echo url('/category/all'); ?>" style="opacity: 0.8;">Catalog</a>
        </li>
        <li style="display: flex; align-items: center; opacity: 0.5;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </li>
        <li><span id="breadcrumb-product-name" style="color: var(--text); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; display: inline-block; vertical-align: bottom;">Product details</span></li>
        
      <?php else: ?>
        <li><span style="text-transform: capitalize; color: var(--text); font-weight: 600;"><?php echo escape($currentPage); ?></span></li>
      <?php endif; ?>
    <?php endif; ?>
    
  </ol>
</nav>
