import { CatalogController } from './products.js';
import { fetchAPI } from '../api/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (window.APP_CONFIG && window.APP_CONFIG.currentPage === 'brand') {
    const slug = window.APP_CONFIG.routeParams.brand_slug;
    if (!slug) return;

    try {
      const res = await fetchAPI('/api/brands');
      if (res && res.success && res.data) {
        const brand = res.data.find(b => b.slug === slug);
        if (brand) {
          const logoEl = document.getElementById('brand-header-logo');
          const titleEl = document.getElementById('brand-header-title');
          const descEl = document.getElementById('brand-header-desc');

          if (logoEl) logoEl.src = '/' + (brand.logo || 'public/assets/images/placeholder.png');
          if (titleEl) titleEl.innerText = `${brand.name} Official Store`;
          if (descEl) descEl.innerText = `Browse direct manufacturer warranty devices from ${brand.name}.`;

          const controller = new CatalogController({ lockedBrand: brand.id });
          controller.init();
          return;
        }
      }

      const controller = new CatalogController();
      controller.init();
    } catch (e) {
      console.error('Failed fetching brand catalog data:', e);
    }
  }
});
