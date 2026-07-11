/**
 * Lazy loading helper module utilizing Intersection Observer API (Performance optimization)
 */

export function initLazyLoad() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"], .lazy-load-img');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          if (image.dataset.src) {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
          }
          
          // Remove potential blur skeleton loaders
          image.classList.remove('lazy-load-img');
          imageObserver.unobserve(image);
        }
      });
    }, {
      rootMargin: '0px 0px 200px 0px', // Preload images 200px before scrolling in
      threshold: 0.01
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback logic for legacy search agents or browsers
    lazyImages.forEach(image => {
      if (image.dataset.src) {
        image.src = image.dataset.src;
      }
    });
  }
}
