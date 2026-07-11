<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px;">Manage Customers</div>

<!-- Filters Bar -->
<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
  <input type="text" id="admin-customer-search" class="form-input" placeholder="Search Name, Email, or Mobile..." style="width: 300px;">
  
  <select id="admin-customer-status-filter" class="form-input" style="width: 200px;">
    <option value="">All Accounts</option>
    <option value="active">Active</option>
    <option value="banned">Suspended</option>
  </select>

  <button class="btn btn-outline" id="admin-customer-filter-btn">Search</button>
</div>

<!-- Master Table -->
<div class="admin-table-wrapper" style="margin-bottom: 32px;">
  <table class="admin-table">
    <thead>
      <tr>
        <th>Customer ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Mobile</th>
        <th>Registration Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="admin-customers-table">
      <tr><td colspan="7" style="text-align: center;">Loading customers...</td></tr>
    </tbody>
  </table>
</div>

<!-- Mount point for the Customer Details Modal -->
<div id="customer-modal-mount">
  <?php require_once COMPONENTS_PATH . '/admin/customer-details-modal.php'; ?>
</div>
