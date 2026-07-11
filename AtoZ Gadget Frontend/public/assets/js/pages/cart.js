/**
 * Cart Page Controller – Phase 4/5 Integration
 * 
 * Integrates: cart.js, coupon.js, shipping.js, save-for-later.js
 */

import { cart }                              from '../modules/cart.js';
import { formatPrice }                       from '../helpers/helpers.js';
import { ui }                                from '../components/ui.js';
import { initCoupon, getActiveCoupon }       from '../modules/coupon.js';
import { initShippingEstimator, getSelectedShippingFee } from '../modules/shipping.js';
import { bindSaveForLaterButtons }           from '../modules/save-for-later.js';

// ── State ──────────────────────────────────────────────────────────────────────
let _cartState    = null;
let _discountAmt  = 0;
let _shippingFee  = 0;

document.addEventListener('DOMContentLoaded', () => {
  initCartPage();
});

// ── Initialization ─────────────────────────────────────────────────────────────

async function initCartPage() {
  try {
    _cartState = await cart.get();
    renderCartPage(_cartState);
  } catch (err) {
    console.error('Failed to load cart page:', err);
    showEmptyCart();
  } finally {
    const loader = document.getElementById('cart-loading-container');
    if (loader) loader.style.display = 'none';
  }
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderCartPage(state) {
  if (!state || !state.items || state.items.length === 0) {
    showEmptyCart();
    return;
  }

  const content    = document.getElementById('cart-content-layout');
  const emptyState = document.getElementById('cart-empty-state');

  if (emptyState) emptyState.style.display = 'none';
  if (content)    content.style.display    = 'grid';

  renderCartItems(state.items);
  updateSummaryTotals(state.subtotal);

  // Init coupon — when applied, update totals
  initCoupon((discountAmt) => {
    _discountAmt = discountAmt;
    updateSummaryTotals(_cartState?.subtotal ?? 0);
  });

  // Init shipping estimator — when changed, update totals
  initShippingEstimator(state.subtotal, (fee) => {
    _shippingFee = fee;
    updateSummaryTotals(_cartState?.subtotal ?? 0);
  });
}

function renderCartItems(items) {
  const itemsContainer = document.getElementById('cart-items-list');
  if (!itemsContainer) return;

  itemsContainer.innerHTML = items.map(item => {
    const product = item.product || {};
    const imgPath = product.images?.[0]?.image_path ?? 'public/assets/images/placeholder.png';
    const price   = item.price ?? (product.discount_price ?? product.price ?? 0);

    return `
      <div class="cart-item-card" id="cart-item-card-${item.id}">
        <div class="cart-item-img-wrap">
          <img src="/${imgPath}" alt="${product.name ?? 'Product'}" class="cart-item-img" loading="lazy">
        </div>
        <div class="cart-item-body">
          <span class="cart-item-brand">${product.brand?.name ?? ''}</span>
          <a href="/product/${product.slug}" class="cart-item-name">${product.name ?? 'Product'}</a>
          <p class="cart-item-sku">SKU: ${product.sku ?? 'N/A'}</p>
          <span class="cart-item-price">${formatPrice(price)}</span>

          <div class="cart-item-actions-row">
            <!-- Quantity Stepper -->
            <div class="qty-stepper" data-item-id="${item.id}" data-qty="${item.quantity}" id="stepper-${item.id}">
              <button type="button" class="qty-stepper-btn item-qty-minus" data-action="qty-minus" data-item-id="${item.id}" data-qty="${item.quantity}" aria-label="Decrease quantity">−</button>
              <span class="qty-stepper-display" data-qty-display>${item.quantity}</span>
              <button type="button" class="qty-stepper-btn item-qty-plus" data-action="qty-plus" data-item-id="${item.id}" data-qty="${item.quantity}" aria-label="Increase quantity">+</button>
            </div>

            <!-- Save for Later -->
            <button type="button" class="save-for-later-btn" data-item-id="${item.id}" data-product-id="${product.id}">
              Save for Later
            </button>

            <!-- Remove -->
            <button type="button" class="item-remove-btn" data-item-id="${item.id}" aria-label="Remove ${product.name ?? 'item'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  bindItemActions();
  bindSaveForLaterButtons(refreshCart);
}

// ── Summary Totals ─────────────────────────────────────────────────────────────

function updateSummaryTotals(subtotal) {
  const subtotalEl  = document.getElementById('cart-summary-subtotal');
  const discountEl  = document.getElementById('cart-summary-discount');
  const shippingEl  = document.getElementById('cart-summary-shipping');
  const totalEl     = document.getElementById('cart-summary-total');
  const savingsEl   = document.getElementById('cart-summary-savings-amount');
  const savingsRow  = document.getElementById('cart-summary-savings-row');

  const total = Math.max(0, subtotal - _discountAmt + _shippingFee);

  if (subtotalEl) subtotalEl.innerText = formatPrice(subtotal);

  if (discountEl) {
    discountEl.innerText = _discountAmt > 0 ? `–${formatPrice(_discountAmt)}` : '—';
  }

  if (shippingEl) {
    shippingEl.innerText = _shippingFee === 0 ? 'FREE' : formatPrice(_shippingFee);
    if (shippingEl.style !== undefined) {
      shippingEl.style.color = _shippingFee === 0 ? 'var(--success)' : '';
    }
  }

  if (totalEl) totalEl.innerText = formatPrice(total);

  const totalSavings = _discountAmt + (_shippingFee === 0 ? 0 : 0);
  if (savingsRow) savingsRow.style.display = totalSavings > 0 ? 'flex' : 'none';
  if (savingsEl && totalSavings > 0) savingsEl.innerText = formatPrice(totalSavings);
}

// ── Item Actions ───────────────────────────────────────────────────────────────

function bindItemActions() {
  // Quantity Minus
  document.querySelectorAll('.item-qty-minus').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.dataset.itemId;
      const qty    = parseInt(btn.dataset.qty, 10);
      if (qty <= 1) return;
      await mutateQty(itemId, qty - 1);
    });
  });

  // Quantity Plus
  document.querySelectorAll('.item-qty-plus').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.dataset.itemId;
      const qty    = parseInt(btn.dataset.qty, 10);
      await mutateQty(itemId, qty + 1);
    });
  });

  // Remove
  document.querySelectorAll('.item-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.dataset.itemId;
      try {
        ui.showLoader();
        await cart.remove(itemId);
        await refreshCart();
        ui.showToast('Removed', 'Item removed from your cart.', 'success');
      } catch (err) {
        ui.showToast('Error', err.message || 'Could not remove item.', 'error');
      } finally {
        ui.hideLoader();
      }
    });
  });
}

async function mutateQty(itemId, newQty) {
  try {
    ui.showLoader();
    await cart.update(itemId, newQty);
    await refreshCart();
  } catch (err) {
    ui.showToast('Error', err.message || 'Could not update quantity.', 'error');
  } finally {
    ui.hideLoader();
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function refreshCart() {
  _cartState = await cart.get();
  renderCartPage(_cartState);
}

function showEmptyCart() {
  const content    = document.getElementById('cart-content-layout');
  const emptyState = document.getElementById('cart-empty-state');
  if (content)    content.style.display    = 'none';
  if (emptyState) emptyState.style.display = 'block';
}
