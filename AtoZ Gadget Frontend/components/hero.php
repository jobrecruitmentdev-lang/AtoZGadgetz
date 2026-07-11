<?php
declare(strict_types=1);
?>
<!-- Premium Hero Slider (Inspired by Apple & Samsung Store) -->
<div class="hero-slider" id="homepage-hero-slider">
  <!-- Active fallback slide before async JS loads banners -->
  <div class="hero-slide active" style="background: linear-gradient(180deg, rgba(10, 10, 12, 0.1), rgba(10, 10, 12, 0.85)), url('<?php echo asset_url('images/hero-default.png'); ?>') center/cover no-repeat;">
    <div class="hero-slide-content">
      <h1 class="hero-slide-title">Future of Tech.<br>In Your Hands.</h1>
      <p class="hero-slide-desc">Explore premium flagship smartphones, lightweight notebook PCs, and high-fidelity wireless audio gear.</p>
      <a href="<?php echo url('/products'); ?>" class="btn btn-primary">Shop Collection</a>
    </div>
  </div>
</div>
