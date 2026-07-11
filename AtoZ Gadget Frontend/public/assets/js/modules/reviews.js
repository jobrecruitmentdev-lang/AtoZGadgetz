import { fetchAPI } from '../api/api.js';
import { ui } from '../components/ui.js';

/**
 * Reviews & Ratings Feed Coordinator
 */
export class ReviewsManager {
  constructor(productId) {
    this.productId = productId;
    this.reviews = [];
    this.sortBy = 'latest';
    this.ratingVal = 5;
  }

  async init() {
    this.bindFormActions();
    await this.loadReviews();
  }

  async loadReviews() {
    try {
      const res = await fetchAPI(`/api/products/${this.productId}/reviews`);
      if (res && res.success && res.data) {
        this.reviews = res.data;
        this.renderSummaryCard();
        this.renderFeed();
      }
    } catch (err) {
      console.error('Failed fetching reviews list:', err);
    }
  }

  renderSummaryCard() {
    const avgLabel = document.getElementById('pdp-avg-rating-val');
    const starsBox = document.getElementById('pdp-avg-stars-box');
    const countLabel = document.getElementById('pdp-total-reviews-label');
    const distributionBox = document.getElementById('pdp-rating-distribution-rows');

    if (this.reviews.length === 0) {
      if (avgLabel) avgLabel.innerText = '5.0';
      if (countLabel) countLabel.innerText = 'Based on 0 reviews';
      if (starsBox) starsBox.innerHTML = this.getStarsHtml(5);
      if (distributionBox) {
        distributionBox.innerHTML = '<span class="text-xs text-muted">No client ratings available yet.</span>';
      }
      return;
    }

    const total = this.reviews.length;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / total).toFixed(1);

    if (avgLabel) avgLabel.innerText = avg;
    if (countLabel) countLabel.innerText = `Based on ${total} feedback review${total !== 1 ? 's' : ''}`;
    if (starsBox) starsBox.innerHTML = this.getStarsHtml(Math.round(Number(avg)));

    // Score distributions
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.reviews.forEach(r => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });

    if (distributionBox) {
      distributionBox.innerHTML = [5, 4, 3, 2, 1].map(stars => {
        const count = counts[stars] || 0;
        const percent = Math.round((count / total) * 100);
        return `
          <div class="distribution-row">
            <span class="distribution-label">${stars} Star</span>
            <div class="distribution-bar-bg">
              <div class="distribution-bar-fill" style="width: ${percent}%;"></div>
            </div>
            <span class="distribution-count">${count}</span>
          </div>
        `;
      }).join('');
    }
  }

  renderFeed() {
    const container = document.getElementById('pdp-reviews-feed-container');
    if (!container) return;

    if (this.reviews.length === 0) {
      container.innerHTML = '<p class="text-sm text-muted py-4">No shopper feedback comments recorded yet.</p>';
      return;
    }

    const sorted = [...this.reviews];
    if (this.sortBy === 'highest') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'lowest') {
      sorted.sort((a, b) => a.rating - b.rating);
    } else {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    container.innerHTML = sorted.map(review => `
      <div style="border-bottom: 1px solid var(--border-light); padding-bottom: var(--spacing-4); margin-bottom: var(--spacing-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="display: flex; gap: 2px; color: #ffb800;">
            ${this.getStarsHtml(review.rating)}
          </div>
          <span class="text-xs text-muted">${new Date(review.created_at).toLocaleDateString()}</span>
        </div>
        <p class="text-sm" style="margin: var(--spacing-2) 0; line-height: 1.6; color: var(--text);">"${review.review}"</p>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="text-xs font-bold" style="color: var(--text);">${review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Verified Shopper'}</span>
          <span class="badge" style="background-color: var(--success); color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 4px;">Verified</span>
        </div>
      </div>
    `).join('');
  }

  getStarsHtml(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color: #ffb800;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      } else {
        stars += `<svg class="empty" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--border);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      }
    }
    return stars;
  }

  bindFormActions() {
    const starNodes = document.querySelectorAll('#pdp-stars-selector span');
    const ratingInput = document.getElementById('pdp-review-rating');
    const formNode = document.getElementById('pdp-write-review-form');

    starNodes.forEach(star => {
      star.addEventListener('click', () => {
        const val = Number(star.getAttribute('data-val'));
        this.ratingVal = val;
        if (ratingInput) ratingInput.value = val.toString();

        starNodes.forEach(item => {
          const currentVal = Number(item.getAttribute('data-val'));
          if (currentVal <= val) {
            item.style.color = '#ffb800';
          } else {
            item.style.color = 'var(--border)';
          }
        });
      });
    });

    const sortOption = document.getElementById('pdp-reviews-sort');
    if (sortOption) {
      sortOption.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderFeed();
      });
    }

    if (formNode) {
      formNode.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textVal = document.getElementById('pdp-review-body').value.trim();
        if (!textVal) return;

        try {
          const submitBtn = document.getElementById('pdp-review-submit-btn');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Submitting...';
          }

          const response = await fetchAPI(`/api/products/${this.productId}/review`, {
            method: 'POST',
            body: {
              rating: this.ratingVal,
              review: textVal
            }
          });

          if (response && response.success) {
            ui.toast('Review posted successfully!', 'success');
            document.getElementById('pdp-review-body').value = '';
            await this.loadReviews();
          } else {
            ui.toast('Failed adding review. Please verify authorization status.', 'error');
          }
        } catch (err) {
          console.error(err);
          ui.toast('Session expired. Please sign in to write reviews.', 'error');
        } finally {
          const submitBtn = document.getElementById('pdp-review-submit-btn');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Submit Review';
          }
        }
      });
    }
  }
}
