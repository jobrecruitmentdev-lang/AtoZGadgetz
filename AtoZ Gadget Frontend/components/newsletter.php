<?php
declare(strict_types=1);
?>
<!-- Newsletter Box (Inspired by Apple Store minimal subscription footer) -->
<div class="newsletter-section" style="margin-top: var(--spacing-12); padding: var(--spacing-12) var(--spacing-6); background-color: var(--surface); border-radius: var(--radius-lg); border: 1px solid var(--border); text-align: center;">
  <div style="max-width: 520px; margin: 0 auto;">
    <h3 class="font-semibold text-2xl" style="margin-bottom: var(--spacing-2); color: var(--text);">Stay Updated</h3>
    <p class="text-sm text-muted" style="margin-bottom: var(--spacing-6); line-height: 1.5;">Subscribe to receive announcements for new releases, exclusive coupon drops, and seasonal member benefits.</p>
    
    <form class="newsletter-form" id="newsletter-form" style="display: flex; gap: var(--spacing-2);">
      <input type="email" id="newsletter-email" class="form-control" placeholder="Enter your email address" required style="flex-grow: 1; text-align: left;" aria-label="Email address for subscription">
      <button type="submit" class="btn btn-primary" id="newsletter-submit-btn">Subscribe</button>
    </form>
    
    <span class="text-xs text-muted" style="display: block; margin-top: var(--spacing-3);">By subscribing, you agree to our privacy policy. No spam, ever.</span>
  </div>
</div>
