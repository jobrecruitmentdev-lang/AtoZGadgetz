/**
 * Wishlist Page controller logic (Phase 1 JS Architecture)
 */

import { wishlist } from '../modules/wishlist.js';
import { formatPrice } from '../helpers/helpers.js';
import { ui } from '../components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  initWishlistPage();
});

async function initWishlistPage() {
  try {
    const items = await wishlist.get();
    renderWishlistPage(items);
  } catch (err) {
    console.error('Failed to load wishlist:', err);
    showEmptyWishlist();
  } finally {
    const loader = document.getElementById('wishlist-loading-container');
    if (loader) loader.style.display = 'none';
  }
}

function renderWishlistPage(items) {
  const grid = document.getElementById('wishlist-results-grid');
  const emptyState = document.getElementById('wishlist-empty-state');

  if (!items || items.length === 0) {
    showEmptyWishlist();
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (grid) {
    grid.style.display = 'grid';
    grid.innerHTML = items.map(item => {
      const product = item.product || {};
      const imgPath = product.images && product.images[0] ? product.images[0].image_path : 'public/assets/images/placeholder.png';
      const currentPrice = product.discount_price !== null ? product.discount_price : product.price;

      return `
        <div class="span-lg-3 span-md-4 span-2" id="wishlist-item-card-${product.id}">
          <div class="product-card">
            <div class="product-card-media">
              <img class="product-card-img" src="/${imgPath}" alt="${product.name}" loading="lazy">
              <div class="product-card-wishlist">
                <button type="button" class="wishlist-btn active remove-wish-action" data-product-id="${product.id}" aria-label="Remove from wishlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="color: var(--danger);"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
            </div>
            <div class="product-card-body">
              <span class="product-card-meta">${product.brand?.name || 'Gadgets'}</span>
              <a href="/product/${product.slug}" class="product-card-title">${product.name}</a>
              <div class="product-card-footer">
                <span class="price-current">${formatPrice(currentPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindWishlistActions();
  }
}

function showEmptyWishlist() {
  const grid = document.getElementById('wishlist-results-grid');
  const emptyState = document.getElementById('wishlist-empty-state');
  if (grid) grid.style.display = 'none';
  if (emptyState) emptyState.style.display = 'block';
}

function bindWishlistActions() {
  document.querySelectorAll('.remove-wish-action').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.productId;
      try {
        ui.showLoader();
        await wishlist.remove(productId);
        const card = document.getElementById(`wishlist-item-card-${productId}`);
        if (card) card.remove();
        
        const items = await wishlist.get();
        if (items.length === 0) {
          showEmptyWishlist();
        }
        ui.showToast('Removed', 'Product removed from your wishlist.', 'success');
      } catch (err) {
        ui.showToast('Error', err.message || 'Unable to remove wishlist item.', 'error');
      } finally {
        ui.hideLoader();
      }
    });
  });
}
