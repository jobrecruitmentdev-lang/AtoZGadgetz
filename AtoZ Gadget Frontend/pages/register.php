<?php
declare(strict_types=1);
?>
<div class="auth-page-wrapper">
  <div class="auth-card" style="max-width: 520px;">
    
    <div class="auth-header">
      <h1 class="auth-title">Create Account</h1>
      <p class="auth-subtitle">Join AtoZ Gadgets for exclusive tech & premium offers</p>
    </div>

    <!-- Register Form -->
    <form id="register-form" novalidate>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-4);">
        <!-- First Name -->
        <div class="auth-form-group">
          <label for="reg-firstname" class="auth-label">First Name</label>
          <div class="auth-input-wrap no-icon">
            <input type="text" id="reg-firstname" class="auth-input" placeholder="Jane" required autocomplete="given-name">
          </div>
          <div class="auth-error" id="error-firstname"></div>
        </div>

        <!-- Last Name -->
        <div class="auth-form-group">
          <label for="reg-lastname" class="auth-label">Last Name</label>
          <div class="auth-input-wrap no-icon">
            <input type="text" id="reg-lastname" class="auth-input" placeholder="Doe" required autocomplete="family-name">
          </div>
          <div class="auth-error" id="error-lastname"></div>
        </div>
      </div>

      <!-- Email -->
      <div class="auth-form-group">
        <label for="reg-email" class="auth-label">Email Address</label>
        <div class="auth-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input type="email" id="reg-email" class="auth-input" placeholder="name@example.com" required autocomplete="email">
        </div>
        <div class="auth-error" id="error-email"></div>
      </div>

      <!-- Mobile Number -->
      <div class="auth-form-group">
        <label for="reg-mobile" class="auth-label">Mobile Number</label>
        <div class="auth-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          <input type="tel" id="reg-mobile" class="auth-input" placeholder="9876543210" required autocomplete="tel">
        </div>
        <div class="auth-error" id="error-mobile"></div>
      </div>

      <!-- Password -->
      <div class="auth-form-group">
        <label for="reg-password" class="auth-label">Password</label>
        <div class="auth-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input type="password" id="reg-password" class="auth-input" placeholder="At least 8 characters" required autocomplete="new-password">
          <button type="button" class="pwd-toggle-btn" tabindex="-1" aria-label="Toggle password visibility">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
        <div class="auth-error" id="error-password"></div>
      </div>

      <!-- Terms -->
      <div class="auth-meta-row" style="margin-bottom: var(--spacing-6);">
        <label class="auth-checkbox-wrap" style="align-items: flex-start;">
          <input type="checkbox" id="reg-terms" required style="margin-top: 2px;">
          <span style="color: var(--text-muted); font-size: 13px; line-height: 1.4;">
            I agree to the <a href="/terms" class="auth-link">Terms of Service</a> and <a href="/privacy" class="auth-link">Privacy Policy</a>.
          </span>
        </label>
      </div>

      <!-- Submit -->
      <button type="submit" class="auth-submit-btn" id="reg-submit-btn">
        Create Account
      </button>

    </form>

    <div class="auth-footer">
      Already have an account? <a href="/login" class="auth-link">Log In</a>
    </div>

  </div>
</div>
