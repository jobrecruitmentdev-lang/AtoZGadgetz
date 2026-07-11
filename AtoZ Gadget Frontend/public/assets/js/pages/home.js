import { fetchAPI } from '../api/api.js';
import { formatPrice } from '../helpers/helpers.js';
import { cart } from '../modules/cart.js';
import { wishlist } from '../modules/wishlist.js';
import { ui } from '../components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  if (window.APP_CONFIG && window.APP_CONFIG.currentPage === 'home') {
    initHomepage();
  }
});

async function initHomepage() {
  // 1. Initialize Hero Slider
  await initHeroSlider();

  // 2. Load Categories Circle Row
  await loadCategoriesCircles();

  // 3. Load Brand Badges Slider
  await loadBrandsBadges();

  // 4. Load Homepage CMS Sections (Featured, New Arrivals, Trending)
  await loadCMSSections();

  // 5. Load Flash Sale offer countdown timer
  await initFlashDeals();

  // 6. Load Campaign Offers lists
  await loadCampaignOffers();

  // 7. Load Recently Added Products
  await loadRecentlyAdded();

  // 8. Load Customer Reviews
  await loadCustomerReviews();

  // 9. Bind tab selection buttons triggers
  initTabs();

  // 10. Bind Newsletter AJAX Subscription Form
  initNewsletterForm();
}

/**
 * 1. Hero Slider (Fetch dynamic banners from backend via /api/banners)
 */
