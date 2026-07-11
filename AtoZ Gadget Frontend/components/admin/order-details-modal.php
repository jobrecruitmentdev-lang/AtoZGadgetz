<!-- Order Control Center Modal -->
<div id="admin-order-modal" class="modal" aria-hidden="true" style="z-index: 99999;">
  <div class="modal-dialog" style="max-width: 1000px; width: 95%; max-height: 90vh; display: flex; flex-direction: column;">
    
    <div class="modal-header" style="flex-shrink: 0; background: var(--surface); border-bottom: 1px solid var(--border-light);">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <h3 class="modal-title" id="order-modal-title">Order #---</h3>
        <div>
          <button type="button" class="btn btn-outline" onclick="window.adminOrderManager.printInvoice()" style="margin-right: 12px;">Print Invoice</button>
          <button type="button" class="modal-close" data-dismiss="modal" style="position: static;">&times;</button>
        </div>
      </div>
    </div>

    <!-- Custom Modal Tabs -->
    <div style="display: flex; gap: var(--spacing-4); padding: 0 var(--spacing-6); border-bottom: 1px solid var(--border-light); background: var(--surface);">
      <button class="om-tab active" data-tab="om-summary">Summary</button>
      <button class="om-tab" data-tab="om-shipment">Shipment / Tracking</button>
      <button class="om-tab" data-tab="om-returns">Returns</button>
    </div>

    <style>
      .om-tab { background: none; border: none; padding: 12px 4px; font-weight: 600; font-size: 14px; color: var(--text-muted); border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
      .om-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
      .om-panel { display: none; padding: var(--spacing-6); overflow-y: auto; flex: 1; }
      .om-panel.active { display: block; }
      .print-only { display: none; }
      
      @media print {
        body * { visibility: hidden; }
        #invoice-print-area, #invoice-print-area * { visibility: visible; }
        #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; background: white; color: black; }
        .modal { display: none !important; }
        .om-tab, .modal-header button { display: none !important; }
      }
    </style>

    <div class="modal-body" style="padding: 0; display: flex; flex-direction: column; overflow: hidden; flex: 1; background: var(--background);">
      
      <!-- TAB 1: SUMMARY -->
      <div id="om-summary" class="om-panel active">
        
        <!-- Workflow Controls -->
        <div style="background: var(--surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border-light); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Current Status:</strong> <span id="om-current-status" class="admin-badge">...</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <select id="om-status-select" class="form-input" style="width: 150px; height: 38px;">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button class="btn btn-primary" onclick="window.adminOrderManager.updateStatus()">Update Status</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left Col -->
          <div>
            <h4 style="margin-bottom: 16px;">Order Items</h4>
            <div id="om-items-list" style="background: var(--surface); border: 1px solid var(--border-light); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              Loading items...
            </div>
          </div>
          
          <!-- Right Col -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div style="background: var(--surface); border: 1px solid var(--border-light); border-radius: 8px; padding: 16px;">
              <h4 style="margin-bottom: 12px; font-size: 14px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">Customer</h4>
              <div id="om-customer-info" style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;"></div>
            </div>

            <div style="background: var(--surface); border: 1px solid var(--border-light); border-radius: 8px; padding: 16px;">
              <h4 style="margin-bottom: 12px; font-size: 14px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">Shipping Address</h4>
              <div id="om-address-info" style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;"></div>
            </div>

            <div style="background: var(--surface); border: 1px solid var(--border-light); border-radius: 8px; padding: 16px;">
              <h4 style="margin-bottom: 12px; font-size: 14px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">Financials</h4>
              <div id="om-financial-info" style="font-size: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;"></div>
            </div>
          </div>
        </div>

      </div>

      <!-- TAB 2: SHIPMENT -->
      <div id="om-shipment" class="om-panel">
        
        <div id="om-shipment-create-container" style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light); margin-bottom: 24px; display: none;">
          <h4 style="margin-bottom: 16px;">Create Shipment</h4>
          <form id="om-shipment-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <input type="hidden" id="om-ship-order-id">
            <div class="form-group">
              <label class="form-label">Courier Partner</label>
              <input type="text" id="om-ship-courier" class="form-input" required placeholder="e.g. FedEx">
            </div>
            <div class="form-group">
              <label class="form-label">Tracking Number</label>
              <input type="text" id="om-ship-tracking" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Tracking URL (Optional)</label>
              <input type="url" id="om-ship-url" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Estimated Delivery</label>
              <input type="datetime-local" id="om-ship-est" class="form-input">
            </div>
            <div style="grid-column: 1 / -1; text-align: right;">
              <button type="submit" class="btn btn-primary">Dispatch Shipment</button>
            </div>
          </form>
        </div>

        <div id="om-shipment-details-container" style="display: none;">
          <div style="background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--border-light);">
            <h4 style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
              Active Shipment
              <span id="om-ship-status-badge" class="admin-badge">In Transit</span>
            </h4>
            <div id="om-ship-details-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 14px;"></div>
            
            <div style="border-top: 1px solid var(--border-light); padding-top: 16px; display: flex; gap: 8px; align-items: flex-end;">
              <div style="flex: 1;">
                <label class="form-label">Update Shipment Status</label>
                <select id="om-ship-status-select" class="form-input">
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="exception">Exception / Delayed</option>
                </select>
              </div>
              <button class="btn btn-outline" onclick="window.adminOrderManager.updateShipment()">Update</button>
            </div>
          </div>
        </div>

      </div>

      <!-- TAB 3: RETURNS -->
      <div id="om-returns" class="om-panel">
        <div id="om-returns-empty" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No return request exists for this order.
        </div>
        
        <div id="om-returns-content" style="display: none; background: var(--surface); padding: 24px; border-radius: 8px; border: 1px solid var(--danger);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h4 style="color: var(--danger); margin: 0;">Return Request Pending</h4>
            <span id="om-return-status-badge" class="admin-badge danger">Requested</span>
          </div>
          
          <div style="margin-bottom: 24px; font-size: 14px; color: var(--text-secondary);">
            <strong>Reason provided by customer:</strong>
            <p id="om-return-reason" style="margin-top: 8px; padding: 12px; background: var(--background); border-radius: 4px; border: 1px solid var(--border-light);"></p>
          </div>

          <div style="display: flex; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 24px;">
            <button class="btn btn-primary" style="background: var(--success); border-color: var(--success);" onclick="window.adminOrderManager.handleReturn('approved')">Approve Return</button>
            <button class="btn btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="window.adminOrderManager.handleReturn('rejected')">Reject Return</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- Hidden Print Area for Invoice -->
<div id="invoice-print-area" class="print-only"></div>
