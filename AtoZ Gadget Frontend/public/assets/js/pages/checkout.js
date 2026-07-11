/**
 * Checkout Page Controller
 */

import { checkoutApi } from '../modules/checkout.js';
import { account } from '../modules/account.js';
import { auth } from '../modules/auth.js';
import { cart } from '../modules/cart.js';
import { ui } from '../components/ui.js';
import { formatCurrency } from '../helpers/helpers.js';
import { session } from '../modules/session.js';

function initCheckoutPage() {
  const container = document.getElementById('checkout-container');
  const loading = document.getElementById('checkout-loading');
  if (!container || !loading) return;

  // ── State ───────────────────────────────────────────────────────────────
  let currentUser = null;
  let addresses = [];
  let selectedAddressId = null;
  let currentCoupon = null;
  let cartData = null;
  let isProcessing = false;

  // ── Elements ────────────────────────────────────────────────────────────
  const addressList = document.getElementById('checkout-address-list');
  const addressInput = document.getElementById('selected-address-id');
  const itemList = document.getElementById('checkout-item-list');
  const totalsBox = document.getElementById('checkout-totals-box');
  
  const couponInput = document.getElementById('checkout-coupon-input');
  const btnApplyCoupon = document.getElementById('btn-apply-coupon');
  const couponMsg = document.getElementById('checkout-coupon-msg');
  
  const btnPlaceOrder = document.getElementById('btn-place-order');

  // ── Initialization ──────────────────────────────────────────────────────
  // ── Initialization ──────────────────────────────────────────────────────

  const initCheckoutApp = async (user) => {
    currentUser = user;
    await initCheckout();
  };

  if (session.initialized && session.user) {
    initCheckoutApp(session.user);
  } else {
    document.addEventListener('auth:ready', async (e) => {
      await initCheckoutApp(e.detail.user);
    });
  }

  async function initCheckout() {
    try {
      // 1. Validate Cart is not empty
      cartData = await cart.getCart();
      if (!cartData || !cartData.items || cartData.items.length === 0) {
        ui.showToast('Notice', 'Your cart is empty.', 'info');
        window.location.href = '/cart';
        return;
      }

      // Render cart items
      renderCartItems(cartData.items);

      // 2. Load Addresses
      addresses = await account.getAddresses();
      renderAddresses();

      // 3. Initial Pricing Preview (if cart has items)
      await updatePreview();

      // Show container
      loading.style.display = 'none';
      container.style.display = 'grid';

      // Bind Events
      btnPlaceOrder.addEventListener('click', handlePlaceOrder);
      btnApplyCoupon.addEventListener('click', handleApplyCoupon);
      document.getElementById('btn-checkout-add-address').addEventListener('click', () => {
        document.getElementById('checkout-address-modal').classList.add('active');
      });
      document.getElementById('btn-save-chk-address').addEventListener('click', handleSaveNewAddress);

    } catch (err) {
      console.error(err);
      loading.innerHTML = `<p class="text-danger">Failed to initialize checkout.</p>`;
    }
  }

  // ── Address Management ──────────────────────────────────────────────────
  function renderAddresses() {
    if (addresses.length === 0) {
      addressList.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; font-size: var(--text-sm);">Please add a shipping address.</div>`;
      btnPlaceOrder.disabled = true;
      return;
    }

    // Auto select default or first
    if (!selectedAddressId) {
      const def = addresses.find(a => a.is_default);
      selectedAddressId = def ? def.id : addresses[0].id;
    }

    addressList.innerHTML = addresses.map(addr => `
      <div class="checkout-address-card ${addr.id === selectedAddressId ? 'selected' : ''}" data-id="${addr.id}">
        <div class="address-label">${addr.label || 'Address'} ${addr.is_default ? '<span style="font-size:10px;color:var(--primary);margin-left:4px;">(Default)</span>' : ''}</div>
        <div class="address-details">
          ${addr.street}<br>
          ${addr.city}, ${addr.state} ${addr.zip_code}<br>
          ${addr.country}
        </div>
      </div>
    `).join('');

    addressInput.value = selectedAddressId;

    // Attach click listeners
    addressList.querySelectorAll('.checkout-address-card').forEach(card => {
      card.addEventListener('click', function() {
        selectedAddressId = parseInt(this.getAttribute('data-id'));
        renderAddresses(); // Re-render to update selected class
      });
    });
  }

  async function handleSaveNewAddress() {
    const data = {
      label: document.getElementById('chk-addr-label').value,
      street: document.getElementById('chk-addr-street').value,
      city: document.getElementById('chk-addr-city').value,
      state: document.getElementById('chk-addr-state').value,
      zip_code: document.getElementById('chk-addr-zip').value,
      country: document.getElementById('chk-addr-country').value,
      is_default: addresses.length === 0 // If it's the first, make it default
    };

    if (!data.street || !data.city || !data.state || !data.zip_code) {
      ui.showToast('Validation Error', 'Please fill all required address fields.', 'error');
      return;
    }

    try {
      const btn = document.getElementById('btn-save-chk-address');
      btn.disabled = true;
      btn.innerHTML = 'Saving...';
      
      const newAddr = await account.addAddress(data);
      addresses.push(newAddr);
      selectedAddressId = newAddr.id;
      
      document.getElementById('checkout-address-modal').classList.remove('active');
      document.getElementById('checkout-address-form').reset();
      
      renderAddresses();
      ui.showToast('Success', 'Address added.', 'success');

    } catch (e) {
      ui.showToast('Error', e.message, 'error');
    } finally {
      const btn = document.getElementById('btn-save-chk-address');
      btn.disabled = false;
      btn.innerHTML = 'Save Address';
    }
  }

  // ── Preview & Summary ───────────────────────────────────────────────────

  function renderCartItems(items) {
    itemList.innerHTML = items.map(item => `
      <div class="summary-product">
        <img src="${item.product_image || '/public/assets/images/placeholder.png'}" class="summary-product-img" alt="">
        <div class="summary-product-info">
          <div class="summary-product-name">${item.product_name}</div>
          <div class="summary-product-price">Qty: ${item.quantity} &times; ${formatCurrency(item.price)}</div>
        </div>
        <div style="font-weight: 700; font-size: var(--text-sm);">
          ${formatCurrency(item.subtotal)}
        </div>
      </div>
    `).join('');
  }

  async function updatePreview() {
    try {
      totalsBox.style.opacity = '0.5';
      btnPlaceOrder.disabled = true;

      const preview = await checkoutApi.previewCheckout(currentCoupon);

      document.getElementById('summary-subtotal').textContent = formatCurrency(preview.subtotal);
      
      const discountRow = document.getElementById('summary-discount-row');
      if (preview.discount_amount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('summary-discount').textContent = `-${formatCurrency(preview.discount_amount)}`;
      } else {
        discountRow.style.display = 'none';
      }

      document.getElementById('summary-tax').textContent = formatCurrency(preview.tax_amount);
      document.getElementById('summary-shipping').textContent = preview.shipping_charge > 0 ? formatCurrency(preview.shipping_charge) : 'Free';
      document.getElementById('summary-grand-total').textContent = formatCurrency(preview.total_amount);

      btnPlaceOrder.disabled = false;
      totalsBox.style.opacity = '1';

    } catch (e) {
      ui.showToast('Preview Error', e.message, 'error');
      totalsBox.style.opacity = '1';
    }
  }

  async function handleApplyCoupon() {
    const code = couponInput.value.trim();
    if (!code) return;

    btnApplyCoupon.disabled = true;
    btnApplyCoupon.innerHTML = '...';

    // Optimistically set the current coupon and attempt preview
    const previousCoupon = currentCoupon;
    currentCoupon = code;

    try {
      await updatePreview();
      couponMsg.textContent = 'Coupon applied successfully!';
      couponMsg.style.color = 'var(--success)';
      couponMsg.style.display = 'block';
    } catch (e) {
      currentCoupon = previousCoupon; // Revert
      couponMsg.textContent = e.message || 'Invalid coupon code';
      couponMsg.style.color = 'var(--danger)';
      couponMsg.style.display = 'block';
      await updatePreview(); // Re-calculate without coupon
    } finally {
      btnApplyCoupon.disabled = false;
      btnApplyCoupon.innerHTML = 'Apply';
    }
  }

  // ── Place Order ─────────────────────────────────────────────────────────

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      ui.showToast('Validation Error', 'Please select a shipping address.', 'error');
      return;
    }

    if (isProcessing) return;
    isProcessing = true;

    try {
      btnPlaceOrder.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff;"></span> Processing...';
      
      const order = await checkoutApi.createOrder(selectedAddressId, currentCoupon);
      
      // Tell cart module to clear cache
      await cart.clearCart();

      // Redirect to success
      window.location.href = `/order-success?id=${order.id}`;

    } catch (e) {
      ui.showToast('Checkout Failed', e.message || 'Could not place order', 'error');
      isProcessing = false;
      btnPlaceOrder.innerHTML = 'Place Order';
    }
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckoutPage);
} else {
  initCheckoutPage();
}
