<?php
declare(strict_types=1);
?>
<!-- Coupon / Voucher Application Block -->
<div class="coupon-box-wrapper">

  <div class="coupon-box-label">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 12v10H4V12"></path>
      <path d="M22 7H2v5h20V7z"></path>
      <path d="M12 22V7"></path>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
    Promo Code / Coupon
  </div>

  <form id="coupon-form" autocomplete="off">
    <div class="coupon-input-row">
      <input
        type="text"
        id="coupon-code-input"
        class="coupon-input"
        placeholder="Enter coupon code"
        autocomplete="off"
        spellcheck="false"
        aria-label="Coupon code"
        maxlength="30"
      >
      <button type="submit" id="coupon-apply-btn" class="coupon-apply-btn">Apply</button>
    </div>
  </form>

  <div id="coupon-result" class="coupon-result"></div>

  <button type="button" id="coupon-remove-btn" class="coupon-remove-btn" style="display: none;">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
    Remove Coupon
  </button>

</div>
