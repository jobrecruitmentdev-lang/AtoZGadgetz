<?php
declare(strict_types=1);
?>
<div class="container checkout-page">
  
  <div style="margin-bottom: var(--spacing-6);">
    <h1 style="font-size: var(--text-3xl); letter-spacing: -0.5px;">Checkout</h1>
    <p class="text-sm text-muted">Complete your purchase securely.</p>
  </div>

  <div class="checkout-grid" id="checkout-container" style="display: none;">
    
    <!-- Left Column: Steps -->
    <div class="checkout-steps">
      <?php require_once COMPONENTS_PATH . '/checkout/address-selector.php'; ?>
      <?php require_once COMPONENTS_PATH . '/checkout/payment-selector.php'; ?>
    </div>

    <!-- Right Column: Summary -->
    <div>
      <?php require_once COMPONENTS_PATH . '/checkout/order-summary.php'; ?>
    </div>

  </div>

  <!-- Loading State -->
  <div id="checkout-loading" style="padding: var(--spacing-10) 0; text-align: center;">
    <div class="spinner" style="width: 40px; height: 40px; border-width: 3px; border-top-color: var(--primary);"></div>
    <p style="margin-top: var(--spacing-4); color: var(--text-muted); font-weight: 600;">Initializing secure checkout...</p>
  </div>

</div>

<!-- Reuse the Address Modal from the Account module, included dynamically via JS or hidden here -->
<?php 
// Instead of rewriting the modal, we can just include the address modal fragment if we had isolated it.
// For now, we will use a dedicated script to redirect user to /account#addresses if they have none, 
// OR recreate the basic modal. The best UX is to render the address modal here too.
?>
<div id="checkout-address-modal" class="modal" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-header">
      <h3 class="modal-title">Add New Address</h3>
      <button type="button" class="modal-close" data-dismiss="modal">&times;</button>
    </div>
    <div class="modal-body">
      <form id="checkout-address-form">
        <div class="form-group" style="margin-bottom: var(--spacing-3);">
          <label class="form-label" style="font-size: 11px;">Label (Home, Work)</label>
          <input type="text" id="chk-addr-label" class="form-input" style="width: 100%;" required>
        </div>
        <div class="form-group" style="margin-bottom: var(--spacing-3);">
          <label class="form-label" style="font-size: 11px;">Street Address</label>
          <input type="text" id="chk-addr-street" class="form-input" style="width: 100%;" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-3); margin-bottom: var(--spacing-3);">
          <div class="form-group">
            <label class="form-label" style="font-size: 11px;">City</label>
            <input type="text" id="chk-addr-city" class="form-input" style="width: 100%;" required>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size: 11px;">State</label>
            <input type="text" id="chk-addr-state" class="form-input" style="width: 100%;" required>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-3);">
          <div class="form-group">
            <label class="form-label" style="font-size: 11px;">Zip Code</label>
            <input type="text" id="chk-addr-zip" class="form-input" style="width: 100%;" required>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size: 11px;">Country</label>
            <input type="text" id="chk-addr-country" class="form-input" value="US" style="width: 100%;" required>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: var(--spacing-3);">
      <button type="button" class="btn btn-outline" data-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="btn-save-chk-address">Save Address</button>
    </div>
  </div>
</div>

<script type="module">
  import '<?php echo asset_url('js/pages/checkout.js'); ?>';
</script>
