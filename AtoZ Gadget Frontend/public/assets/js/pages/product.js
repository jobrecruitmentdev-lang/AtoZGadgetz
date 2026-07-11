/**
 * Product Detail Page Controller – Phase 4 Integration
 * 
 * Integrates: gallery.js, variants.js, reviews.js, pincode.js,
 *             share.js, sticky-buy.js, quantity.js
 */

import { api }            from '../api/api.js';
import { formatPrice }    from '../helpers/helpers.js';
import { cart }           from '../modules/cart.js';
import { wishlist }       from '../modules/wishlist.js';
import { ui }             from '../components/ui.js';
import { initGallery }    from '../modules/gallery.js';
import { initVariants }   from '../modules/variants.js';
import { initPincodeChecker } from '../modules/pincode.js';
import { initShareButtons }   from '../modules/share.js';
import { initStickyBuyBar }   from '../modules/sticky-buy.js';
import { initQuantityStepper } from '../modules/quantity.js';

// ── Page State ─────────────────────────────────────────────────────────────────
let activeProductId  = null;
let activeVariantId  = null;
let _qtyStepper      = null;
let _productAvailable = false;

document.addEventListener('DOMContentLoaded', () => {
  initProductDetails();
});

// ── Initialization ─────────────────────────────────────────────────────────────

async function initProductDetails() {
  const path      = window.location.pathname;
  const slugMatch = path.match(/\/product\/([a-zA-Z0-9_-]+)/);
  if (!slugMatch) return;

  const slug = slugMatch[1];

  try {
    const res = await api.request(`/api/store/products/${slug}`);

    if (res.success && res.data) {
      const { product, related_products } = res.data;
      activeProductId = product.id;

      renderProductMeta(product);
      renderProductInfo(product);
      renderGallery(product);
      renderVariants(product);
      renderSpecs(product.attributes);
      renderRelated(related_products);
      renderBreadcrumb(product);
      setupQuantity();
      setupActionHandlers(product);
      setupShareButtons(product);
      setupStickyBar();
      setupPincodeChecker();
    }
  } catch (err) {
    console.error('Error loading product details:', err);
    ui.showToast('Error', 'Product details could not be loaded.', 'error');
  } finally {
    // Remove all loading skeletons
    document.querySelectorAll('.pdp-skeleton').forEach(el => el.remove());
  }
}

// ── Product Meta (SEO) ─────────────────────────────────────────────────────────

function renderProductMeta(product) {
  document.title = `${product.name} – AtoZ Gadget`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = product.short_description || `Buy ${product.name} at best price. Explore specs, features, and reviews.`;
}

// ── Info Panel ─────────────────────────────────────────────────────────────────

function renderProductInfo(product) {
  _productAvailable = (product.stock_quantity ?? 0) > 0;

  setTextIfExists('#pdp-brand-tag', product.brand?.name || 'Gadgets');
  setTextIfExists('.pdp-title', product.name);
  setTextIfExists('.pdp-short-desc', product.short_description || '');
  setTextIfExists('#pdp-sku', `SKU: ${product.sku || 'N/A'}`);

  // Price
  const hasDiscount   = product.discount_price !== null;
  const currentPrice  = hasDiscount ? product.discount_price : product.price;

  setTextIfExists('#pdp-price-current', formatPrice(currentPrice));
  const originalEl = document.getElementById('pdp-price-original');
  if (originalEl) {
    originalEl.innerText   = hasDiscount ? formatPrice(product.price) : '';
    originalEl.style.display = hasDiscount ? 'inline' : 'none';
  }

  if (hasDiscount) {
    const pct = Math.round(((product.price - product.discount_price) / product.price) * 100);
    setTextIfExists('#pdp-price-discount', `${pct}% OFF`);
  }

  // Availability badge
  const availBadge = document.getElementById('pdp-availability-badge');
  if (availBadge) {
    availBadge.innerText   = _productAvailable
      ? `In Stock (${product.stock_quantity} units)`
      : 'Out of Stock';
    availBadge.style.color = _productAvailable ? 'var(--success)' : 'var(--danger)';
  }
}

