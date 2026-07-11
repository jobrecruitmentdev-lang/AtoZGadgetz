/**
 * Mini-Cart Module
 * 
 * Controls the slide-in mini-cart panel triggered from the navbar cart icon.
 * Listens to cart events dispatched by cart.js and re-renders the panel.
 * Backend endpoint: GET /api/cart
 */

import { cart }        from './cart.js';
import { formatPrice } from '../helpers/helpers.js';
import { ui }          from '../components/ui.js';

let _isOpen = false;

export function initMiniCart() {
  const trigger  = document.getElementById('nav-cart-btn');
  const overlay  = document.getElementById('mini-cart-overlay');
  const drawer   = document.getElementById('mini-cart-drawer');
  const closeBtn = document.getElementById('mini-cart-close-btn');

  if (!trigger || !overlay || !drawer) return;

  // Open drawer
  trigger.addEventListener('click', async () => {
    openMiniCart(overlay, drawer);
    await refreshMiniCart();
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMiniCart(overlay, drawer);
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeMiniCart(overlay, drawer));
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && _isOpen) closeMiniCart(overlay, drawer);
  });

  // Re-render whenever the cart is mutated elsewhere
  document.addEventListener('cart:updated', (state) => {
    updateCartBadge();
    if (_isOpen) refreshMiniCart();
  });

  document.addEventListener('cart:item:added',   updateCartBadge);
  document.addEventListener('cart:item:updated', updateCartBadge);
  document.addEventListener('cart:item:removed', updateCartBadge);

  // Badge will be updated when cart:updated fires from shared state init
}

function openMiniCart(overlay, drawer) {
  _isOpen = true;
  overlay.classList.add('mini-cart-open');
  drawer.classList.add('mini-cart-drawer-open');
  document.body.style.overflow = 'hidden';
}

function closeMiniCart(overlay, drawer) {
  _isOpen = false;
  overlay.classList.remove('mini-cart-open');
  drawer.classList.remove('mini-cart-drawer-open');
  document.body.style.overflow = '';
}

async function refreshMiniCart() {
  const bodyEl    = document.getElementById('mini-cart-items');
  const emptyEl   = document.getElementById('mini-cart-empty');
  const footerEl  = document.getElementById('mini-cart-footer');
  const totalEl   = document.getElementById('mini-cart-total-price');

  if (!bodyEl) return;

  bodyEl.innerHTML = `<div class="mini-cart-loader">
    <span class="spinner" style="width:24px;height:24px;border-width:2px;"></span>
  </div>`;

  try {
    const state = await cart.get();
    const items  = state?.items || [];

    if (items.length === 0) {
      bodyEl.innerHTML = '';
      if (emptyEl)  emptyEl.style.display  = 'block';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyEl)  emptyEl.style.display  = 'none';
    if (footerEl) footerEl.style.display = 'block';
    if (totalEl)  totalEl.innerText = formatPrice(state.total ?? state.subtotal ?? 0);

    bodyEl.innerHTML = items.map(item => {
      const product  = item.product || {};
      const imgPath  = product.images?.[0]?.image_path ?? 'public/assets/images/placeholder.png';
      const price    = item.price ?? (product.discount_price ?? product.price ?? 0);

      return `
        <div class="mini-cart-item" id="mc-item-${item.id}">
          <div class="mc-item-img-wrap">
            <img src="/${imgPath}" alt="${product.name ?? 'Product'}" class="mc-item-img" loading="lazy">
          </div>
          <div class="mc-item-info">
            <a href="/product/${product.slug}" class="mc-item-name">${product.name ?? 'Product'}</a>
            <span class="mc-item-price">${formatPrice(price)}</span>
            <div class="mc-item-qty-row">
              <button type="button" class="mc-qty-btn mc-qty-minus" data-id="${item.id}" data-qty="${item.quantity}" aria-label="Decrease">−</button>
              <span class="mc-qty-val">${item.quantity}</span>
              <button type="button" class="mc-qty-btn mc-qty-plus"  data-id="${item.id}" data-qty="${item.quantity}" aria-label="Increase">+</button>
              <button type="button" class="mc-remove-btn" data-id="${item.id}" aria-label="Remove item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    bindMiniCartItemActions();
  } catch (err) {
    bodyEl.innerHTML = '<p class="text-sm text-muted" style="text-align:center;padding:var(--spacing-6);">Could not load cart.</p>';
    console.error('Mini cart error:', err);
  }
}

function bindMiniCartItemActions() {
  document.querySelectorAll('.mc-qty-minus').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id  = btn.dataset.id;
      const qty = parseInt(btn.dataset.qty, 10);
      if (qty <= 1) return;
      try {
        await cart.update(id, qty - 1);
        await refreshMiniCart();
      } catch (err) {
        ui.showToast('Error', err.message || 'Failed to update qty.', 'error');
      }
    });
  });

  document.querySelectorAll('.mc-qty-plus').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id  = btn.dataset.id;
      const qty = parseInt(btn.dataset.qty, 10);
      try {
        await cart.update(id, qty + 1);
        await refreshMiniCart();
      } catch (err) {
        ui.showToast('Error', err.message || 'Failed to update qty.', 'error');
      }
    });
  });

  document.querySelectorAll('.mc-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        await cart.remove(id);
        await refreshMiniCart();
        updateCartBadge();
        ui.showToast('Removed', 'Item removed from cart.', 'success');
      } catch (err) {
        ui.showToast('Error', err.message || 'Failed to remove item.', 'error');
      }
    });
  });
}

function updateCartBadge() {
  const badge = document.getElementById('nav-cart-badge');
  if (!badge) return;
  const count = cart.state?.items?.length ?? 0;
  badge.innerText = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}
