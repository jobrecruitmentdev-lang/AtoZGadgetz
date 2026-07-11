/**
 * Helper Utilities
 * Collection of performance and layout rendering helper methods.
 */

/**
 * Debounce function to limit rapid execution calls (e.g. search autocomplete)
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution calls (e.g. resize, scroll handlers)
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy loading image initializer using IntersectionObserver
 */
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          if (image.dataset.src) {
            image.src = image.dataset.src;
          }
          image.removeAttribute('loading');
          imageObserver.unobserve(image);
        }
      });
    });
    
    images.forEach(image => imageObserver.observe(image));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    images.forEach(image => {
      if (image.dataset.src) {
        image.src = image.dataset.src;
      }
    });
  }
}

/**
 * Client-side INR Price Formatter
 */
export function formatPrice(amount) {
  const numericAmount = parseFloat(amount) || 0;
  return '₹ ' + numericAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

/**
 * Generate premium responsive picture tags for WebP images
 */
export function createResponsivePicture(src, alt = '', className = '', sizes = '100vw') {
  if (!src) return '';
  
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  return `
    <picture class="${className}">
      <source srcset="${webpSrc}" type="image/webp">
      <img src="${src}" alt="${alt}" loading="lazy" decoding="async" sizes="${sizes}">
    </picture>
  `;
}
