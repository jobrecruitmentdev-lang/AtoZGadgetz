import { CatalogController } from './products.js';

document.addEventListener('DOMContentLoaded', () => {
  if (window.APP_CONFIG && window.APP_CONFIG.currentPage === 'search') {
    const query = window.APP_CONFIG.routeParams.query || '';

    // Update titles on search listing view
    const titleEl = document.getElementById('catalog-page-title');
    const descEl = document.getElementById('catalog-page-desc');

    if (titleEl) titleEl.innerText = `Search Results: "${query}"`;
    if (descEl) descEl.innerText = `Displaying catalog products matching your query "${query}"`;

    const controller = new CatalogController({ searchQuery: query });
    controller.init();
  }
});
