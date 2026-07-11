<?php
declare(strict_types=1);
?>
<header class="navbar-wrapper">
  <div class="container navbar-container">
    
    <!-- Site Logo -->
    <a href="<?php echo url('/'); ?>" class="nav-brand" aria-label="AtoZ Gadgets Home">
      <img src="<?php echo asset_url('images/atoz-logo.jpg'); ?>" alt="AtoZ Gadgets Logo" class="nav-logo-img" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;">
      <span>AtoZ</span>Gadgets
    </a>

    <!-- Navigation Menu (Desktop) -->
    <nav class="nav-menu" id="nav-menu" aria-label="Main Navigation">
      <a href="<?php echo url('/'); ?>" class="nav-link">Home</a>
      <a href="<?php echo url('/category/mobile'); ?>" class="nav-link">Mobiles</a>
      <a href="<?php echo url('/category/laptop'); ?>" class="nav-link">Laptops</a>
      <a href="<?php echo url('/category/audio'); ?>" class="nav-link">Audio</a>
      <a href="<?php echo url('/category/smartwatch'); ?>" class="nav-link">Wearables</a>
    </nav>

    <!-- Search Box System -->
    <div class="nav-search-container">
      <form class="nav-search-form" action="<?php echo url('/search'); ?>" method="GET">
        <svg class="nav-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="search" class="nav-search-input" name="q" id="nav-search-input" placeholder="Search premium electronics..." autocomplete="off" aria-label="Search Catalog">
      </form>
      <!-- AutoComplete Suggestions Portal -->
      <div class="search-suggestions-dropdown" id="search-suggestions">
        <!-- JS Autocomplete items inject here -->
      </div>
    </div>

    <!-- Right Side Actions Menus -->
    <div class="nav-actions">
      <!-- Search trigger (Mobile only placeholder) -->
      <button class="nav-action-btn md-hide" id="mobile-search-btn" aria-label="Search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>

      <!-- Wishlist Action -->
      <a href="<?php echo url('/wishlist'); ?>" class="nav-action-btn" aria-label="Wishlist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span class="nav-badge" id="wishlist-badge" style="display: none;">0</span>
      </a>

      <!-- Cart Action – opens mini-cart drawer; falls back to /cart page -->
      <button type="button" class="nav-action-btn" id="nav-cart-btn" aria-label="Open shopping cart" style="position: relative;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="nav-badge" id="nav-cart-badge" style="display: none;">0</span>
      </button>

      <!-- Account Actions -->
      <a href="<?php echo url('/account'); ?>" class="nav-action-btn" aria-label="Account Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </a>

      <!-- Hamburger mobile Menu toggle -->
      <button class="menu-toggle" id="menu-toggle" aria-label="Toggle Menu">
        <span class="menu-bar"></span>
        <span class="menu-bar"></span>
        <span class="menu-bar"></span>
      </button>
    </div>

  </div>
</header>
