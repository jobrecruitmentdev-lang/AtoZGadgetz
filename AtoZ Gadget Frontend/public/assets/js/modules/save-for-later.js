/**
 * Save For Later Module
 * 
 * "Save for Later" moves an item from the active cart to the user's wishlist
 * using existing backend endpoints:
 *   POST /api/wishlist/add   { product_id }
 *   DELETE /api/cart/remove/{item_id}
 * 
 * "Move to Cart" reverses this:
 *   POST /api/cart/add  { product_id, quantity: 1 }
 *   DELETE /api/wishlist/remove/{product_id}
 */

import { cart }     from './cart.js';
import { wishlist } from './wishlist.js';
import { ui }       from '../components/ui.js';

/**
 * Bind all "Save for Later" buttons on the cart page.
 * Each button should have data-item-id and data-product-id.
 * @param {Function} onRefresh - Called after mutation to re-render the cart.
 */
export function bindSaveForLaterButtons(onRefresh) {
  document.querySelectorAll('.save-for-later-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId    = btn.dataset.itemId;
      const productId = btn.dataset.productId;

      if (!itemId || !productId) return;

      try {
        btn.disabled = true;
        btn.innerText = 'Saving…';

        // 1. Add product to wishlist
        await wishlist.add(productId);
        // 2. Remove from cart
        await cart.remove(itemId);

        ui.showToast('Saved', 'Item moved to your wishlist.', 'success');

        if (onRefresh) await onRefresh();
      } catch (err) {
        ui.showToast('Error', err.message || 'Could not save item.', 'error');
        btn.disabled = false;
        btn.innerText = 'Save for Later';
      }
    });
  });
}

/**
 * Bind all "Move to Cart" buttons on the wishlist or saved-items section.
 * Each button should have data-product-id and data-wishlist-item-id.
 * @param {Function} onRefresh - Called after mutation to re-render.
 */
export function bindMoveToCartButtons(onRefresh) {
  document.querySelectorAll('.move-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId      = btn.dataset.productId;
      const wishlistItemId = btn.dataset.wishlistItemId;

      if (!productId) return;

      try {
        btn.disabled = true;
        btn.innerText = 'Moving…';

        // 1. Add to cart with qty 1
        await cart.add(productId, 1, null);
        // 2. Remove from wishlist if we have the wishlist entry
        if (wishlistItemId) {
          await wishlist.remove(productId);
        }

        ui.showToast('Added', 'Item moved to your shopping cart.', 'success');

        if (onRefresh) await onRefresh();
      } catch (err) {
        ui.showToast('Error', err.message || 'Could not move item to cart.', 'error');
        btn.disabled = false;
        btn.innerText = 'Move to Cart';
      }
    });
  });
}
