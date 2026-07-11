<!-- Brand Modal -->
<div id="admin-brand-modal" class="modal" aria-hidden="true" style="z-index: 99999;">
  <div class="modal-dialog" style="max-width: 500px; width: 90%;">
    <div class="modal-header">
      <h3 class="modal-title" id="brand-modal-title">Brand</h3>
      <button type="button" class="modal-close" data-dismiss="modal">&times;</button>
    </div>
    <div class="modal-body">
      <form id="admin-brand-form">
        <input type="hidden" id="brand-id">
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Brand Name</label>
          <input type="text" id="brand-name" class="form-input" required>
        </div>

        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label">Logo (Optional)</label>
          <div style="display: flex; gap: 8px;">
            <input type="file" id="brand-logo-upload" accept="image/*" style="display: none;">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('brand-logo-upload').click()" style="flex: 1;">Upload Logo</button>
          </div>
          <input type="hidden" id="brand-logo-url">
          <div id="brand-logo-preview" style="margin-top: 12px; display: none;">
             <img src="" style="max-width: 100px; border-radius: 4px; border: 1px solid var(--admin-border);">
          </div>
        </div>

        <div style="text-align: right;">
          <button type="submit" class="btn btn-primary" id="btn-brand-save">Save Brand</button>
        </div>
      </form>
    </div>
  </div>
</div>
