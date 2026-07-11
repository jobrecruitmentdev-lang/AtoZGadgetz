/**
 * Sticky Buy Bar Module
 * 
 * Shows a fixed bottom bar on the PDP when the user scrolls past
 * the main buy-box section. Provides quick "Add to Cart" / "Buy Now"
 * without scrolling back up.
 */

export function initStickyBuyBar(onAddToCart, onBuyNow) {
  const bar        = document.getElementById('sticky-buy-bar');
  const buyBox     = document.getElementById('pdp-buy-box');
  const stickyAdd  = document.getElementById('sticky-add-cart-btn');
  const stickyBuy  = document.getElementById('sticky-buy-now-btn');

  if (!bar || !buyBox) return;

  // Sync product title to sticky bar if element exists
  const stickyName = document.getElementById('sticky-product-name');
  const mainTitle  = document.querySelector('.pdp-title');
  if (stickyName && mainTitle) {
    stickyName.innerText = mainTitle.innerText;
  }

  // Show/hide bar on scroll using IntersectionObserver
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        bar.classList.add('sticky-bar-visible');
      } else {
        bar.classList.remove('sticky-bar-visible');
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(buyBox);

  // Wire sticky buttons
  if (stickyAdd && onAddToCart) {
    stickyAdd.addEventListener('click', onAddToCart);
  }

  if (stickyBuy && onBuyNow) {
    stickyBuy.addEventListener('click', onBuyNow);
  }
}
