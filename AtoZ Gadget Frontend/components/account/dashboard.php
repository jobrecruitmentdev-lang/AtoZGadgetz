<div class="view-header">
  <h2 class="view-title">Dashboard Overview</h2>
  <p class="view-subtitle">Welcome back, <span id="dash-greeting-name">User</span>! Here is a summary of your account.</p>
</div>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    </div>
    <div class="stat-info">
      <div class="value" id="stat-orders-count">0</div>
      <div class="label">Total Orders</div>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-icon" style="background: rgba(21, 128, 61, 0.1); color: #15803d;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>
    <div class="stat-info">
      <div class="value" id="stat-orders-delivered">0</div>
      <div class="label">Delivered</div>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-icon" style="background: rgba(217, 119, 6, 0.1); color: #d97706;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    </div>
    <div class="stat-info">
      <div class="value" id="stat-orders-pending">0</div>
      <div class="label">Pending</div>
    </div>
  </div>
</div>

<h3 style="margin-bottom: var(--spacing-4); font-size: var(--text-lg); font-weight: 700;">Recent Orders</h3>
<div id="dash-recent-orders" class="order-list">
  <div class="empty-state">Loading recent orders...</div>
</div>
