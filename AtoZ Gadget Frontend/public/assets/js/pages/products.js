import { fetchAPI } from '../api/api.js';
import { FilterManager } from '../modules/filter.js';
import { initSort } from '../modules/sort.js';
import { renderPagination } from '../modules/pagination.js';
import { initViewToggle } from '../modules/view-toggle.js';
import { initLazyLoad } from '../modules/lazyload.js';
import { formatPrice } from '../helpers/helpers.js';
import { cart } from '../modules/cart.js';
import { wishlist } from '../modules/wishlist.js';
import { ui } from '../components/ui.js';

export class CatalogController {
  constructor(options = {}) {
    this.lockedCategory = options.lockedCategory || null;
    this.lockedBrand = options.lockedBrand || null;
    this.searchQuery = options.searchQuery || null;

    this.currentPage = 1;
    this.pageSize = 9;
    this.sortBy = 'latest';
    this.filters = {};

    this.gridContainer = 'product-listing-grid';
    this.filterManager = null;
    this.sortHandler = null;
  }

  async init() {
    // 1. Initialise View switcher (grid/list toggle)
    initViewToggle(this.gridContainer, (view) => {
      this.loadProducts();
    });

    // 2. Initialise Sorting dropdown
    this.sortHandler = initSort('catalog-sort-select', (newSort) => {
      this.sortBy = newSort;
      this.currentPage = 1;
      this.loadProducts();
    });
    if (this.sortHandler) {
      this.sortBy = this.sortHandler.getValue() || 'latest';
    }

    // 3. Initialise Advanced filter manager
    this.filterManager = new FilterManager({
      containerId: 'catalog-filter-sidebar',
      lockedCategory: this.lockedCategory,
      lockedBrand: this.lockedBrand,
      onChange: (newState) => {
        this.filters = newState;
        this.currentPage = 1;
        this.loadProducts();
      }
    });

    // Load filter checkboxes metadata first
    await this.filterManager.loadMetadata();

    // Sync active state from URL query strings
    this.filterManager.parseUrlParams();
    this.filters = this.filterManager.state;

    // 4. Bind mobile responsive sliders triggers
    this.bindMobileDrawer();

    // 5. Load products
    await this.loadProducts();
  }

