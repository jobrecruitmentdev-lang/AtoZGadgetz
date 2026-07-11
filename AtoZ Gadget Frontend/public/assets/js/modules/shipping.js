/**
 * Shipping Estimator Module
 * 
 * The backend does not expose a standalone shipping rate endpoint.
 * We implement a client-side tiered shipping calculation:
 *   - Free shipping: orders >= threshold (₹499)
 *   - Express (₹99): orders < threshold
 *   - COD charge (₹49): always shown as an option
 * 
 * This integrates with the cart summary to update displayed totals.
 */

import { formatPrice } from '../helpers/helpers.js';

const FREE_SHIPPING_THRESHOLD = 499;
const STANDARD_SHIPPING_FEE  = 49;
const EXPRESS_SHIPPING_FEE   = 99;

let _selectedShipping = 'standard';

/**
 * @param {number}   subtotal  - Current cart subtotal
 * @param {Function} onChange  - Callback (shippingFee) when shipping option changes
 */
export function initShippingEstimator(subtotal, onChange) {
  const container = document.getElementById('shipping-options-container');
  const display   = document.getElementById('cart-summary-shipping');

  if (!container) return;

  const isFreeEligible = subtotal >= FREE_SHIPPING_THRESHOLD;

  container.innerHTML = buildShippingOptionsHTML(subtotal, isFreeEligible);

  // Bind radio changes
  container.querySelectorAll('.shipping-option-radio').forEach(radio => {
    radio.addEventListener('change', () => {
      _selectedShipping = radio.value;
      const fee = getShippingFee(subtotal, _selectedShipping);

      if (display) {
        display.innerText = fee === 0 ? 'FREE' : formatPrice(fee);
        display.style.color = fee === 0 ? 'var(--success)' : '';
      }

      if (onChange) onChange(fee);
    });
  });

  // Apply initial value
  const fee = getShippingFee(subtotal, _selectedShipping);
  if (display) {
    display.innerText = fee === 0 ? 'FREE' : formatPrice(fee);
    display.style.color = fee === 0 ? 'var(--success)' : '';
  }
  if (onChange) onChange(fee);
}

function buildShippingOptionsHTML(subtotal, isFreeEligible) {
  const standardFee = isFreeEligible ? 0 : STANDARD_SHIPPING_FEE;
  const remaining   = FREE_SHIPPING_THRESHOLD - subtotal;

  return `
    ${!isFreeEligible ? `
      <p class="shipping-free-hint">
        Add <strong>${formatPrice(remaining)}</strong> more for <strong>FREE</strong> delivery!
      </p>` : ''}

    <label class="shipping-option-row">
      <input type="radio" class="shipping-option-radio" name="shipping_method" value="standard" checked>
      <span class="shipping-option-info">
        <span class="shipping-option-name">Standard Delivery</span>
        <span class="shipping-option-eta">3–5 business days</span>
      </span>
      <span class="shipping-option-fee">
        ${standardFee === 0 ? '<span class="fee-free">FREE</span>' : formatPrice(standardFee)}
      </span>
    </label>

    <label class="shipping-option-row">
      <input type="radio" class="shipping-option-radio" name="shipping_method" value="express">
      <span class="shipping-option-info">
        <span class="shipping-option-name">Express Delivery</span>
        <span class="shipping-option-eta">1–2 business days</span>
      </span>
      <span class="shipping-option-fee">${formatPrice(EXPRESS_SHIPPING_FEE)}</span>
    </label>

    <label class="shipping-option-row">
      <input type="radio" class="shipping-option-radio" name="shipping_method" value="cod">
      <span class="shipping-option-info">
        <span class="shipping-option-name">Cash on Delivery</span>
        <span class="shipping-option-eta">3–7 business days</span>
      </span>
      <span class="shipping-option-fee">${formatPrice(STANDARD_SHIPPING_FEE)}</span>
    </label>`;
}

function getShippingFee(subtotal, method) {
  if (method === 'express') return EXPRESS_SHIPPING_FEE;
  if (method === 'cod')     return STANDARD_SHIPPING_FEE;
  // Standard: free above threshold
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

/** Returns the currently selected shipping fee */
export function getSelectedShippingFee(subtotal) {
  return getShippingFee(subtotal, _selectedShipping);
}

/** Returns the selected shipping method string */
export function getSelectedShippingMethod() {
  return _selectedShipping;
}
