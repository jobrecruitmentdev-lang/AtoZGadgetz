<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px; display: flex; justify-content: space-between; align-items: center;">
  <span>Manage Categories</span>
  <button type="button" class="btn btn-primary" id="btn-admin-add-category">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add Category
  </button>
</div>

<div class="admin-table-wrapper" style="margin-bottom: 32px;">
  <h3 style="padding: 16px; border-bottom: 1px solid var(--admin-border); margin: 0; background: var(--admin-surface);">Primary Categories</h3>
  <table class="admin-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Image</th>
        <th>Name</th>
        <th>Description</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="admin-categories-table">
      <tr><td colspan="6" style="text-align: center;">Loading categories...</td></tr>
    </tbody>
  </table>
</div>

<div class="admin-header-title" style="margin-bottom: 24px; font-size: 20px; display: flex; justify-content: space-between; align-items: center;">
  <span>Manage SubCategories</span>
  <button type="button" class="btn btn-outline" id="btn-admin-add-subcategory">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add SubCategory
  </button>
</div>

<div class="admin-table-wrapper">
  <table class="admin-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>SubCategory Name</th>
        <th>Parent Category ID</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="admin-subcategories-table">
      <tr><td colspan="5" style="text-align: center;">Loading subcategories...</td></tr>
    </tbody>
  </table>
</div>

<!-- Mount point for Category Modal -->
<div id="category-modal-mount">
  <?php require_once COMPONENTS_PATH . '/admin/category-form-modal.php'; ?>
</div>
