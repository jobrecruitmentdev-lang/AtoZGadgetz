<div class="checkout-step" id="step-address">
  <div class="checkout-step-header">
    <div class="step-number">1</div>
    <h2 class="step-title">Shipping Address</h2>
  </div>
  <div class="checkout-step-body">
    
    <div class="address-selector-grid" id="checkout-address-list">
      <div class="empty-state" style="grid-column: 1 / -1; font-size: var(--text-sm);">Loading addresses...</div>
    </div>

    <button type="button" class="btn btn-outline" id="btn-checkout-add-address" style="margin-top: var(--spacing-4);">
      + Add New Address
    </button>
    
    <!-- Hidden input to store selected address ID -->
    <input type="hidden" id="selected-address-id" value="">
  </div>
</div>
