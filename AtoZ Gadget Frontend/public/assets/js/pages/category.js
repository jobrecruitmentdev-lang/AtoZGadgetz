import { CatalogController } from './products.js';
import { fetchAPI } from '../api/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (window.APP_CONFIG && window.APP_CONFIG.currentPage === 'category') {
    const slug = window.APP_CONFIG.routeParams.category_slug;
    if (!slug) return;

    try {
      const res = await fetchAPI('/api/categories');
      if (res && res.success && res.data) {
        const cat = res.data.find(c => c.slug === slug);
        if (cat) {
          // Sync titles
          const titleEl = document.getElementById('category-header-title');
          const descEl = document.getElementById('category-header-desc');
          if (titleEl) titleEl.innerText = cat.name;
          if (descEl) descEl.innerText = cat.description || `Curated premium selection of ${cat.name}`;

          const controller = new CatalogController({ lockedCategory: cat.id });
          controller.init();
          return;
        }
      }

      // Catalog fallback
      const controller = new CatalogController();
      controller.init();
    } catch (e) {
      console.error('Failed fetching category filters data:', e);
    }
  }
});
