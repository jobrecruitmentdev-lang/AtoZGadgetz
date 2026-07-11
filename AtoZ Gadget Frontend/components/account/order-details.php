<div class="view-header" style="display: flex; gap: var(--spacing-4); align-items: center;">
  <button type="button" class="btn btn-ghost" id="btn-back-to-orders" style="padding: 8px;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  </button>
  <div>
    <h2 class="view-title" id="detail-order-title" style="margin-bottom: 0;">Order Details</h2>
    <p class="view-subtitle" id="detail-order-date">Loading...</p>
  </div>
</div>

<div id="order-details-content">
  <div class="empty-state">Loading order information...</div>
</div>

<!-- Template for rendered order detail -->
<template id="order-detail-template">
  <div class="card" style="margin-bottom: var(--spacing-6); padding: var(--spacing-6);">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-6); border-bottom: 1px solid var(--border-light); padding-bottom: var(--spacing-4);">
      <div>
        <div style="font-size: var(--text-sm); color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Order Status</div>
        <div class="order-status" id="tpl-order-status">PENDING</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: var(--text-sm); color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Total Amount</div>
        <div class="order-total" id="tpl-order-total">$0.00</div>
      </div>
    </div>

    <!-- Items -->
    <h3 style="margin-bottom: var(--spacing-4); font-size: var(--text-base);">Items in your order</h3>
    <div id="tpl-order-items" style="display: flex; flex-direction: column; gap: var(--spacing-4); margin-bottom: var(--spacing-6);">
      <!-- Items will be injected here -->
    </div>

    <!-- Shipping Info -->
    <div style="display: grid; grid-template-columns: 1fr; gap: var(--spacing-6); background: var(--background); padding: var(--spacing-5); border-radius: var(--radius-md);">
      <div>
        <h4 style="font-size: var(--text-sm); font-weight: 700; margin-bottom: var(--spacing-2); text-transform: uppercase; color: var(--text-muted);">Shipping Address</h4>
        <div id="tpl-order-address" style="font-size: var(--text-sm); line-height: 1.6; color: var(--text);"></div>
      </div>
    </div>
  </div>

  <div style="text-align: right;" id="tpl-order-actions">
    <!-- Cancel button goes here if eligible -->
  </div>
</template>