  bindMobileDrawer() {
    const openBtn = document.getElementById('mobile-filter-open-btn');
    const closeBtn = document.getElementById('close-filter-btn');
    const sidebar = document.getElementById('catalog-filter-sidebar');

    if (openBtn && sidebar) {
      openBtn.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (closeBtn && sidebar) {
      closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    }
  }

  showSkeletons() {
    const grid = document.getElementById(this.gridContainer);
    const template = document.getElementById('product-skeleton-template');
    if (!grid || !template) return;

    grid.innerHTML = '';
    for (let i = 0; i < this.pageSize; i++) {
      const clone = template.content.cloneNode(true);
      grid.appendChild(clone);
    }
  }

  async loadProducts() {
    this.showSkeletons();

    try {
      let endpoint = '/api/store/products';
      const params = new URLSearchParams();

      params.set('page', this.currentPage.toString());
      params.set('size', this.pageSize.toString());
      params.set('sort_by', this.sortBy);

      // Handle locking context rules (category list or brand page)
      if (this.lockedCategory) {
        params.set('category_id', this.lockedCategory.toString());
      } else if (this.filters.categories && this.filters.categories.length > 0) {
        params.set('category_id', this.filters.categories.join(','));
      }

      if (this.lockedBrand) {
        params.set('brand_id', this.lockedBrand.toString());
      } else if (this.filters.brands && this.filters.brands.length > 0) {
        params.set('brand_id', this.filters.brands.join(','));
      }

      if (this.filters.priceMax && this.filters.priceMax < 150000) {
        params.set('price_max', this.filters.priceMax.toString());
      }
      
      if (this.filters.inStock) {
        // filter in-stock products
        params.set('in_stock', 'true');
      }

      if (this.filters.discount) {
        // filter discount products
        params.set('discount_only', 'true');
      }

      // Handle search queries endpoint routing
      if (this.searchQuery) {
        endpoint = '/api/search/products';
        params.set('search', this.searchQuery);
      }

      const response = await fetchAPI(`${endpoint}?${params.toString()}`);
      if (response && response.success && response.data) {
        const items = response.data.items || [];
        const total = response.data.total || 0;
        this.renderCatalog(items, total);
      } else {
        this.renderEmptyState();
      }
    } catch (err) {
      console.error('Failed loading catalog products:', err);
      this.renderEmptyState();
    }
  }

  renderCatalog(items, total) {
    const grid = document.getElementById(this.gridContainer);
    const emptyState = document.getElementById('catalog-empty-state');

    if (!grid) return;

    // Sync count metrics text
    const countText = document.getElementById('toolbar-product-count');
    if (countText) {
      countText.innerText = `${total} premium item${total !== 1 ? 's' : ''} loaded`;
    }

    if (items.length === 0) {
      this.renderEmptyState();
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';

    const viewMode = localStorage.getItem('catalog-view-preference') || 'grid';
    const cardTemplate = document.getElementById('product-card-template');
    const listTemplate = document.getElementById('product-list-card-template');

    items.forEach(item => {
      let clone = null;
      if (viewMode === 'list' && listTemplate) {
        clone = listTemplate.content.cloneNode(true);
        this.populateListCard(clone, item);
      } else if (cardTemplate) {
        clone = cardTemplate.content.cloneNode(true);
        this.populateGridCard(clone, item);
      }

      if (clone) grid.appendChild(clone);
    });

    this.bindCatalogEvents(grid);
    initLazyLoad();

    // Render pagination row links
    const totalPages = Math.ceil(total / this.pageSize);
    renderPagination(totalPages, this.currentPage, (newPage) => {
      this.currentPage = newPage;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  populateGridCard(clone, item) {
    const imgElement = clone.querySelector('.product-card-img');
    const webpSource = clone.querySelector('.card-img-webp');
    const primaryImg = item.images && item.images[0] ? item.images[0].image : 'public/assets/images/placeholder.png';

    if (imgElement) {
      imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
      imgElement.dataset.src = '/' + primaryImg;
      imgElement.alt = item.name;
    }
    if (webpSource) {
      webpSource.srcset = '/' + primaryImg;
    }

    // Badges details
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

    // Stock badges
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

    // Star reviews
    const ratingBox = clone.querySelector('.rating-stars');
    const ratingCount = clone.querySelector('.rating-count');
    if (ratingBox) ratingBox.innerHTML = this.getStarsHtml(5);
    if (ratingCount) ratingCount.innerText = '(1)';

    clone.querySelectorAll('[data-product-id]').forEach(elem => {
      elem.setAttribute('data-product-id', item.id.toString());
    });
  }

  populateListCard(clone, item) {
    const imgElement = clone.querySelector('.list-card-img');
    const webpSource = clone.querySelector('.list-card-img-webp');
    const primaryImg = item.images && item.images[0] ? item.images[0].image : 'public/assets/images/placeholder.png';

    if (imgElement) {
      imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
      imgElement.dataset.src = '/' + primaryImg;
      imgElement.alt = item.name;
    }
    if (webpSource) webpSource.srcset = '/' + primaryImg;

    clone.querySelector('.list-brand').innerText = item.brand ? item.brand.name : 'Gadgets';
    
    const titleLink = clone.querySelector('.list-title-link');
    titleLink.innerText = item.name;
    titleLink.href = `/product/${item.slug}`;

    clone.querySelector('.list-description').innerText = item.short_description || item.description || '';

    const currentPrice = item.discount_price !== null ? item.discount_price : item.price;
    clone.querySelector('.price-current').innerText = formatPrice(currentPrice);

    const originalPrice = clone.querySelector('.price-original');
    if (item.discount_price && originalPrice) {
      originalPrice.innerText = formatPrice(item.price);
      originalPrice.style.display = 'inline-block';
    }

    const ratingBox = clone.querySelector('.rating-stars');
    const ratingCount = clone.querySelector('.rating-count');
    if (ratingBox) ratingBox.innerHTML = this.getStarsHtml(5);
    if (ratingCount) ratingCount.innerText = '(1)';

    clone.querySelectorAll('[data-product-id]').forEach(elem => {
      elem.setAttribute('data-product-id', item.id.toString());
    });

    if (item.stock_quantity <= 0) {
      const buyBtn = clone.querySelector('.add-to-cart-btn');
      if (buyBtn) {
        buyBtn.innerText = 'Out of Stock';
        buyBtn.disabled = true;
      }
    }
  }

  getStarsHtml(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      } else {
        stars += `<svg class="empty" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      }
    }
    return stars;
  }

  bindCatalogEvents(grid) {
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
          ui.toast('Added item to cart successfully!', 'success');
          setTimeout(() => {
            btn.disabled = false;
            btn.innerText = 'Add';
          }, 1500);
        } catch (err) {
          console.error(err);
          btn.disabled = false;
          btn.innerText = 'Add';
          ui.toast('Failed adding to cart. Please sign in.', 'error');
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
          ui.toast('Wishlist status updated successfully!', 'success');
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
        ui.toast('Quick View detail sheet is loading...', 'info');
      });
    });

    grid.querySelectorAll('.compare-btn, .list-compare-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        ui.toast('Product added to comparison drawer.', 'info');
      });
    });
  }

  renderEmptyState() {
    const grid = document.getElementById(this.gridContainer);
    const emptyState = document.getElementById('catalog-empty-state');
    const paginationContainer = document.getElementById('catalog-pagination');
    const countText = document.getElementById('toolbar-product-count');

    if (countText) countText.innerText = '0 items found';
    if (grid) grid.style.display = 'none';
    if (paginationContainer) paginationContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
  }
}

// Auto-boot context if on all products page
document.addEventListener('DOMContentLoaded', () => {
  if (window.APP_CONFIG && window.APP_CONFIG.currentPage === 'products') {
    const controller = new CatalogController();
    controller.init();
  }
});