// ── Gallery ────────────────────────────────────────────────────────────────────

function renderGallery(product) {
  const galleryWrapper = document.getElementById('pdp-gallery-wrapper');
  if (!galleryWrapper) {
    // Fallback: build simple gallery inline
    buildSimpleGallery(product);
    return;
  }
  initGallery(product.images, product.name);
}

function buildSimpleGallery(product) {
  const mainBox   = document.getElementById('product-main-gallery');
  const thumbsBox = document.getElementById('product-thumbs-gallery');
  if (!mainBox) return;

  const defaultImg = '/public/assets/images/placeholder.png';
  const mainPath   = product.images?.[0]?.image_path
    ? '/' + product.images[0].image_path
    : defaultImg;

  mainBox.innerHTML = `
    <div class="gallery-main-window">
      <img id="pdp-main-img" class="gallery-main-img" src="${mainPath}" alt="${product.name}">
    </div>`;

  if (thumbsBox && product.images?.length > 0) {
    thumbsBox.innerHTML = `
      <div class="gallery-thumbs-row">
        ${product.images.map((img, idx) => `
          <button type="button" class="gallery-thumb-item ${idx === 0 ? 'active' : ''}"
            data-src="/${img.image_path}" aria-label="View image ${idx + 1}">
            <img src="/${img.image_path}" alt="Thumbnail ${idx + 1}">
          </button>
        `).join('')}
      </div>`;

    thumbsBox.querySelectorAll('.gallery-thumb-item').forEach(btn => {
      btn.addEventListener('click', () => {
        thumbsBox.querySelectorAll('.gallery-thumb-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mainImg = document.getElementById('pdp-main-img');
        if (mainImg) mainImg.src = btn.dataset.src;
      });
    });
  }
}

// ── Variants ───────────────────────────────────────────────────────────────────

function renderVariants(product) {
  initVariants(product, (selectedVariant) => {
    activeVariantId      = selectedVariant?.id ?? null;
    _productAvailable    = (selectedVariant?.stock_quantity ?? 0) > 0;
  });
}

// ── Specs Table ────────────────────────────────────────────────────────────────

function renderSpecs(attributes) {
  const container = document.getElementById('product-specs-table-container');
  if (!container) return;

  if (!attributes || attributes.length === 0) {
    container.innerHTML = '<p class="text-sm text-muted">No specifications listed for this product.</p>';
    return;
  }

  container.innerHTML = `
    <table class="specs-table">
      ${attributes.map(attr => `
        <tr class="specs-row">
          <td class="specs-name">${attr.attribute?.name || 'Attribute'}</td>
          <td class="specs-val">${attr.value}</td>
        </tr>
      `).join('')}
    </table>`;
}

// ── Related Products ───────────────────────────────────────────────────────────

function renderRelated(products) {
  const grid = document.getElementById('product-related-grid');
  if (!grid || !products?.length) return;

  grid.innerHTML = products.map(p => {
    const img   = p.images?.[0]?.image_path ?? 'public/assets/images/placeholder.png';
    const price = p.discount_price !== null ? p.discount_price : p.price;

    return `
      <div class="span-lg-3 span-md-4 span-2">
        <div class="product-card">
          <div class="product-card-media">
            <img class="product-card-img" src="/${img}" alt="${p.name}" loading="lazy">
          </div>
          <div class="product-card-body">
            <span class="product-card-meta">${p.brand?.name ?? 'Gadgets'}</span>
            <a href="/product/${p.slug}" class="product-card-title">${p.name}</a>
            <div class="product-card-footer">
              <span class="price-current">${formatPrice(price)}</span>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────────

function renderBreadcrumb(product) {
  const nameEl = document.getElementById('breadcrumb-product-name');
  if (nameEl) nameEl.innerText = product.name;

  const catEl  = document.getElementById('breadcrumb-category-name');
  if (catEl && product.category) {
    catEl.innerText = product.category.name;
    catEl.href      = `/products?category_id=${product.category.id}`;
    catEl.style.display = 'inline';
  }
}

// ── Quantity Stepper ───────────────────────────────────────────────────────────

function setupQuantity() {
  _qtyStepper = initQuantityStepper('pdp-qty-stepper', {
    initial:  1,
    min:      1,
    max:      10,
    onChange: null
  });

  // Fallback for simpler inline buttons (product.php may use these)
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn  = document.getElementById('qty-plus');
  const input    = document.getElementById('qty-input');

  if (minusBtn && plusBtn && input) {
    minusBtn.addEventListener('click', () => {
      const v = parseInt(input.value, 10) || 1;
      if (v > 1) input.value = v - 1;
    });
    plusBtn.addEventListener('click', () => {
      const v = parseInt(input.value, 10) || 1;
      input.value = v + 1;
    });
  }
}

function getQuantity() {
  if (_qtyStepper) return _qtyStepper.value;
  return parseInt(document.getElementById('qty-input')?.value, 10) || 1;
}

// ── Action Handlers (Add to Cart / Wishlist / Buy Now) ────────────────────────

function setupActionHandlers(product) {
  const addCartBtn = document.getElementById('pdp-add-cart-btn') || document.getElementById('add-to-cart-btn');
  const buyNowBtn  = document.getElementById('pdp-buy-now-btn');
  const addWishBtn = document.getElementById('pdp-add-wishlist-btn') || document.getElementById('add-to-wishlist-btn');

  const handleAddToCart = async () => {
    if (!activeProductId) return;
    const qty = getQuantity();
    try {
      addCartBtn && (addCartBtn.disabled = true);
      await cart.add(activeProductId, qty, activeVariantId);
      ui.showToast('Added to Cart', `${product.name} added to your cart.`, 'success');
    } catch (err) {
      ui.showToast('Error', err.message || 'Could not add item to cart.', 'error');
    } finally {
      addCartBtn && (addCartBtn.disabled = false);
    }
  };

  const handleBuyNow = async () => {
    if (!activeProductId) return;
    const qty = getQuantity();
    try {
      buyNowBtn && (buyNowBtn.disabled = true);
      await cart.add(activeProductId, qty, activeVariantId);
      window.location.href = '/cart';
    } catch (err) {
      ui.showToast('Error', err.message || 'Could not process. Try again.', 'error');
      buyNowBtn && (buyNowBtn.disabled = false);
    }
  };

  if (addCartBtn) addCartBtn.addEventListener('click', handleAddToCart);
  if (buyNowBtn)  buyNowBtn.addEventListener('click', handleBuyNow);

  if (addWishBtn) {
    addWishBtn.addEventListener('click', async () => {
      if (!activeProductId) return;
      try {
        addWishBtn.disabled = true;
        await wishlist.add(activeProductId);
        ui.showToast('Saved', 'Added to your wishlist.', 'success');
        addWishBtn.classList.add('wishlist-active');
      } catch (err) {
        ui.showToast('Error', err.message || 'Could not save to wishlist.', 'error');
      } finally {
        addWishBtn.disabled = false;
      }
    });
  }

  // Sticky bar also needs these handlers
  return { handleAddToCart, handleBuyNow };
}

// ── Share Buttons ──────────────────────────────────────────────────────────────

function setupShareButtons(product) {
  initShareButtons(product.name, window.location.href);
}

// ── Sticky Buy Bar ─────────────────────────────────────────────────────────────

function setupStickyBar() {
  const addCartBtn = document.getElementById('pdp-add-cart-btn') || document.getElementById('add-to-cart-btn');
  const buyNowBtn  = document.getElementById('pdp-buy-now-btn');

  initStickyBuyBar(
    addCartBtn ? () => addCartBtn.click() : null,
    buyNowBtn  ? () => buyNowBtn.click()  : null
  );
}

// ── Pincode / Delivery Check ───────────────────────────────────────────────────

function setupPincodeChecker() {
  initPincodeChecker(_productAvailable);
}

// ── Utility ───────────────────────────────────────────────────────────────────

function setTextIfExists(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.innerText = text;
}
