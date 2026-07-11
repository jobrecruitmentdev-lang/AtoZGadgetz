<!-- Category Modal -->
<div id="admin-category-modal" class="modal" aria-hidden="true" style="z-index: 99999;">
  <div class="modal-dialog" style="max-width: 500px; width: 90%;">
    <div class="modal-header">
      <h3 class="modal-title" id="category-modal-title">Category</h3>
      <button type="button" class="modal-close" data-dismiss="modal">&times;</button>
    </div>
    <div class="modal-body">
      <form id="admin-category-form">
        <input type="hidden" id="cat-id">
        <input type="hidden" id="cat-mode" value="category"> <!-- 'category' or 'subcategory' -->
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Name</label>
          <input type="text" id="cat-name" class="form-input" required>
        </div>

        <div class="form-group" id="cat-desc-group" style="margin-bottom: 16px;">
          <label class="form-label">Description</label>
          <textarea id="cat-desc" class="form-input" rows="3"></textarea>
        </div>

        <div class="form-group" id="cat-parent-group" style="margin-bottom: 16px; display: none;">
          <label class="form-label">Parent Category ID</label>
          <input type="number" id="cat-parent-id" class="form-input">
        </div>

        <div class="form-group" id="cat-image-group" style="margin-bottom: 24px;">
          <label class="form-label">Image (Optional)</label>
          <div style="display: flex; gap: 8px;">
            <input type="file" id="cat-image-upload" accept="image/*" style="display: none;">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('cat-image-upload').click()" style="flex: 1;">Upload Image</button>
          </div>
          <input type="hidden" id="cat-image-url">
          <div id="cat-image-preview" style="margin-top: 12px; display: none;">
             <img src="" style="max-width: 100px; border-radius: 4px; border: 1px solid var(--admin-border);">
          </div>
        </div>

        <div style="text-align: right;">
          <button type="submit" class="btn btn-primary" id="btn-cat-save">Save Category</button>
        </div>
      </form>
    </div>
  </div>
</div>
