<!-- Banner Form Modal -->
<div id="admin-banner-modal" class="modal" aria-hidden="true">
  <div class="modal-dialog" style="max-width: 500px;">
    <form id="admin-banner-form">
      <input type="hidden" id="banner_id" name="id">
      
      <div class="modal-header">
        <h3 class="modal-title" id="banner-modal-title">Create Banner</h3>
        <button type="button" class="modal-close" data-dismiss="modal">&times;</button>
      </div>

      <div class="modal-body">
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="banner_title">Main Title</label>
          <input type="text" id="banner_title" name="title" class="form-input" required>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="banner_subtitle">Subtitle (Optional)</label>
          <input type="text" id="banner_subtitle" name="subtitle" class="form-input">
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="banner_target_url">Target URL Link</label>
          <input type="text" id="banner_target_url" name="target_url" class="form-input" required placeholder="/products?category=1">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label" for="banner_section">Page Section</label>
            <select id="banner_section" name="section" class="form-input" required>
              <option value="hero">Hero Slider (Top)</option>
              <option value="grid">Promotional Grid</option>
              <option value="sidebar">Sidebar Banner</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="banner_display_order">Display Order</label>
            <input type="number" id="banner_display_order" name="display_order" class="form-input" value="0">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="banner_image">Banner Image</label>
          <input type="file" id="banner_image" name="image" class="form-input" accept="image/*">
          <small id="banner_image_help" style="color: var(--text-muted);">Leave blank to keep existing image</small>
        </div>

        <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="banner_is_active" name="is_active" value="true" checked>
          <label for="banner_is_active" style="margin: 0; font-size: 14px;">Active (Visible on storefront)</label>
        </div>

      </div>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; padding: 16px;">
        <button type="button" class="btn btn-outline" data-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary" id="admin-banner-submit">Save Banner</button>
      </div>

    </form>
  </div>
</div>
