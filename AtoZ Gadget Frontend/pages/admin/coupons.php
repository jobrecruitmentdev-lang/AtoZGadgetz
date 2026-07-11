<div class="admin-header-title" style="margin-bottom: 24px; font-size: 24px;">Manage Coupons</div>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
  <p style="color: var(--text-secondary);">Manage active discount codes and promotional campaigns.</p>
  <button class="btn btn-primary" onclick="window.adminCouponManager.openCreateModal()">+ Create Coupon</button>
</div>

<div class="admin-table-wrapper" style="margin-bottom: 32px;">
  <table class="admin-table">
    <thead>
      <tr>
        <th>Code</th>
        <th>Type</th>
        <th>Discount</th>
        <th>Min Purchase</th>
        <th>Valid Period</th>
        <th>Limit</th>
      </tr>
    </thead>
    <tbody id="admin-coupons-table">
      <tr><td colspan="6" style="text-align: center;">Loading coupons...</td></tr>
    </tbody>
  </table>
</div>

<!-- Mount point for Coupon form -->
<div id="coupon-modal-mount">
  <?php require_once COMPONENTS_PATH . '/admin/coupon-form-modal.php'; ?>
</div>
