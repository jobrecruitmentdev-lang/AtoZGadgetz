<?php
declare(strict_types=1);
?>
<!-- Official Brands Row (Inspired by Croma & Reliance) -->
<div class="brand-slider-section" style="margin-top: var(--spacing-8);">
  <div class="section-header">
    <div>
      <h3 class="section-title font-semibold">Popular Brands</h3>
      <p class="text-sm text-muted">Direct manufacturer warranty from trusted brands</p>
    </div>
  </div>
  
  <div class="brand-badges-row" id="homepage-brands-badges">
    <!-- Initial skeletons populated by home.js -->
    <?php for ($i = 0; $i < 6; $i++): ?>
      <div class="skeleton" style="width: 130px; height: 55px; border-radius: var(--radius-md);"></div>
    <?php endfor; ?>
  </div>
</div>
