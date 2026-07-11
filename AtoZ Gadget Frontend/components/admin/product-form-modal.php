<!-- Product Form Modal -->
<div id="admin-product-modal" class="modal" aria-hidden="true" style="z-index: 99999;">
  <div class="modal-dialog" style="max-width: 800px; width: 90%; max-height: 90vh; display: flex; flex-direction: column;">
    
    <div class="modal-header" style="flex-shrink: 0;">
      <h3 class="modal-title" id="product-modal-title">Create Product</h3>
      <button type="button" class="modal-close" data-dismiss="modal">&times;</button>
    </div>

    <!-- Custom Modal Tabs -->
    <div style="display: flex; gap: var(--spacing-4); padding: 0 var(--spacing-6); border-bottom: 1px solid var(--border-light); background: var(--surface);">
      <button class="pm-tab active" data-tab="pm-info">Basic Info</button>
      <button class="pm-tab" data-tab="pm-images" id="tab-pm-images" disabled>Images</button>
      <button class="pm-tab" data-tab="pm-variants" id="tab-pm-variants" disabled>Variants</button>
      <button class="pm-tab" data-tab="pm-attributes" id="tab-pm-attributes" disabled>Specifications</button>
    </div>

    <style>
      .pm-tab {
        background: none; border: none; padding: 12px 4px; font-weight: 600; font-size: 14px;
        color: var(--text-muted); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s;
      }
      .pm-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
      .pm-tab:disabled { opacity: 0.4; cursor: not-allowed; }
      .pm-panel { display: none; padding: var(--spacing-6); overflow-y: auto; flex: 1; }
      .pm-panel.active { display: block; }
    </style>

    <div class="modal-body" style="padding: 0; display: flex; flex-direction: column; overflow: hidden; flex: 1; background: var(--background);">
      
      <!-- TAB 1: BASIC INFO -->
      <div id="pm-info" class="pm-panel active">
        <form id="pm-info-form">
          <input type="hidden" id="pm-id">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Product Name</label>
            <input type="text" id="pm-name" class="form-input" required>
          </div>
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Slug</label>
            <input type="text" id="pm-slug" class="form-input" required>
          </div>
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Description</label>
            <textarea id="pm-desc" class="form-input" rows="4" required></textarea>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Base Price</label>
              <input type="number" step="0.01" id="pm-price" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Stock Quantity</label>
              <input type="number" id="pm-stock" class="form-input" required>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Category ID</label>
              <input type="number" id="pm-cat-id" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Brand ID</label>
              <input type="number" id="pm-brand-id" class="form-input" required>
            </div>
          </div>
          
          <div style="margin-top: 24px; text-align: right;">
            <button type="submit" class="btn btn-primary" id="btn-pm-save">Save & Continue</button>
          </div>
        </form>
      </div>

      <!-- TAB 2: IMAGES -->
      <div id="pm-images" class="pm-panel">
        <div style="margin-bottom: 16px; padding: 24px; border: 2px dashed var(--border); border-radius: 8px; text-align: center; background: var(--surface);">
          <input type="file" id="pm-image-upload" accept="image/*" style="display: none;">
          <button type="button" class="btn btn-outline" onclick="document.getElementById('pm-image-upload').click()">Select Image</button>
          <div style="margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;">
             <input type="checkbox" id="pm-image-primary"> <label for="pm-image-primary" style="font-size: 12px;">Set as Primary Cover</label>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 16px;" id="pm-image-list">
          <!-- Images rendered via JS -->
        </div>
      </div>

      <!-- TAB 3: VARIANTS -->
      <div id="pm-variants" class="pm-panel">
        <form id="pm-variant-form" style="display: flex; gap: 8px; margin-bottom: 24px; align-items: flex-end;">
          <div style="flex: 1;">
            <label class="form-label">Variant Name (e.g., 256GB Black)</label>
            <input type="text" id="pm-var-name" class="form-input" required>
          </div>
          <div style="width: 120px;">
            <label class="form-label">Price Modifier</label>
            <input type="number" step="0.01" id="pm-var-price" class="form-input" placeholder="+0.00" value="0">
          </div>
          <button type="submit" class="btn btn-outline" style="height: 38px;">Add</button>
        </form>
        <div id="pm-variant-list" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Variants via JS -->
        </div>
      </div>

      <!-- TAB 4: SPECIFICATIONS -->
      <div id="pm-attributes" class="pm-panel">
        <form id="pm-attr-form" style="display: flex; gap: 8px; margin-bottom: 24px; align-items: flex-end;">
          <div style="flex: 1;">
            <label class="form-label">Key (e.g., Processor)</label>
            <input type="text" id="pm-attr-key" class="form-input" required>
          </div>
          <div style="flex: 2;">
            <label class="form-label">Value (e.g., Apple M2)</label>
            <input type="text" id="pm-attr-val" class="form-input" required>
          </div>
          <button type="submit" class="btn btn-outline" style="height: 38px;">Add</button>
        </form>
        <div id="pm-attr-list" style="display: flex; flex-direction: column; gap: 8px;">
          <!-- Attributes via JS -->
        </div>
      </div>

    </div>
  </div>
</div>
