/**
 * Pagination Renderer Module
 */

export function renderPagination(totalPages, currentPage, onPageChange) {
  const container = document.getElementById('catalog-pagination');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  let html = '';

  // Left arrow previous page btn
  const isPrevDisabled = currentPage === 1 ? 'disabled' : '';
  html += `<button type="button" class="pagination-btn ${isPrevDisabled}" data-page="${currentPage - 1}" aria-label="Previous Page">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
  </button>`;

  // Render pages indexes
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      const activeClass = i === currentPage ? 'active' : '';
      html += `<button type="button" class="pagination-btn ${activeClass}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += `<span class="pagination-ellipses text-muted" style="padding: 0 var(--spacing-2);">...</span>`;
    }
  }

  // Right arrow next page btn
  const isNextDisabled = currentPage === totalPages ? 'disabled' : '';
  html += `<button type="button" class="pagination-btn ${isNextDisabled}" data-page="${currentPage + 1}" aria-label="Next Page">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
  </button>`;

  container.innerHTML = html;

  // Bind clicks
  container.querySelectorAll('.pagination-btn').forEach(btn => {
    if (!btn.classList.contains('disabled')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(btn.dataset.page, 10);
        if (page && page !== currentPage) {
          onPageChange(page);
        }
      });
    }
  });
}
