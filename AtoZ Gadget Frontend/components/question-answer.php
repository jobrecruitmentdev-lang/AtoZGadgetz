<?php
declare(strict_types=1);
?>
<!-- Customer Q&A Portal -->
<div class="qna-block" style="margin-top: var(--spacing-10); border-top: 1px solid var(--border-light); padding-top: var(--spacing-8);">
  <h3 class="font-semibold text-xl" style="margin-bottom: var(--spacing-4);">Questions & Answers</h3>
  
  <!-- Form to Ask Question -->
  <form id="pdp-qna-form" style="display: flex; gap: var(--spacing-2); margin-bottom: var(--spacing-6);">
    <input type="text" id="pdp-qna-input" class="form-control text-sm" placeholder="Have a question about technical details?" required style="height: 38px;">
    <button type="submit" class="btn btn-secondary btn-sm" id="pdp-qna-btn" style="height: 38px; min-width: 100px;">Ask</button>
  </form>
  
  <!-- Seeded list of QA entries -->
  <div id="pdp-qna-list" style="display: flex; flex-direction: column; gap: var(--spacing-4);">
    <div class="qna-item" style="border-bottom: 1px solid var(--border-light); padding-bottom: var(--spacing-3);">
      <p class="font-bold text-sm" style="color: var(--text);"><span style="color: var(--primary); font-weight: 800;">Q:</span> Does it support international warranty?</p>
      <p class="text-sm text-muted" style="margin-top: 4px;"><span style="font-weight: 600; color: var(--text);">A:</span> Yes, this product includes a 1-year official brand manufacturer warranty valid at local brand outlets.</p>
    </div>
    <div class="qna-item" style="border-bottom: 1px solid var(--border-light); padding-bottom: var(--spacing-3);">
      <p class="font-bold text-sm" style="color: var(--text);"><span style="color: var(--primary); font-weight: 800;">Q:</span> What charger is recommended for optimum battery health?</p>
      <p class="text-sm text-muted" style="margin-top: 4px;"><span style="font-weight: 600; color: var(--text);">A:</span> For safety, use a 30W Power Delivery (PD) fast charger with official type-C cables.</p>
    </div>
  </div>
</div>
