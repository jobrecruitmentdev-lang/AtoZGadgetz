<?php
declare(strict_types=1);
?>
<!-- Cart Pincode Shipping Estimator Box -->
<div class="shipping-estimator-box card" style="background-color: var(--surface); padding: var(--spacing-4); border: 1px solid var(--border); margin-bottom: var(--spacing-4);">
  <h4 class="font-semibold text-sm" style="margin-bottom: var(--spacing-2); color: var(--text);">Estimate Shipping Costs</h4>
  
  <form id="cart-pincode-form" style="display: flex; gap: var(--spacing-2);">
    <input type="text" id="cart-pincode-input" class="form-control text-sm" placeholder="6-digit ZIP code" maxlength="6" pattern="\\d{6}" required style="text-align: left; height: 36px;">
    <button type="submit" class="btn btn-secondary btn-sm" id="cart-pincode-btn" style="height: 36px; min-width: 80px;">Estimate</button>
  </form>

  <div id="cart-pincode-feedback" style="margin-top: var(--spacing-2); font-size: var(--text-xs); line-height: 1.5; display: none;">
    <!-- Injected dynamically by shipping.js -->
  </div>
</div>
