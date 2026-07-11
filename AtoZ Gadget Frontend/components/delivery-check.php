<?php
declare(strict_types=1);
?>
<!-- PDP Delivery & Pin Code Checker widget -->
<div class="delivery-checker-box card" style="background-color: var(--surface); padding: var(--spacing-4); border: 1px solid var(--border); margin-bottom: var(--spacing-6);">
  <h4 class="font-semibold text-sm" style="margin-bottom: var(--spacing-2); display: flex; align-items: center; gap: 6px;">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    Check Delivery Pin Code
  </h4>
  <p class="text-xs text-muted" style="margin-bottom: var(--spacing-3);">Verify express transit times and cash on delivery availability in your location.</p>
  
  <form id="pdp-pincode-form" style="display: flex; gap: var(--spacing-2);">
    <input type="text" id="pdp-pincode-input" class="form-control text-sm" placeholder="Enter 6-digit PIN code" maxlength="6" pattern="\\d{6}" required style="text-align: left; height: 38px;">
    <button type="submit" class="btn btn-secondary btn-sm" id="pdp-pincode-btn" style="height: 38px; min-width: 70px;">Check</button>
  </form>
  
  <div id="pdp-pincode-response" style="margin-top: var(--spacing-3); font-size: var(--text-xs); line-height: 1.5; display: none;">
    <!-- Injected dynamically by pincode.js -->
  </div>
</div>
