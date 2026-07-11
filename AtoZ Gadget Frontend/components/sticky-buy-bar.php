<?php
declare(strict_types=1);
?>
<!-- Mobile Bottom Sticky Buy Bar -->
<div class="sticky-buy-bar-wrapper" id="pdp-sticky-bar" style="display: none;">
  <div class="container sticky-buy-container" style="display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-4); height: 64px;">
    
    <!-- Thumbnail + Title & Price info -->
    <div style="display: flex; align-items: center; gap: var(--spacing-2); max-width: 50%;">
      <img id="pdp-sticky-img" src="/public/assets/images/placeholder.png" alt="Thumbnail" width="38" height="38" style="border-radius: var(--radius-xs); object-fit: contain; background-color: #fff;">
      <div style="display: flex; flex-direction: column; overflow: hidden;">
        <span id="pdp-sticky-title" class="font-semibold text-xs" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: var(--text);">Loading...</span>
        <span id="pdp-sticky-price" class="font-bold text-sm" style="color: var(--primary);">₹0</span>
      </div>
    </div>
    
    <!-- Action buttons -->
    <div style="display: flex; gap: var(--spacing-2);">
      <button type="button" class="btn btn-primary btn-sm" id="pdp-sticky-add-btn" style="height: 36px; font-size: 11px; padding: 0 12px;">Add</button>
      <button type="button" class="btn btn-primary btn-sm" id="pdp-sticky-buy-btn" style="height: 36px; font-size: 11px; padding: 0 12px; background-color: var(--text); color: var(--background);">Buy</button>
    </div>
    
  </div>
</div>
