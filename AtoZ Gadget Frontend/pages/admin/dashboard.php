<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px;">Dashboard Overview</div>

<div class="admin-stats-grid">
  <div class="admin-stat-card">
    <div class="admin-stat-title">Total Revenue</div>
    <div class="admin-stat-value" id="stat-revenue">$0.00</div>
  </div>
  <div class="admin-stat-card">
    <div class="admin-stat-title">Total Orders</div>
    <div class="admin-stat-value" id="stat-orders">0</div>
  </div>
  <div class="admin-stat-card">
    <div class="admin-stat-title">Total Customers</div>
    <div class="admin-stat-value" id="stat-customers">0</div>
  </div>
</div>

<div class="admin-chart-card">
  <div class="admin-stat-title" style="margin-bottom: 16px;">Revenue Over Time</div>
  <canvas id="salesChart" height="80"></canvas>
</div>

<div class="admin-table-wrapper">
  <div class="admin-stat-title" style="padding: 24px; border-bottom: 1px solid var(--admin-border); margin: 0;">Recent Orders</div>
  <table class="admin-table">
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Date</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody id="admin-recent-orders">
      <tr><td colspan="5" style="text-align: center;">Loading...</td></tr>
    </tbody>
  </table>
</div>
