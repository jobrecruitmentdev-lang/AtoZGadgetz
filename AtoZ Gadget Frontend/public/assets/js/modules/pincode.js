/**
 * Pincode / Delivery Check Module
 * 
 * The backend does not expose a separate /api/pincode endpoint.
 * We perform a simple client-side availability check:
 *   - Indian pincodes are 6-digit numbers starting with 1–9.
 *   - We derive an estimated delivery window from the pincode prefix.
 *   - If the product is in stock (availability badge says so), we show delivery window.
 *   - Otherwise we show unavailable.
 */

export function initPincodeChecker(productAvailable = true) {
  const form      = document.getElementById('delivery-check-form');
  const input     = document.getElementById('delivery-pincode-input');
  const btn       = document.getElementById('delivery-check-btn');
  const result    = document.getElementById('delivery-check-result');

  if (!form || !input || !btn || !result) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkPincode(input.value.trim(), productAvailable, result);
  });

  btn.addEventListener('click', () => {
    checkPincode(input.value.trim(), productAvailable, result);
  });
}

function checkPincode(pincode, productAvailable, resultEl) {
  resultEl.innerHTML = '';

  if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
    resultEl.innerHTML = `
      <span class="delivery-result-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Please enter a valid 6-digit pincode.
      </span>`;
    return;
  }

  if (!productAvailable) {
    resultEl.innerHTML = `
      <span class="delivery-result-unavail">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        This product is currently out of stock. Check back later.
      </span>`;
    return;
  }

  // Derive delivery window based on pincode zone prefix
  const prefix   = parseInt(pincode.substring(0, 2), 10);
  let deliveryDays;

  if (prefix >= 11 && prefix <= 19) {
    deliveryDays = '1–2 business days'; // Delhi / NCR
  } else if ((prefix >= 40 && prefix <= 44) || (prefix >= 60 && prefix <= 64)) {
    deliveryDays = '2–3 business days'; // Mumbai / Chennai
  } else if (prefix >= 70 && prefix <= 74) {
    deliveryDays = '3–4 business days'; // Kolkata
  } else if (prefix >= 80 && prefix <= 84) {
    deliveryDays = '4–6 business days'; // North-East / remote
  } else {
    deliveryDays = '2–4 business days'; // Standard
  }

  const isFastDelivery = deliveryDays.startsWith('1');

  resultEl.innerHTML = `
    <span class="delivery-result-success">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      Delivery to <strong>${pincode}</strong>: <strong>${deliveryDays}</strong>
      ${isFastDelivery ? '<span class="badge-fast-delivery">Express</span>' : ''}
    </span>
    <span class="delivery-result-note">Free shipping on orders above ₹499.</span>`;
}
