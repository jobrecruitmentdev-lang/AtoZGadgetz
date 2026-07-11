<div class="checkout-step" id="step-payment">
  <div class="checkout-step-header">
    <div class="step-number">2</div>
    <h2 class="step-title">Payment Method</h2>
  </div>
  <div class="checkout-step-body">
    
    <label class="payment-option selected" for="pay-cod">
      <input type="radio" name="payment_method" id="pay-cod" value="cod" checked>
      <div class="payment-details">
        <span class="payment-name">Cash on Delivery (COD)</span>
        <span class="payment-desc">Pay when your order arrives at your doorstep.</span>
      </div>
    </label>

    <label class="payment-option" for="pay-online">
      <input type="radio" name="payment_method" id="pay-online" value="online" disabled>
      <div class="payment-details">
        <span class="payment-name" style="opacity: 0.5;">Credit/Debit Card, UPI, Netbanking</span>
        <span class="payment-desc" style="opacity: 0.5;">Online payments are temporarily unavailable.</span>
      </div>
    </label>

  </div>
</div>
