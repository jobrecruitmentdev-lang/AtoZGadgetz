<?php
declare(strict_types=1);
?>
    </main> <!-- End main-content -->

    <!-- Global Portals for programmatically generated elements (Section 44) -->
    <?php require_once COMPONENTS_PATH . '/toast.php'; ?>
    <?php require_once COMPONENTS_PATH . '/loader.php'; ?>
    <?php require_once COMPONENTS_PATH . '/mini-cart.php'; ?>

    <!-- Premium Footer Section -->
    <footer class="footer-wrapper">
      <div class="container">
        
        <div class="row footer-top">
          <!-- Column 1: Brand Info -->
          <div class="span-lg-4 span-md-4 span-4">
            <div class="footer-brand">
              <h3 class="footer-brand-title"><span>AtoZ</span>Gadgets</h3>
              <p class="footer-brand-desc">High-end electronic designs and curated premium tech accessories tailored for elite experiences.</p>
            </div>
          </div>
          
          <!-- Column 2: Categories -->
          <div class="span-lg-3 span-md-2 span-2">
            <h4 class="footer-title">Categories</h4>
            <ul class="footer-links">
              <li><a href="<?php echo url('/category/mobile'); ?>" class="footer-link">Mobiles</a></li>
              <li><a href="<?php echo url('/category/laptop'); ?>" class="footer-link">Laptops</a></li>
              <li><a href="<?php echo url('/category/audio'); ?>" class="footer-link">Audio Gadgets</a></li>
              <li><a href="<?php echo url('/category/smartwatch'); ?>" class="footer-link">Smart Wearables</a></li>
            </ul>
          </div>
          
          <!-- Column 3: Customer Support -->
          <div class="span-lg-3 span-md-2 span-2">
            <h4 class="footer-title">Support</h4>
            <ul class="footer-links">
              <li><a href="<?php echo url('/account'); ?>" class="footer-link">My Account</a></li>
              <li><a href="<?php echo url('/cart'); ?>" class="footer-link">Order Status</a></li>
              <li><a href="#" class="footer-link">Terms of Service</a></li>
              <li><a href="#" class="footer-link">Privacy Policy</a></li>
            </ul>
          </div>

          <!-- Column 4: Newsletter -->
          <div class="span-lg-2 span-md-4 span-4">
            <h4 class="footer-title">Newsletter</h4>
            <p class="text-xs text-muted">Subscribe to receive launch announcements and exclusive member pricing.</p>
            <form class="footer-newsletter-form" onsubmit="event.preventDefault(); alert('Subscribed successfully!');">
              <input type="email" class="footer-newsletter-input" placeholder="Enter email address" required aria-label="Email for Newsletter">
              <button type="submit" class="btn btn-primary btn-sm">Subscribe</button>
            </form>
          </div>
        </div>

        <!-- Footer Bottom info -->
        <div class="footer-bottom">
          <p class="footer-copy">&copy; <?php echo date('Y'); ?> AtoZ Gadgets. All rights reserved. PSR-12 Compatible.</p>
          <div class="footer-payment-logos">
            <span>Powered by Razorpay & Stripe</span>
          </div>
        </div>

      </div>
    </footer>
  </div> <!-- End page-wrapper -->

  <!-- Global UI Core Controller (ES6 Module) -->
  <script type="module" src="<?php echo asset_url('js/components/ui.js'); ?>"></script>
  
  <!-- Automatic Badge Updates, Autocomplete, etc. -->
  <script type="module">
    import { cart } from '<?php echo asset_url('js/modules/cart.js'); ?>';
    import { wishlist } from '<?php echo asset_url('js/modules/wishlist.js'); ?>'; 
    import { debounce } from '<?php echo asset_url('js/helpers/helpers.js'); ?>';
    import { api } from '<?php echo asset_url('js/api/api.js'); ?>';
    import { initMiniCart } from '<?php echo asset_url('js/modules/mini-cart.js'); ?>';
    
    function updateCartBadge(state) {
      const badge = document.getElementById('nav-cart-badge');
      if (badge) {
        const count = state?.items ? state.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    }

    function updateWishlistBadge(items) {
      const badge = document.getElementById('wishlist-badge');
      if (badge) {
        const count = items ? items.length : 0;
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    }

    // Listen to cart:updated and wishlist:updated events (fired by modules after fetch)
    document.addEventListener('cart:updated', (e) => updateCartBadge(e.detail));
    document.addEventListener('wishlist:updated', (e) => updateWishlistBadge(e.detail?.items ?? e.detail));

    // Single shared init — fetch cart + wishlist once if logged in
    async function initSharedState() {
      if (!localStorage.getItem('access_token')) return;
      try {
        // cart.get() is called inside initMiniCart() already — listen via event
        const [cartState, wishlistState] = await Promise.all([
          cart.get().catch(() => null),
          wishlist.get().catch(() => null)
        ]);
        if (cartState) updateCartBadge(cartState);
        if (wishlistState) updateWishlistBadge(wishlistState);
      } catch (e) {
        console.warn('Shared state init failed:', e);
      }
    }

    // Handle search autocomplete
    const searchInput = document.getElementById('nav-search-input');
    const suggestionsBox = document.getElementById('search-suggestions');

    if (searchInput && suggestionsBox) {
      const handleAutocomplete = debounce(async (query) => {
        if (query.trim().length < 1) {
          suggestionsBox.classList.remove('active');
          return;
        }
        try {
          const res = await api.request(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
          if (res.success && res.data && res.data.suggestions.length > 0) {
            suggestionsBox.innerHTML = res.data.suggestions
              .map(s => `<div class="suggestion-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> ${s}</div>`)
              .join('');
            suggestionsBox.classList.add('active');
            
            suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
              item.addEventListener('click', () => {
                const text = item.innerText.trim();
                searchInput.value = text;
                suggestionsBox.classList.remove('active');
                searchInput.closest('form').submit();
              });
            });
          } else {
            suggestionsBox.classList.remove('active');
          }
        } catch (e) {
          console.error(e);
        }
      }, 300);

      searchInput.addEventListener('input', (e) => handleAutocomplete(e.target.value));
      
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
          suggestionsBox.classList.remove('active');
        }
      });
    }

    // Init mini cart (it will call cart.get() internally for badge)
    initMiniCart();
    // Init shared state (cart + wishlist badges)
    initSharedState();
  </script>


  <!-- Page Specific JavaScript Module (Section 49) -->
  <?php 
  $currentPage = $GLOBALS['current_page'] ?? 'home';
  if (file_exists(PUBLIC_PATH . '/assets/js/pages/' . $currentPage . '.js')): ?>
    <script type="module" src="<?php echo asset_url('js/pages/' . $currentPage . '.js'); ?>"></script>
  <?php endif; ?>

</body>
</html>
