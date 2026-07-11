<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px;">Manage Orders</div>

<!-- Filters Bar -->
<div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
  <input type="text" id="admin-order-search" class="form-input" placeholder="Search Order ID or Customer..." style="width: 250px;">
  
  <select id="admin-order-status-filter" class="form-input" style="width: 200px;">
    <option value="">All Statuses</option>
    <option value="pending">Pending</option>
    <option value="confirmed">Confirmed</option>
    <option value="processing">Processing</option>
    <option value="shipped">Shipped</option>
    <option value="delivered">Delivered</option>
    <option value="cancelled">Cancelled</option>
    <option value="returned">Returned / Return Requested</option>
  </select>

  <select id="admin-order-sort" class="form-input" style="width: 200px;">
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="highest">Highest Amount</option>
  </select>

  <button class="btn btn-outline" id="admin-order-filter-btn">Apply Filters</button>
</div>

<!-- Master Table -->
<div class="admin-table-wrapper" style="margin-bottom: 32px;">
  <table class="admin-table">
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Date</th>
        <th>Payment</th>
        <th>Total Amount</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="admin-orders-table">
      <tr><td colspan="7" style="text-align: center;">Loading orders...</td></tr>
    </tbody>
  </table>
</div>

<!-- Mount point for the Order Details Modal -->
<div id="order-modal-mount">
  <?php require_once COMPONENTS_PATH . '/admin/order-details-modal.php'; ?>
</div>
