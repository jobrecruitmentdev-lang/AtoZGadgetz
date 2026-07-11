<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px; display: flex; justify-content: space-between; align-items: center;">
  <span>Manage Brands</span>
  <button type="button" class="btn btn-primary" id="btn-admin-add-brand">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add Brand
  </button>
</div>

<div class="admin-table-wrapper">
  <table class="admin-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Logo</th>
        <th>Brand Name</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="admin-brands-table">
      <tr><td colspan="5" style="text-align: center;">Loading brands...</td></tr>
    </tbody>
  </table>
</div>

<!-- Mount point for Brand Modal -->
<div id="brand-modal-mount">
  <?php require_once COMPONENTS_PATH . '/admin/brand-form-modal.php'; ?>
</div>
