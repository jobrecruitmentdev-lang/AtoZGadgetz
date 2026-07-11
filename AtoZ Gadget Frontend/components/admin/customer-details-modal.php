<!-- Customer Control Center Modal -->
<div id="admin-customer-modal" class="modal" aria-hidden="true" style="z-index: 99999;">
  <div class="modal-dialog" style="max-width: 900px; width: 95%; max-height: 90vh; display: flex; flex-direction: column;">
    
    <div class="modal-header" style="flex-shrink: 0; background: var(--surface); border-bottom: 1px solid var(--border-light);">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <h3 class="modal-title" id="customer-modal-title">Customer Profile</h3>
        <div>
          <button type="button" class="modal-close" data-dismiss="modal" style="position: static;">&times;</button>
        </div>
      </div>
    </div>

    <!-- Custom Modal Tabs -->
    <div style="display: flex; gap: var(--spacing-4); padding: 0 var(--spacing-6); border-bottom: 1px solid var(--border-light); background: var(--surface);">
      <button class="cm-tab active" data-tab="cm-summary">Profile & Access</button>
      <button class="cm-tab" data-tab="cm-addresses">Address Book</button>
      <button class="cm-tab" data-tab="cm-orders">Order History</button>
    </div>

    <style>
      .cm-tab { background: none; border: none; padding: 12px 4px; font-weight: 600; font-size: 14px; color: var(--text-muted); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
      .cm-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
      .cm-panel { display: none; padding: var(--spacing-6); overflow-y: auto; flex: 1; }
      .cm-panel.active { display: block; }
    </style>

    <div class="modal-body" style="padding: 0; display: flex; flex-direction: column; overflow: hidden; flex: 1; background: var(--background);">
      
      <!-- TAB 1: SUMMARY & ACCESS -->
      <div id="cm-summary" class="cm-panel active">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <!-- Basic Info -->
          <div style="background: var(--surface); border: 1px solid var(--border-light); border-radius: 8px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700;" id="cm-avatar-initials">
                --
              </div>
              <div>
                <h4 id="cm-full-name" style="margin: 0; font-size: 20px;">---</h4>
                <div id="cm-email" style="color: var(--text-secondary); margin-top: 4px;">---</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 100px 1fr; gap: 12px; font-size: 14px;">
              <span style="color: var(--text-muted);">Mobile:</span>
              <strong id="cm-mobile">---</strong>
              
              <span style="color: var(--text-muted);">Joined:</span>
              <strong id="cm-joined">---</strong>
              
              <span style="color: var(--text-muted);">User ID:</span>
              <strong id="cm-user-id">---</strong>
            </div>
          </div>

          <!-- Account Access Panel -->
          <div style="background: var(--surface); border: 1px solid var(--border-light); border-radius: 8px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <h4 style="margin-bottom: 8px; font-size: 16px;">Account Status</h4>
              <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">
                Controls whether this user can log into the storefront and place orders. Suspending an account forces a logout on their next request.
              </p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--background); border: 1px solid var(--border-light); border-radius: 6px;">
              <div>
                <span style="font-weight: 600; margin-right: 12px;">Current Status:</span>
                <span id="cm-status-badge" class="admin-badge">---</span>
              </div>
              <button id="cm-toggle-status-btn" class="btn" style="width: 140px;">Toggle Status</button>
            </div>
          </div>
        </div>

      </div>

      <!-- TAB 2: ADDRESS BOOK -->
      <div id="cm-addresses" class="cm-panel">
        <h4 style="margin-bottom: 16px;">Saved Shipping Addresses</h4>
        <div id="cm-address-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
          <!-- Addresses injected here -->
        </div>
      </div>

      <!-- TAB 3: ORDER HISTORY -->
      <div id="cm-orders" class="cm-panel">
        <h4 style="margin-bottom: 16px;">Lifetime Orders</h4>
        <div class="admin-table-wrapper" style="border: 1px solid var(--border-light);">
          <table class="admin-table" style="margin: 0;">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="cm-orders-table">
              <!-- Orders injected here -->
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</div>
