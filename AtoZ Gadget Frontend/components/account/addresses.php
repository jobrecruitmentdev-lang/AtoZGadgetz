<div class="view-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
  <div>
    <h2 class="view-title">Manage Addresses</h2>
    <p class="view-subtitle">Add or edit your shipping and billing addresses.</p>
  </div>
  <button type="button" class="btn btn-primary" id="btn-add-address">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add New
  </button>
</div>

<div class="address-grid" id="address-list-container">
  <div class="empty-state" style="grid-column: 1 / -1;">Loading addresses...</div>
</div>

<!-- Address Modal (Hidden by default) -->
<div id="address-modal" class="modal" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-header">
      <h3 class="modal-title" id="address-modal-title">Add New Address</h3>
      <button type="button" class="modal-close" data-dismiss="modal">&times;</button>
    </div>
    <div class="modal-body">
      <form id="address-form">
        <input type="hidden" id="addr-id">
        
        <div class="account-form-grid full">
          <div class="form-group">
            <label for="addr-label" class="form-label">Address Label (e.g., Home, Work)</label>
            <input type="text" id="addr-label" class="form-input" required>
          </div>
        </div>

        <div class="account-form-grid full">
          <div class="form-group">
            <label for="addr-street" class="form-label">Street Address</label>
            <input type="text" id="addr-street" class="form-input" required>
          </div>
        </div>

        <div class="account-form-grid">
          <div class="form-group">
            <label for="addr-city" class="form-label">City</label>
            <input type="text" id="addr-city" class="form-input" required>
          </div>
          <div class="form-group">
            <label for="addr-state" class="form-label">State / Province</label>
            <input type="text" id="addr-state" class="form-input" required>
          </div>
        </div>

        <div class="account-form-grid">
          <div class="form-group">
            <label for="addr-zip" class="form-label">Postal / Zip Code</label>
            <input type="text" id="addr-zip" class="form-input" required>
          </div>
          <div class="form-group">
            <label for="addr-country" class="form-label">Country</label>
            <input type="text" id="addr-country" class="form-input" value="US" required>
          </div>
        </div>

        <div class="form-group" style="margin-top: var(--spacing-4); flex-direction: row; align-items: center; gap: 8px;">
          <input type="checkbox" id="addr-default" style="width: 16px; height: 16px; cursor: pointer;">
          <label for="addr-default" style="cursor: pointer; color: var(--text);">Set as default address</label>
        </div>
      </form>
    </div>
    <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: var(--spacing-3);">
      <button type="button" class="btn btn-outline" data-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="btn-save-address">Save Address</button>
    </div>
  </div>
</div>
