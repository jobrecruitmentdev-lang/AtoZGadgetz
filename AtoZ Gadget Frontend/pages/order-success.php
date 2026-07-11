<?php
declare(strict_types=1);

$orderId = $_GET['id'] ?? '';
if (!$orderId) {
    header('Location: /account#orders');
    exit;
}
?>
<div class="container" style="min-height: calc(100vh - var(--navbar-height)); display: flex; align-items: center; justify-content: center; padding: var(--spacing-10) var(--spacing-4);">
  <div class="card" style="max-width: 500px; text-align: center; padding: var(--spacing-8); border-top: 4px solid var(--success);">
    
    <div style="width: 64px; height: 64px; background: rgba(34, 197, 94, 0.1); color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--spacing-6);">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>

    <h1 style="font-size: var(--text-2xl); font-weight: 800; margin-bottom: var(--spacing-2);">Order Confirmed!</h1>
    <p class="text-muted" style="margin-bottom: var(--spacing-6);">
      Thank you for your purchase. Your order <strong>#<?php echo htmlspecialchars($orderId); ?></strong> has been successfully placed.
    </p>

    <div style="background: var(--background); padding: var(--spacing-4); border-radius: var(--radius-md); margin-bottom: var(--spacing-8); text-align: left;">
      <p style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: 4px;">What happens next?</p>
      <ul style="font-size: var(--text-sm); margin-left: 16px; color: var(--text);">
        <li style="margin-bottom: 4px;">We've sent a confirmation email with order details.</li>
        <li>You will receive a notification when your order ships.</li>
      </ul>
    </div>

    <div style="display: flex; gap: var(--spacing-4); justify-content: center;">
      <a href="/products" class="btn btn-outline">Continue Shopping</a>
      <a href="/account#orders/<?php echo htmlspecialchars($orderId); ?>" class="btn btn-primary">Track Order</a>
    </div>

  </div>
</div>
