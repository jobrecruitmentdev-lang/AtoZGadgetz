/**
 * Coupon Module
 * 
 * Applies a coupon code to the current cart.
 * Backend endpoint: POST /api/coupon/apply  { code: string }
 * Response includes discount_amount which is applied to the total.
 */

import { api }         from '../api/api.js';
import { formatPrice } from '../helpers/helpers.js';

let _activeCoupon = null;

/**
 * Initialize coupon box in the cart page.
 * @param {Function} onDiscount - Callback (discountAmount) called when coupon is applied.
 */
export function initCoupon(onDiscount) {
  const form    = document.getElementById('coupon-form');
  const input   = document.getElementById('coupon-code-input');
  const btn     = document.getElementById('coupon-apply-btn');
  const result  = document.getElementById('coupon-result');
  const removeBtn = document.getElementById('coupon-remove-btn');

  if (!form || !input || !btn || !result) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    applyCode(input.value.trim(), result, btn, onDiscount);
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeCoupon(input, result, removeBtn, onDiscount);
    });
  }
}

async function applyCode(code, resultEl, btn, onDiscount) {
  if (!code) {
    showCouponError(resultEl, 'Please enter a coupon code.');
    return;
  }

  btn.disabled = true;
  btn.innerText = 'Applying…';
  resultEl.innerHTML = '';

  try {
    const res = await api.request('/api/coupon/apply', {
      method: 'POST',
      body: { code }
    });

    if (res.success && res.data) {
      _activeCoupon = res.data;
      const { discount_amount, discount_type, discount_value } = res.data;
      const label = discount_type === 'percentage'
        ? `${discount_value}% OFF`
        : formatPrice(discount_value);

      resultEl.innerHTML = `
        <span class="coupon-success-msg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Coupon <strong>${code}</strong> applied! You save <strong>${formatPrice(discount_amount)}</strong> (${label}).
        </span>`;

      btn.innerText = '✓ Applied';
      btn.style.background = 'var(--success)';

      const removeBtn = document.getElementById('coupon-remove-btn');
      if (removeBtn) removeBtn.style.display = 'inline-flex';

      if (onDiscount) onDiscount(discount_amount);
    } else {
      showCouponError(resultEl, res.message || 'Invalid coupon code.');
      btn.disabled = false;
      btn.innerText = 'Apply';
    }
  } catch (err) {
    const message = err?.response?.detail ?? err.message ?? 'Coupon could not be applied.';
    showCouponError(resultEl, message);
    btn.disabled = false;
    btn.innerText = 'Apply';
  }
}

function removeCoupon(input, resultEl, removeBtn, onDiscount) {
  _activeCoupon = null;
  input.value = '';
  resultEl.innerHTML = '';
  removeBtn.style.display = 'none';

  const applyBtn = document.getElementById('coupon-apply-btn');
  if (applyBtn) {
    applyBtn.disabled = false;
    applyBtn.innerText = 'Apply';
    applyBtn.style.background = '';
  }

  if (onDiscount) onDiscount(0);
}

function showCouponError(resultEl, msg) {
  resultEl.innerHTML = `
    <span class="coupon-error-msg">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      ${msg}
    </span>`;
}

/** Returns the currently active coupon data or null */
export function getActiveCoupon() {
  return _activeCoupon;
}
