<?php
declare(strict_types=1);
?>
<div class="auth-page-wrapper">
  <div class="auth-card">
    
    <div class="auth-header">
      <h1 class="auth-title">Reset Password</h1>
      <p class="auth-subtitle">Create a new, strong password for your account.</p>
    </div>

    <!-- Reset Password Form -->
    <form id="reset-password-form" novalidate>
      
      <input type="hidden" id="reset-token" value="<?php echo htmlspecialchars($_GET['token'] ?? ''); ?>">

      <!-- New Password -->
      <div class="auth-form-group">
        <label for="reset-password" class="auth-label">New Password</label>
        <div class="auth-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input type="password" id="reset-password" class="auth-input" placeholder="At least 8 characters" required autocomplete="new-password" autofocus>
          <button type="button" class="pwd-toggle-btn" tabindex="-1" aria-label="Toggle password visibility">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
        <div class="auth-error" id="error-password"></div>
      </div>

      <!-- Confirm Password -->
      <div class="auth-form-group">
        <label for="reset-confirm" class="auth-label">Confirm New Password</label>
        <div class="auth-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input type="password" id="reset-confirm" class="auth-input" placeholder="Re-enter password" required autocomplete="new-password">
        </div>
        <div class="auth-error" id="error-confirm"></div>
      </div>

      <!-- Submit -->
      <button type="submit" class="auth-submit-btn" id="reset-submit-btn">
        Reset Password
      </button>

    </form>

  </div>
</div>
