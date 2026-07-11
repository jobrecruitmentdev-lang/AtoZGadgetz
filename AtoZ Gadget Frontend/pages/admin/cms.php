<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px;">CMS & Media Manager</div>

<!-- CMS Tabs -->
<div style="display: flex; gap: var(--spacing-4); margin-bottom: 24px; border-bottom: 1px solid var(--border-light);">
  <button class="cms-tab active" data-tab="cms-banners">Banners & Promotions</button>
  <button class="cms-tab" data-tab="cms-media">Media Library</button>
</div>

<style>
  .cms-tab { background: none; border: none; padding: 12px 16px; font-weight: 600; font-size: 14px; color: var(--text-muted); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
  .cms-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
  .cms-panel { display: none; }
  .cms-panel.active { display: block; }
  
  .media-card { background: var(--surface); border: 1px solid var(--border-light); border-radius: 8px; overflow: hidden; position: relative; }
  .media-card img { width: 100%; height: 140px; object-fit: cover; display: block; border-bottom: 1px solid var(--border-light); }
  .media-actions { display: flex; justify-content: space-between; padding: 8px; }
</style>

<!-- TAB 1: BANNERS -->
<div id="cms-banners" class="cms-panel active">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <p style="color: var(--text-secondary);">Manage hero sliders and promotional grid banners.</p>
    <button class="btn btn-primary" onclick="window.adminCmsManager.openBannerModal()">+ Create Banner</button>
  </div>

  <div class="admin-table-wrapper" style="margin-bottom: 32px;">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Preview</th>
          <th>Title & Subtitle</th>
          <th>Section</th>
          <th>Target URL</th>
          <th>Order</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="admin-banners-table">
        <tr><td colspan="7" style="text-align: center;">Loading banners...</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- TAB 2: MEDIA LIBRARY -->
<div id="cms-media" class="cms-panel">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <p style="color: var(--text-secondary);">Global media assets available across the storefront.</p>
    <form id="cms-media-upload-form" style="display: flex; gap: 8px;">
      <input type="file" name="file" class="form-input" style="padding: 4px;" required accept="image/*">
      <button type="submit" class="btn btn-outline" id="cms-media-upload-btn">Upload</button>
    </form>
  </div>

  <div id="admin-media-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
    <!-- Media cards injected here -->
    <div style="grid-column: 1/-1; text-align: center;">Loading media...</div>
  </div>
</div>

<!-- Mount point for Banner Modal -->
<div id="cms-modal-mount">
  <?php require_once COMPONENTS_PATH . '/admin/banner-form-modal.php'; ?>
</div>
