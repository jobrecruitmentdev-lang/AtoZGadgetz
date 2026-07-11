<?php
declare(strict_types=1);
?>
<div class="auth-page-wrapper">
  <div class="auth-card">
    
    <div class="auth-header">
      <h1 class="auth-title">Welcome Back</h1>
      <p class="auth-subtitle">Log in to manage your premium orders and wishlist</p>
    </div>

    <!-- Login Form -->
    <form id="login-form" novalidate>
      
      <!-- Email -->
      <div class="auth-form-group">
        <label for="login-email" class="auth-label">Email Address</label>
        <div class="auth-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input type="email" id="login-email" class="auth-input" placeholder="name@example.com" required autocomplete="email" autofocus>
        </div>
        <div class="auth-error" id="error-email"></div>
      </div>

      <!-- Password -->
      <div class="auth-form-group">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <label for="login-password" class="auth-label">Password</label>
          <a href="/forgot-password" class="auth-link text-xs">Forgot Password?</a>
        </div>
        <div class="auth-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input type="password" id="login-password" class="auth-input" placeholder="••••••••" required autocomplete="current-password">
          <button type="button" class="pwd-toggle-btn" tabindex="-1" aria-label="Toggle password visibility">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
        <div class="auth-error" id="error-password"></div>
      </div>

      <!-- Remember Me -->
      <div class="auth-meta-row">
        <label class="auth-checkbox-wrap">
          <input type="checkbox" id="login-remember">
          <span style="color: var(--text);">Remember me for 30 days</span>
        </label>
      </div>

      <!-- Submit -->
      <button type="submit" class="auth-submit-btn" id="login-submit-btn">
        Log In
      </button>

    </form>

    <div class="auth-footer">
      Don't have an account? <a href="/register" class="auth-link">Create Account</a>
    </div>

  </div>
</div>
