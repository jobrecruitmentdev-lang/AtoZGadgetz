<aside class="account-sidebar">
  
  <div class="account-user-card">
    <div class="account-avatar" id="sidebar-avatar">U</div>
    <div class="account-user-info">
      <div class="name" id="sidebar-name">Loading...</div>
      <div class="email" id="sidebar-email">...</div>
    </div>
  </div>

  <nav class="account-nav">
    <a href="#dashboard" class="account-nav-item active" data-target="view-dashboard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      Dashboard Overview
    </a>

    <a href="#orders" class="account-nav-item" data-target="view-orders">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      My Orders
    </a>

    <a href="#addresses" class="account-nav-item" data-target="view-addresses">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      Manage Addresses
    </a>

    <a href="#profile" class="account-nav-item" data-target="view-profile">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      Profile Settings
    </a>

    <button type="button" class="account-nav-item logout" id="btn-logout">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      Sign Out
    </button>
  </nav>

</aside>
