/**
 * Compare Page Controller
 * 
 * Manages product comparison stored in localStorage.
 * 
 * Compare state is persisted under the key "atoz_compare_ids" as a JSON array.
 * Max 4 products can be compared simultaneously.
 * 
 * Backend endpoint used: GET /api/store/products/{slug}  (per product to fetch details)
 * 
 * How products are added to compare:
 *   - Product cards have a "Compare" button with data-product-slug and data-product-id
 *   - Clicking it adds the slug to localStorage
 *   - This page reads those slugs, fetches full details and renders the matrix
 */

import { api }         from '../api/api.js';
import { formatPrice } from '../helpers/helpers.js';
import { cart }        from '../modules/cart.js';
import { ui }          from '../components/ui.js';

const COMPARE_KEY = 'atoz_compare_ids';
const MAX_COMPARE  = 4;

document.addEventListener('DOMContentLoaded', () => {
  initComparePage();
  bindGlobalAddToCompare();
});

// ─── Compare Page ──────────────────────────────────────────────────────────────

async function initComparePage() {
  const container  = document.getElementById('compare-main-container');
  const emptyState = document.getElementById('compare-empty-state');
  const slugs      = getCompareList();

  if (!container) return;

  if (slugs.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    container.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.style.display = 'block';
  container.innerHTML = buildSkeletonHTML(slugs.length);

  try {
    const products = await fetchProductsBySlug(slugs);
    renderCompareTable(products, container);
  } catch (err) {
    console.error('Compare page error:', err);
    container.innerHTML = '<p class="text-sm text-muted" style="text-align:center;padding:2rem;">Could not load products for comparison.</p>';
  }
}

async function fetchProductsBySlug(slugs) {
  const promises = slugs.map(slug =>
    api.request(`/api/store/products/${slug}`)
      .then(res => res.success && res.data ? res.data.product : null)
      .catch(() => null)
  );
  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

function renderCompareTable(products, container) {
  if (products.length === 0) {
    container.innerHTML = '<p class="text-sm text-muted" style="text-align:center;padding:2rem;">No products found.</p>';
    return;
  }

  // Collect all unique attribute keys
  const allAttrKeys = new Set();
  products.forEach(p => {
    (p.attributes || []).forEach(a => {
      allAttrKeys.add(a.attribute?.name || a.name || 'Unknown');
    });
  });

  // Build header row
  const headerCols = products.map(p => {
    const img = p.images?.[0]?.image_path ?? 'public/assets/images/placeholder.png';
    const price = p.discount_price !== null ? p.discount_price : p.price;
    return `
      <th class="compare-product-col">
        <div class="compare-product-header">
          <button class="compare-remove-btn" data-slug="${p.slug}" aria-label="Remove from compare">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <a href="/product/${p.slug}" class="compare-product-img-link">
            <img src="/${img}" alt="${p.name}" class="compare-product-img" loading="lazy">
          </a>
          <a href="/product/${p.slug}" class="compare-product-name">${p.name}</a>
          <span class="compare-product-brand">${p.brand?.name ?? ''}</span>
          <span class="compare-product-price">${formatPrice(price)}</span>
          <button type="button" class="btn btn-primary btn-sm compare-add-cart-btn" data-product-id="${p.id}">
            Add to Cart
          </button>
        </div>
      </th>`;
  }).join('');

  // Build attribute rows
  const attrRows = [...allAttrKeys].map(key => {
    const cells = products.map(p => {
      const attr = (p.attributes || []).find(a => (a.attribute?.name || a.name) === key);
      return `<td class="compare-attr-val">${attr ? attr.value : '<span class="compare-na">–</span>'}</td>`;
    }).join('');
    return `<tr class="compare-attr-row"><th class="compare-attr-name">${key}</th>${cells}</tr>`;
  }).join('');

  container.innerHTML = `
    <div class="compare-table-scroll">
      <table class="compare-matrix-table">
        <thead>
          <tr>
            <th class="compare-label-col">Specification</th>
            ${headerCols}
          </tr>
        </thead>
        <tbody>
          ${attrRows.length > 0 ? attrRows : `<tr><td class="compare-attr-name compare-no-specs" colspan="${products.length + 1}">No specification data available for comparison.</td></tr>`}
        </tbody>
      </table>
    </div>`;

  bindCompareTableActions();
}

function buildSkeletonHTML(count) {
  const cols = Array.from({ length: count }, () =>
    `<div class="compare-skeleton-col">
       <div class="skeleton" style="height:120px;border-radius:var(--radius-md);"></div>
       <div class="skeleton" style="height:14px;width:80%;margin-top:8px;"></div>
       <div class="skeleton" style="height:14px;width:60%;margin-top:6px;"></div>
     </div>`
  ).join('');
  return `<div class="compare-skeleton-row">${cols}</div>`;
}

function bindCompareTableActions() {
  // Remove from compare
  document.querySelectorAll('.compare-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slug = btn.dataset.slug;
      removeFromCompare(slug);
      initComparePage(); // Re-render
    });
  });

  // Add to cart
  document.querySelectorAll('.compare-add-cart-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.productId;
      try {
        btn.disabled = true;
        btn.innerText = 'Adding…';
        await cart.add(productId, 1, null);
        btn.innerText = '✓ Added';
        btn.style.background = 'var(--success)';
        setTimeout(() => {
          btn.disabled = false;
          btn.innerText = 'Add to Cart';
          btn.style.background = '';
        }, 2000);
        ui.showToast('Added', 'Item added to your shopping cart.', 'success');
      } catch (err) {
        ui.showToast('Error', err.message || 'Could not add to cart.', 'error');
        btn.disabled = false;
        btn.innerText = 'Add to Cart';
      }
    });
  });
}

// ─── Global Add-to-Compare (product cards / PDP) ────────────────────────────

export function bindGlobalAddToCompare() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="add-compare"]');
    if (!btn) return;

    const slug = btn.dataset.productSlug;
    if (!slug) return;

    const list = getCompareList();

    if (list.includes(slug)) {
      removeFromCompare(slug);
      btn.classList.remove('compare-active');
      ui.showToast('Removed', 'Product removed from comparison.', 'info');
      return;
    }

    if (list.length >= MAX_COMPARE) {
      ui.showToast('Limit Reached', `You can compare up to ${MAX_COMPARE} products.`, 'warning');
      return;
    }

    addToCompare(slug);
    btn.classList.add('compare-active');
    ui.showToast('Added', 'Product added to comparison. <a href="/compare" style="color:var(--primary-light);text-decoration:underline;">View comparison →</a>', 'success');
  });
}

// ─── LocalStorage Helpers ───────────────────────────────────────────────────

export function getCompareList() {
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY)) || [];
  } catch {
    return [];
  }
}

export function addToCompare(slug) {
  const list = getCompareList();
  if (!list.includes(slug) && list.length < MAX_COMPARE) {
    list.push(slug);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  }
}

export function removeFromCompare(slug) {
  const list = getCompareList().filter(s => s !== slug);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
}

export function clearCompare() {
  localStorage.removeItem(COMPARE_KEY);
}
