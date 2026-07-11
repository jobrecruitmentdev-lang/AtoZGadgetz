import { formatPrice } from '../helpers/helpers.js';

/**
 * PDP Variant Selection Handler
 */
export function initVariants(product, onSelect) {
  const wrapper = document.getElementById('pdp-variants-wrapper');
  if (!wrapper) return;

  const variants = product.variants || [];
  if (variants.length === 0) {
    wrapper.innerHTML = '';
    return;
  }

  // 1. Build selectors row
  wrapper.innerHTML = `
    <span class="variant-label">Choose Model Specification</span>
    <div class="variant-options-list">
      ${variants.map((v, idx) => `
        <button class="variant-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
          ${v.name}
        </button>
      `).join('')}
    </div>
  `;

  // Apply default selection
  applySelection(variants[0], onSelect);

  // 2. Bind change listeners
  wrapper.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      wrapper.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const index = Number(btn.getAttribute('data-idx'));
      applySelection(variants[index], onSelect);
    });
  });
}

function applySelection(variant, callback) {
  // Sync Prices
  const priceCurrent = document.getElementById('pdp-price-current');
  const priceOriginal = document.getElementById('pdp-price-original');
  const badgeDiscount = document.getElementById('pdp-price-discount');

  const currentPrice = variant.discount_price !== null ? variant.discount_price : variant.price;
  if (priceCurrent) priceCurrent.innerText = formatPrice(currentPrice);

  if (priceOriginal) {
    if (variant.discount_price !== null) {
      priceOriginal.innerText = formatPrice(variant.price);
      priceOriginal.style.display = 'inline-block';
    } else {
      priceOriginal.style.display = 'none';
    }
  }

  if (badgeDiscount) {
    if (variant.discount_price !== null) {
      const discountPct = Math.round(((variant.price - variant.discount_price) / variant.price) * 100);
      badgeDiscount.innerText = `${discountPct}% OFF`;
      badgeDiscount.style.display = 'inline-block';
    } else {
      badgeDiscount.style.display = 'none';
    }
  }

  // Sync Availability Status
  const availBadge = document.getElementById('pdp-availability-badge');
  const addCart = document.getElementById('pdp-add-cart-btn');
  const buyNow = document.getElementById('pdp-buy-now-btn');

  if (availBadge) {
    if (variant.stock_quantity > 0) {
      availBadge.innerText = `In Stock (${variant.stock_quantity} units left)`;
      availBadge.style.color = 'var(--success)';
      if (addCart) {
        addCart.disabled = false;
        addCart.innerText = 'Add to Cart';
      }
      if (buyNow) {
        buyNow.disabled = false;
        buyNow.innerText = 'Buy Now';
      }
    } else {
      availBadge.innerText = 'Out of Stock';
      availBadge.style.color = 'var(--danger)';
      if (addCart) {
        addCart.disabled = true;
        addCart.innerText = 'Out of Stock';
      }
      if (buyNow) {
        buyNow.disabled = true;
        buyNow.innerText = 'Out of Stock';
      }
    }
  }

  // Update variant image if specified
  if (variant.variant_image) {
    const mainImg = document.getElementById('pdp-main-img');
    const webpSrc = document.getElementById('pdp-main-webp');
    if (mainImg) mainImg.src = '/' + variant.variant_image;
    if (webpSrc) webpSrc.srcset = '/' + variant.variant_image;
  }

  // Propagate selection upward
  if (callback) callback(variant);
}
