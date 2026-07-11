<?php
declare(strict_types=1);
?>
<div class="auth-page-wrapper">
  <div class="auth-card">
    
    <div class="auth-header">
      <h1 class="auth-title">Forgot Password</h1>
      <p class="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
    </div>

    <!-- Forgot Password Form -->
    <form id="forgot-password-form" novalidate>
      
      <!-- Email -->
      <div class="auth-form-group">
        <label for="forgot-email" class="auth-label">Email Address</label>
        <div class="auth-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input type="email" id="forgot-email" class="auth-input" placeholder="name@example.com" required autocomplete="email" autofocus>
        </div>
        <div class="auth-error" id="error-email"></div>
      </div>

      <!-- Submit -->
      <button type="submit" class="auth-submit-btn" id="forgot-submit-btn">
        Send Reset Link
      </button>

    </form>

    <div class="auth-footer" style="margin-top: var(--spacing-6);">
      <a href="/login" class="auth-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px; margin-bottom: 2px;">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Login
      </a>
    </div>

  </div>
</div>
