<div class="view-header">
  <h2 class="view-title">Profile Settings</h2>
  <p class="view-subtitle">Manage your personal details and account security.</p>
</div>

<form id="profile-form">
  <div class="account-form-grid">
    <div class="form-group">
      <label for="prof-fname" class="form-label">First Name</label>
      <input type="text" id="prof-fname" class="form-input" required>
    </div>
    <div class="form-group">
      <label for="prof-lname" class="form-label">Last Name</label>
      <input type="text" id="prof-lname" class="form-input" required>
    </div>
  </div>

  <div class="account-form-grid">
    <div class="form-group">
      <label for="prof-email" class="form-label">Email Address</label>
      <input type="email" id="prof-email" class="form-input" disabled style="opacity: 0.7; cursor: not-allowed;">
      <small style="color: var(--text-muted); font-size: 11px;">Email cannot be changed.</small>
    </div>
    <div class="form-group">
      <label for="prof-phone" class="form-label">Phone Number</label>
      <input type="tel" id="prof-phone" class="form-input" placeholder="+1 (555) 000-0000">
    </div>
  </div>

  <div class="form-group" style="margin-top: var(--spacing-6);">
    <button type="submit" class="btn btn-primary" id="prof-submit-btn" style="min-width: 150px;">
      Save Changes
    </button>
  </div>
</form>
