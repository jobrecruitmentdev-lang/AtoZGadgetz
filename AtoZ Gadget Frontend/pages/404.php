<?php
$page_title = "Page Not Found - AtoZ Gadget";
require_once COMPONENTS_PATH . '/header.php';
?>

<div class="container" style="padding: 100px 0; text-align: center;">
    <h1 style="font-size: 120px; font-weight: 800; color: var(--primary); margin: 0; line-height: 1;">404</h1>
    <h2 style="font-size: 32px; font-weight: 600; margin-bottom: 16px; color: var(--text-main);">Oops! Page Not Found</h2>
    <p style="font-size: 16px; color: var(--text-secondary); max-width: 500px; margin: 0 auto 32px auto;">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
    </p>
    <a href="/" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; font-size: 16px;">Return to Homepage</a>
</div>

<?php require_once COMPONENTS_PATH . '/footer.php'; ?>