async function initHeroSlider() {
  const slider = document.getElementById('homepage-hero-slider');
  if (!slider) return;

  try {
    const res = await fetchAPI('/api/banners');
    if (res && res.success && res.data && res.data.length > 0) {
      // Filter out banners that are meant for "Homepage Slider"
      const sliderBanners = res.data.filter(b => b.position === 'Homepage Slider');
      if (sliderBanners.length > 0) {
        slider.innerHTML = sliderBanners.map((banner, idx) => `
          <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="background: linear-gradient(180deg, rgba(10, 10, 12, 0.15), rgba(10, 10, 12, 0.85)), url('/${banner.image}') center/cover no-repeat;">
            <div class="hero-slide-content">
              <h1 class="hero-slide-title">${banner.title}</h1>
              <p class="hero-slide-desc">Premium electronic engineering. Experience state-of-the-art designs today.</p>
              <a href="${banner.redirect_url || '/products'}" class="btn btn-primary">Shop Now</a>
            </div>
          </div>
        `).join('');

        // Slide cycle loops (Rotate every 6 seconds)
        let activeIdx = 0;
        const slides = slider.querySelectorAll('.hero-slide');
        if (slides.length > 1) {
          setInterval(() => {
            slides[activeIdx].classList.remove('active');
            activeIdx = (activeIdx + 1) % slides.length;
            slides[activeIdx].classList.add('active');
          }, 6000);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load home banners from DB:', err);
  }
}

/**
 * 2. Categories circles grid
 */
async function loadCategoriesCircles() {
  const grid = document.getElementById('homepage-categories-circles');
  if (!grid) return;

  try {
    const res = await fetchAPI('/api/categories');
    if (res && res.success && res.data && res.data.length > 0) {
      grid.innerHTML = res.data.map(cat => `
        <a href="/category/${cat.slug}" class="category-circle-item">
          <div class="category-circle-icon">
            <img src="/${cat.image || 'public/assets/images/category-placeholder.png'}" alt="${cat.name}" width="42" height="42" style="object-fit: contain;" loading="lazy">
          </div>
          <span class="category-circle-name">${cat.name}</span>
        </a>
      `).join('');
    } else {
      grid.innerHTML = '<p class="text-xs text-muted">No categories listed.</p>';
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * 3. Brands badges slider
 */
async function loadBrandsBadges() {
  const container = document.getElementById('homepage-brands-badges');
  if (!container) return;

  try {
    const res = await fetchAPI('/api/brands');
    if (res && res.success && res.data && res.data.length > 0) {
      container.innerHTML = res.data.map(brand => `
        <a href="/brand/${brand.slug}" class="brand-badge-item">
          <img class="brand-badge-logo" src="/${brand.logo || 'public/assets/images/placeholder.png'}" alt="${brand.name}" loading="lazy">
        </a>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-xs text-muted">No brands registered.</p>';
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * 4. Homepage sections mapping (Trending, Featured, New Arrivals)
 */
async function loadCMSSections() {
  const grids = {
    'Trending Products': document.getElementById('homepage-trending-grid'),
    'Featured Products': document.getElementById('homepage-featured-grid'),
    'New Arrivals': document.getElementById('homepage-arrivals-grid')
  };

  try {
    const res = await fetchAPI('/api/homepage-sections');
    if (res && res.success && res.data) {
      res.data.forEach(section => {
        const grid = grids[section.section_type];
        if (grid && section.featured_products && section.featured_products.length > 0) {
          const products = section.featured_products.map(fp => fp.product).filter(Boolean);
          renderProductsToGrid(grid, products);
        } else if (grid) {
          grid.innerHTML = '<div class="span-full text-center text-muted py-6">No products linked in this section.</div>';
        }
      });
    }
  } catch (err) {
    console.error('Failed to load CMS Sections:', err);
  }
}

/**
 * 5. Flash Deals countdown timer
 */
async function initFlashDeals() {
  const timerHours = document.getElementById('deal-timer-hours');
  const timerMins = document.getElementById('deal-timer-mins');
  const timerSecs = document.getElementById('deal-timer-secs');
  const flashGrid = document.getElementById('homepage-flash-products');

  if (!flashGrid) return;

  try {
    const offersRes = await fetchAPI('/api/offers');
    let activeOffer = null;
    const now = new Date();

    if (offersRes && offersRes.success && offersRes.data) {
      // Find active offer with type "Cart" or "Festival" that ends soon
      activeOffer = offersRes.data.find(o => o.status === 'active' && new Date(o.end_date) > now);
    }

    // Load dynamic items for flash deal grid
    const productsRes = await fetchAPI('/api/store/products?size=2');
    if (productsRes && productsRes.success && productsRes.data && productsRes.data.items) {
      renderProductsToGrid(flashGrid, productsRes.data.items);
    }

    if (!activeOffer) {
      // Default fallback end time (4 hours from now) if no active offers exist
      const mockEndTime = new Date().getTime() + (4 * 60 * 60 * 1000);
      runTimer(mockEndTime);
    } else {
      const endTime = new Date(activeOffer.end_date).getTime();
      runTimer(endTime);
    }
  } catch (err) {
    console.warn(err);
  }

  function runTimer(endTime) {
    function updateTimer() {
      const distance = endTime - new Date().getTime();
      if (distance < 0) {
        if (timerHours) timerHours.innerText = '00';
        if (timerMins) timerMins.innerText = '00';
        if (timerSecs) timerSecs.innerText = '00';
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (timerHours) timerHours.innerText = hours.toString().padStart(2, '0');
      if (timerMins) timerMins.innerText = minutes.toString().padStart(2, '0');
      if (timerSecs) timerSecs.innerText = seconds.toString().padStart(2, '0');
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
  }
}

/**
 * 6. Today's Campaign Offers
 */
async function loadCampaignOffers() {
  const grid = document.getElementById('homepage-offers-grid');
  if (!grid) return;

  try {
    const res = await fetchAPI('/api/offers');
    if (res && res.success && res.data && res.data.length > 0) {
      grid.innerHTML = res.data.map(offer => `
        <div class="span-lg-6 span-md-6 span-4 card" style="background-color: var(--surface); padding: var(--spacing-5); display: flex; flex-direction: column; justify-content: space-between; min-height: 170px;">
          <div>
            <span class="badge" style="background-color: var(--primary); color: var(--background); margin-bottom: var(--spacing-2); font-weight: 700;">PROMO</span>
            <h4 class="font-semibold text-lg" style="margin-top: var(--spacing-1);">${offer.name}</h4>
            <p class="text-xs text-muted" style="margin-top: var(--spacing-2); line-height: 1.5;">${offer.description}</p>
          </div>
          <div style="margin-top: var(--spacing-4); border-top: 1px solid var(--border-light); padding-top: var(--spacing-3); display: flex; align-items: center; justify-content: space-between;">
            <span class="text-xs font-semibold uppercase tracking-wider text-secondary">${offer.discount_value}% Discount</span>
            <a href="/products" class="text-xs font-semibold" style="color: var(--primary);">View Products &rarr;</a>
          </div>
        </div>
      `).join('');
    } else {
      document.getElementById('homepage-campaign-offers-wrapper').style.display = 'none';
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * 7. Recently Added Products
 */
async function loadRecentlyAdded() {
  const grid = document.getElementById('homepage-recent-grid');
  if (!grid) return;

  try {
    const res = await fetchAPI('/api/store/products?page=1&size=4&sort_by=latest');
    if (res && res.success && res.data && res.data.items) {
      renderProductsToGrid(grid, res.data.items);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * 8. Customer Reviews Testimonials (Dynamic reviewer data)
 */
async function loadCustomerReviews() {
  const grid = document.getElementById('homepage-reviews-grid');
  if (!grid) return;

  try {
    // Collect reviews from active product tables (iPhone, S24 etc.)
    const productsRes = await fetchAPI('/api/store/products?size=3');
    let reviewItems = [];

    if (productsRes && productsRes.success && productsRes.data && productsRes.data.items) {
      const products = productsRes.data.items;
      
      // Parallel fetch reviews
      const reviewsPromises = products.map(p => fetchAPI(`/api/products/${p.id}/reviews`));
      const reviewsResponses = await Promise.all(reviewsPromises);

      reviewsResponses.forEach((res, idx) => {
        const prod = products[idx];
        if (res && res.success && res.data && res.data.length > 0) {
          res.data.forEach(r => {
            reviewItems.push({
              reviewer: r.user ? `${r.user.first_name} ${r.user.last_name}` : 'Verified Buyer',
              rating: r.rating,
              reviewText: r.review,
              productName: prod.name
            });
          });
        }
      });
    }

    // Default premium fallback testimonials if no database records exist
    if (reviewItems.length === 0) {
      reviewItems = [
        { reviewer: "Aarav Sharma", rating: 5, reviewText: "The iPhone 16 Pro's Titanium build is extremely sleek. Deliveries were fast and fully tracked.", productName: "Apple iPhone 16 Pro" },
        { reviewer: "Neha Patel", rating: 5, reviewText: "Absolute masterpiece noise cancellation. The Sony WH-1000XM5 blocks everything. Recommended!", productName: "Sony WH-1000XM5" },
        { reviewer: "Kabir Mehta", rating: 4, reviewText: "Incredible value for daily productivity. Lightweight and stays cool under heavy workloads.", productName: "MacBook Air M3" }
      ];
    }

    grid.innerHTML = reviewItems.slice(0, 3).map(item => {
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        starsHtml += `<svg class="${i <= item.rating ? 'filled' : 'empty'}" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>`;
      }

      return `
        <div class="review-card">
          <div class="review-stars" style="display: flex; gap: 2px; color: #ffb800; margin-bottom: var(--spacing-2);">
            ${starsHtml}
          </div>
          <p class="text-sm" style="line-height: 1.6; margin-bottom: var(--spacing-4); flex-grow: 1;">"${item.reviewText}"</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: var(--spacing-2); margin-top: auto;">
            <div>
              <span class="text-xs font-bold" style="color: var(--text);">${item.reviewer}</span>
              <span class="badge badge-verified" style="display: inline-block; font-size: 9px; padding: 2px 5px; margin-left: 5px; background-color: var(--success); color: #fff; border-radius: 4px;">Verified</span>
            </div>
            <span class="text-xs text-muted" style="max-width: 140px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.productName}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed loading testimonials:', err);
  }
}

/**
 * Render collections to grids helper
 */
function renderProductsToGrid(gridContainer, items) {
  const template = document.getElementById('product-card-template');
  if (!gridContainer || !template) return;

  gridContainer.innerHTML = '';
  items.forEach(item => {
    const clone = template.content.cloneNode(true);
    
    // Media paths
    const imgEl = clone.querySelector('.product-card-img');
    const webpSrc = clone.querySelector('.card-img-webp');
    const primaryImg = item.images && item.images[0] ? item.images[0].image : 'public/assets/images/placeholder.png';
    
    if (imgEl) {
      imgEl.src = '/' + primaryImg;
      imgEl.alt = item.name;
    }
    if (webpSrc) webpSrc.srcset = '/' + primaryImg;

    // Badges
    const badgeNew = clone.querySelector('.badge-new');
    const badgeSale = clone.querySelector('.badge-sale');
    if (item.is_featured && badgeNew) badgeNew.style.display = 'inline-block';
    if (item.discount_price && badgeSale) badgeSale.style.display = 'inline-block';

    clone.querySelector('.card-brand').innerText = item.brand ? item.brand.name : 'Gadgets';
    
    const titleLink = clone.querySelector('.product-card-title');
    titleLink.innerText = item.name;
    titleLink.href = `/product/${item.slug}`;

    const currentPrice = item.discount_price !== null ? item.discount_price : item.price;
    clone.querySelector('.price-current').innerText = formatPrice(currentPrice);

    const originalPrice = clone.querySelector('.price-original');
    if (item.discount_price && originalPrice) {
      originalPrice.innerText = formatPrice(item.price);
      originalPrice.style.display = 'inline-block';
    }

    // Availability stock
    const stockIn = clone.querySelector('.stock-in');
    const stockOut = clone.querySelector('.stock-out');
    if (item.stock_quantity > 0) {
      if (stockIn) stockIn.style.display = 'inline-block';
    } else {
      if (stockOut) stockOut.style.display = 'inline-block';
      const buyBtn = clone.querySelector('.add-to-cart-btn');
      if (buyBtn) {
        buyBtn.innerText = 'Out of Stock';
        buyBtn.disabled = true;
      }
    }

    // Rating Review count mock
    const starsBox = clone.querySelector('.rating-stars');
    const ratingLabel = clone.querySelector('.rating-count');
    if (starsBox) {
      starsBox.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      `;
    }
    if (ratingLabel) ratingLabel.innerText = '(1)';

    // Attach data product attributes
    clone.querySelectorAll('[data-product-id]').forEach(el => el.setAttribute('data-product-id', item.id.toString()));

    gridContainer.appendChild(clone);
  });

  // Bind cart/wishlist click handlers
  bindGridCardActions(gridContainer);
}

function bindGridCardActions(grid) {
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = Number(btn.getAttribute('data-product-id'));
      if (!id) return;

      try {
        btn.disabled = true;
        btn.innerText = 'Adding...';
        await cart.add(id, 1);
        btn.innerText = 'Added!';
        ui.toast('Product added to shopping cart!', 'success');
        setTimeout(() => {
          btn.disabled = false;
          btn.innerText = 'Add';
        }, 1500);
      } catch (err) {
        console.error(err);
        btn.disabled = false;
        btn.innerText = 'Add';
        ui.toast('Failed adding to cart. Please sign in first.', 'error');
      }
    });
  });

  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = Number(btn.getAttribute('data-product-id'));
      if (!id) return;

      try {
        btn.classList.toggle('active');
        await wishlist.add(id);
        ui.toast('Wishlist status updated!', 'success');
      } catch (err) {
        console.error(err);
        btn.classList.remove('active');
        ui.toast('Failed updating wishlist. Please sign in.', 'error');
      }
    });
  });

  grid.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      ui.toast('Loading quick view specs sheet...', 'info');
    });
  });

  grid.querySelectorAll('.compare-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      ui.toast('Added to comparison grid.', 'info');
    });
  });
}

/**
 * 9. Tab toggling
 */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanelId = btn.dataset.tabTarget;
      const targetPanel = document.getElementById(targetPanelId);
      if (!targetPanel) return;

      // Reset buttons
      btn.closest('.tab-triggers').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Reset panels
      const parent = targetPanel.closest('.tab-panels');
      parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      targetPanel.classList.add('active');
    });
  });
}

/**
 * 10. Newsletter Form
 */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-email');
  const submitBtn = document.getElementById('newsletter-submit-btn');

  if (!form || !input || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    try {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Subscribing...';
      
      // Simulate AJAX subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      ui.toast('Thank you for subscribing to AtoZ newsletter!', 'success');
      input.value = '';
    } catch (err) {
      ui.toast('Subscription failed. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Subscribe';
    }
  });
}
