<?php
declare(strict_types=1);
?>
<!-- 1. Hero Banner Component -->
<?php require COMPONENTS_PATH . '/hero.php'; ?>

<div class="container" style="padding-bottom: var(--spacing-16);">
  <!-- 2. Category Slider Component -->
  <?php require COMPONENTS_PATH . '/category-slider.php'; ?>

  <!-- 3. Featured Categories Section (Curated visual grid inspired by Apple Store) -->
  <section class="featured-categories-section" style="margin-top: var(--spacing-12);">
    <div class="section-header">
      <div>
        <h3 class="section-title font-semibold">Curated Collections</h3>
        <p class="text-sm text-muted">Handpicked tech groupings built for peak performance</p>
      </div>
    </div>
    <div class="grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
      <div class="span-lg-6 span-md-6 span-4 card category-promo-card" style="background: linear-gradient(135deg, #1d1d1f, #000); color: #fff; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between; padding: var(--spacing-6);">
        <div>
          <span class="text-xs uppercase tracking-wider font-semibold text-secondary">Flagships</span>
          <h4 class="font-semibold text-2xl" style="margin-top: var(--spacing-2); margin-bottom: var(--spacing-2);">Smartphones & Accessories</h4>
          <p class="text-sm text-muted">A18 Pro chips, Galaxy AI, and glyph interfaces.</p>
        </div>
        <a href="<?php echo url('/category/mobile'); ?>" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Explore Mobiles</a>
      </div>
      
      <div class="span-lg-6 span-md-6 span-4 card category-promo-card" style="background: linear-gradient(135deg, #2a2a2c, #111); color: #fff; min-height: 280px; display: flex; flex-direction: column; justify-content: space-between; padding: var(--spacing-6);">
        <div>
          <span class="text-xs uppercase tracking-wider font-semibold text-secondary">Work & Play</span>
          <h4 class="font-semibold text-2xl" style="margin-top: var(--spacing-2); margin-bottom: var(--spacing-2);">Lightweight Notebooks</h4>
          <p class="text-sm text-muted">Ryzen processors, RTX graphics, and Apple silicon power.</p>
        </div>
        <a href="<?php echo url('/category/laptop'); ?>" class="btn btn-secondary btn-sm" style="align-self: flex-start;">Explore Laptops</a>
      </div>
    </div>
  </section>

  <!-- 4. Popular Brands Component -->
  <?php require COMPONENTS_PATH . '/brand-slider.php'; ?>

  <!-- 5, 6, 7, 8. Tabbed Catalog sections (Featured, New Arrivals, Trending, Best Sellers) -->
  <section class="home-catalog-tabs-section" style="margin-top: var(--spacing-12);">
    <div class="section-header" style="flex-wrap: wrap; gap: var(--spacing-4);">
      <div>
        <h3 class="section-title font-semibold">Discover Top Picks</h3>
        <p class="text-sm text-muted">Official warranty, authentic gadgets, ready for dispatch</p>
      </div>
      <!-- Tab Headers -->
      <div class="tab-triggers" style="display: flex; gap: var(--spacing-2); background-color: var(--surface-light); padding: 4px; border-radius: var(--radius-md);">
        <button type="button" class="tab-btn active" data-tab-target="tab-featured">Featured</button>
        <button type="button" class="tab-btn" data-tab-target="tab-arrivals">New Arrivals</button>
        <button type="button" class="tab-btn" data-tab-target="tab-trending">Trending</button>
        <button type="button" class="tab-btn" data-tab-target="tab-best">Best Sellers</button>
      </div>
    </div>

    <!-- Reusable Product Card Template -->
    <?php require COMPONENTS_PATH . '/product-card.php'; ?>
    <?php require COMPONENTS_PATH . '/skeleton-product.php'; ?>

    <!-- Tab Panels -->
    <div class="tab-panels" style="margin-top: var(--spacing-6);">
      <!-- Featured Tab -->
      <div class="tab-panel active" id="tab-featured">
        <div class="grid" id="homepage-featured-grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
          <!-- Dynamic cards populated by home.js -->
        </div>
      </div>
      <!-- New Arrivals Tab -->
      <div class="tab-panel" id="tab-arrivals">
        <div class="grid" id="homepage-arrivals-grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
          <!-- Dynamic cards populated by home.js -->
        </div>
      </div>
      <!-- Trending Tab -->
      <div class="tab-panel" id="tab-trending">
        <div class="grid" id="homepage-trending-grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
          <!-- Dynamic cards populated by home.js -->
        </div>
      </div>
      <!-- Best Sellers Tab -->
      <div class="tab-panel" id="tab-best">
        <div class="grid" id="homepage-bestsellers-grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
          <!-- Dynamic cards populated by home.js -->
        </div>
      </div>
    </div>
  </section>

  <!-- 9. Flash Deals Countdown (Inspired by Nothing.tech flashing timers) -->
  <section class="flash-sale-section" style="margin-top: var(--spacing-12);">
    <div class="card flash-deal-container" style="background: linear-gradient(135deg, #a100ff, #380080); color: #fff; padding: var(--spacing-6) var(--spacing-8); border-radius: var(--radius-lg); position: relative; overflow: hidden; display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--spacing-6); align-items: center;">
      <div class="span-lg-4 span-md-5 span-4">
        <span class="badge" style="background-color: var(--secondary); color: var(--background); font-weight: 700; margin-bottom: var(--spacing-2);">FLASH DEAL</span>
        <h3 class="font-semibold text-2xl" style="margin-bottom: var(--spacing-2);">Limited Period Offer</h3>
        <p class="text-sm text-light" style="margin-bottom: var(--spacing-4); color: rgba(255,255,255,0.85);">Unlock an extra 10% flat discount on premium checkout orders today.</p>
        
        <!-- Timer -->
        <div class="countdown-timer-box" style="display: flex; gap: var(--spacing-2);">
          <div class="timer-segment">
            <span class="timer-val font-bold text-2xl" id="deal-timer-hours">00</span>
            <span class="timer-label text-xs uppercase" style="color: rgba(255,255,255,0.75);">Hrs</span>
          </div>
          <span class="timer-colon text-2xl font-bold">:</span>
          <div class="timer-segment">
            <span class="timer-val font-bold text-2xl" id="deal-timer-mins">00</span>
            <span class="timer-label text-xs uppercase" style="color: rgba(255,255,255,0.75);">Mins</span>
          </div>
          <span class="timer-colon text-2xl font-bold">:</span>
          <div class="timer-segment">
            <span class="timer-val font-bold text-2xl" id="deal-timer-secs">00</span>
            <span class="timer-label text-xs uppercase" style="color: rgba(255,255,255,0.75);">Secs</span>
          </div>
        </div>
      </div>
      
      <div class="span-lg-8 span-md-7 span-4">
        <div class="grid" id="homepage-flash-products" style="display: grid; gap: var(--spacing-4); grid-template-columns: repeat(8, 1fr);">
          <!-- Dynamic flash items populated by home.js -->
        </div>
      </div>
    </div>
  </section>

  <!-- 10. Today's Campaign Offers Banner -->
  <section class="todays-offers-section" style="margin-top: var(--spacing-12);" id="homepage-campaign-offers-wrapper">
    <div class="section-header">
      <div>
        <h3 class="section-title font-semibold">Today's Campaign Offers</h3>
        <p class="text-sm text-muted">Flat cart checkouts and festival value discounts</p>
      </div>
    </div>
    
    <div class="grid" id="homepage-offers-grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
      <!-- Injected by home.js -->
    </div>
  </section>

  <!-- 11. Recently Added Products Section -->
  <section class="recently-added-section" style="margin-top: var(--spacing-12);">
    <div class="section-header">
      <div>
        <h3 class="section-title font-semibold">Recently Added Gadgets</h3>
        <p class="text-sm text-muted">Latest integrations to the AtoZ catalog</p>
      </div>
    </div>
    <div class="grid" id="homepage-recent-grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
      <!-- Populated dynamically by home.js -->
    </div>
  </section>

  <!-- 12. Why Choose Us Section (Apple-style sleek features cards) -->
  <section class="why-choose-us-section" style="margin-top: var(--spacing-16);">
    <div class="section-header text-center" style="margin-bottom: var(--spacing-8);">
      <h3 class="section-title font-semibold text-2xl">Why Shop With AtoZ</h3>
      <p class="text-sm text-muted">We provide an outstanding end-to-end shopping experience</p>
    </div>
    <div class="grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
      <div class="span-lg-4 span-md-6 span-4 card benefits-card text-center" style="padding: var(--spacing-6); background-color: var(--surface);">
        <div class="benefit-icon" style="color: var(--primary); margin-bottom: var(--spacing-3);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        </div>
        <h4 class="font-semibold text-base" style="margin-bottom: var(--spacing-2);">Free Express Shipping</h4>
        <p class="text-xs text-muted">Free next-day delivery on all metro orders and secured tracking links.</p>
      </div>
      
      <div class="span-lg-4 span-md-6 span-4 card benefits-card text-center" style="padding: var(--spacing-6); background-color: var(--surface);">
        <div class="benefit-icon" style="color: var(--primary); margin-bottom: var(--spacing-3);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h4 class="font-semibold text-base" style="margin-bottom: var(--spacing-2);">Safe & Secured Payments</h4>
        <p class="text-xs text-muted">Fully encrypted transaction flows powered by Razorpay gateways.</p>
      </div>

      <div class="span-lg-4 span-md-12 span-4 card benefits-card text-center" style="padding: var(--spacing-6); background-color: var(--surface);">
        <div class="benefit-icon" style="color: var(--primary); margin-bottom: var(--spacing-3);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <h4 class="font-semibold text-base" style="margin-bottom: var(--spacing-2);">Dedicated 24/7 Support</h4>
        <p class="text-xs text-muted">Reach our specialized tech customer experts any time via live chat or call.</p>
      </div>
    </div>
  </section>

  <!-- 13. Customer Reviews Section -->
  <?php require COMPONENTS_PATH . '/review-section.php'; ?>

  <!-- 15. Sleek Technical Blog Preview Cards -->
  <section class="blog-preview-section" style="margin-top: var(--spacing-12);">
    <div class="section-header">
      <div>
        <h3 class="section-title font-semibold">Technology Insights</h3>
        <p class="text-sm text-muted">Stay ahead with the latest specs analysis and device guides</p>
      </div>
    </div>
    
    <div class="grid" style="display: grid; gap: var(--spacing-6); grid-template-columns: repeat(12, 1fr);">
      <div class="span-lg-4 span-md-6 span-4 card blog-card" style="background-color: var(--surface); display: flex; flex-direction: column; overflow: hidden;">
        <div style="height: 160px; background: linear-gradient(135deg, #444, #222); flex-shrink: 0;"></div>
        <div style="padding: var(--spacing-4); flex-grow: 1; display: flex; flex-direction: column;">
          <span class="text-xs text-muted font-semibold">JULY 10, 2026</span>
          <h4 class="font-semibold text-base" style="margin-top: var(--spacing-2); margin-bottom: var(--spacing-2);"><a href="#" style="color: var(--text);">Is Titanium Truly the Ultimate Frame?</a></h4>
          <p class="text-xs text-muted" style="line-height: 1.5; margin-bottom: var(--spacing-4);">An in-depth metallurgical analysis of Grade 5 Titanium alloys used in smartphone borders.</p>
          <a href="#" class="text-xs font-semibold" style="margin-top: auto; color: var(--primary);">Read Article &rarr;</a>
        </div>
      </div>
      
      <div class="span-lg-4 span-md-6 span-4 card blog-card" style="background-color: var(--surface); display: flex; flex-direction: column; overflow: hidden;">
        <div style="height: 160px; background: linear-gradient(135deg, #555, #333); flex-shrink: 0;"></div>
        <div style="padding: var(--spacing-4); flex-grow: 1; display: flex; flex-direction: column;">
          <span class="text-xs text-muted font-semibold">JUNE 28, 2026</span>
          <h4 class="font-semibold text-base" style="margin-top: var(--spacing-2); margin-bottom: var(--spacing-2);"><a href="#" style="color: var(--text);">Galaxy AI: Assistants vs. Utilities</a></h4>
          <p class="text-xs text-muted" style="line-height: 1.5; margin-bottom: var(--spacing-4);">Comparing local LLM circle-to-search functions with standard Google Assistant search hooks.</p>
          <a href="#" class="text-xs font-semibold" style="margin-top: auto; color: var(--primary);">Read Article &rarr;</a>
        </div>
      </div>
      
      <div class="span-lg-4 span-md-12 span-4 card blog-card" style="background-color: var(--surface); display: flex; flex-direction: column; overflow: hidden;">
        <div style="height: 160px; background: linear-gradient(135deg, #666, #444); flex-shrink: 0;"></div>
        <div style="padding: var(--spacing-4); flex-grow: 1; display: flex; flex-direction: column;">
          <span class="text-xs text-muted font-semibold">MAY 15, 2026</span>
          <h4 class="font-semibold text-base" style="margin-top: var(--spacing-2); margin-bottom: var(--spacing-2);"><a href="#" style="color: var(--text);">Noise Cancelling Processors Deep-dive</a></h4>
          <p class="text-xs text-muted" style="line-height: 1.5; margin-bottom: var(--spacing-4);">Comparing double V1 and QN1 processor latency responses in over-ear Sony WH models.</p>
          <a href="#" class="text-xs font-semibold" style="margin-top: auto; color: var(--primary);">Read Article &rarr;</a>
        </div>
      </div>
    </div>
  </section>

  <!-- 14. Newsletter Component -->
  <?php require COMPONENTS_PATH . '/newsletter.php'; ?>
</div>
