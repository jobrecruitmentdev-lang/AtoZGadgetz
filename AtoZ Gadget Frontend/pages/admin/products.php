<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px; display: flex; justify-content: space-between; align-items: center;">
  <span>Manage Products</span>
  <button type="button" class="btn btn-primary" id="btn-admin-add-product">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add Product
  </button>
</div>

<div class="admin-table-wrapper">
  <table class="admin-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Image</th>
        <th>Name</th>
        <th>Price</th>
        <th>Stock</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="admin-products-table">
      <tr><td colspan="7" style="text-align: center;">Loading products...</td></tr>
    </tbody>
  </table>
</div>

<!-- Mount point for the Product Form Modal -->
<div id="product-modal-mount">
  <?php require_once COMPONENTS_PATH . '/admin/product-form-modal.php'; ?>
</div>
