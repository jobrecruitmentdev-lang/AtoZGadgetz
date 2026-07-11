<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Admin | AtoZ Gadget</title>
    <!-- Base styles for reset -->
    <link rel="stylesheet" href="<?php echo asset_url('css/base/reset.css'); ?>">
    <link rel="stylesheet" href="<?php echo asset_url('css/base/variables.css'); ?>">
    <link rel="stylesheet" href="<?php echo asset_url('css/base/typography.css'); ?>">
    <link rel="stylesheet" href="<?php echo asset_url('css/components/button.css'); ?>">
    <link rel="stylesheet" href="<?php echo asset_url('css/components/toast.css'); ?>">
    
    <!-- Admin isolated styles -->
    <link rel="stylesheet" href="<?php echo asset_url('css/pages/admin.css'); ?>">
    
    <!-- Chart.js from CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="admin-mode">
    
    <div id="admin-auth-guard" style="position: fixed; inset: 0; background: var(--admin-bg); z-index: 9999; display: flex; align-items: center; justify-content: center; flex-direction: column;">
        <div style="width: 40px; height: 40px; border: 3px solid var(--admin-border); border-top-color: var(--admin-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div style="margin-top: 16px; font-weight: 600; color: var(--admin-text-muted);">Authorizing Admin...</div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    </div>

    <div class="admin-layout" id="admin-app" style="opacity: 0; transition: opacity 0.3s;">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
            <a href="/admin" class="admin-brand">AtoZ Admin</a>
            <nav class="admin-nav">
                <a href="#dashboard" class="admin-nav-item active" data-target="view-dashboard">Dashboard</a>
                <a href="#orders" class="admin-nav-item" data-target="view-orders">Orders</a>
                <a href="#products" class="admin-nav-item" data-target="view-products">Products</a>
                <a href="#categories" class="admin-nav-item" data-target="view-categories">Categories</a>
                <a href="#brands" class="admin-nav-item" data-target="view-brands">Brands</a>
                <a href="#customers" class="admin-nav-item" data-target="view-customers">Customers</a>
                <a href="#coupons" class="admin-nav-item" data-target="view-coupons">Coupons</a>
                <a href="#cms" class="admin-nav-item" data-target="view-cms">CMS & Media</a>
                <a href="#inventory" class="admin-nav-item" data-target="view-inventory">Inventory</a>
                <a href="#analytics" class="admin-nav-item" data-target="view-analytics">Analytics & BI</a>
                <a href="#system" class="admin-nav-item" data-target="view-system">Security & System</a>
                <a href="/" class="admin-nav-item" style="margin-top: auto;">Return to Store</a>
                <button type="button" class="admin-nav-item" id="admin-logout" style="background:none; border:none; width:100%; text-align:left; cursor:pointer;">Sign Out</button>
            </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="admin-main">
            <header class="admin-header">
                <h1 class="admin-header-title" id="admin-page-title">Dashboard</h1>
                <div style="font-weight: 600; font-size: 14px; color: var(--admin-text-muted);" id="admin-user-name">Admin</div>
            </header>

            <div class="admin-content">
                
                <div id="view-dashboard" class="admin-view active">
                    <?php require_once 'dashboard.php'; ?>
                </div>

                <div id="view-orders" class="admin-view">
                    <?php require_once 'orders.php'; ?>
                </div>

                <div id="view-products" class="admin-view">
                    <?php require_once 'products.php'; ?>
                </div>

                <div id="view-categories" class="admin-view">
                    <?php require_once 'categories.php'; ?>
                </div>

                <div id="view-brands" class="admin-view">
                    <?php require_once 'brands.php'; ?>
                </div>

                <div id="view-customers" class="admin-view">
                    <?php require_once 'customers.php'; ?>
                </div>

                <div id="view-coupons" class="admin-view">
                    <?php require_once 'coupons.php'; ?>
                </div>

                <div id="view-cms" class="admin-view">
                    <?php require_once 'cms.php'; ?>
                </div>

                <div id="view-inventory" class="admin-view">
                    <?php require_once 'inventory.php'; ?>
                </div>

                <div id="view-analytics" class="admin-view">
                    <?php require_once 'analytics.php'; ?>
                </div>

                <div id="view-system" class="admin-view">
                    <?php require_once 'system.php'; ?>
                </div>
            </div>
        </main>
    </div>

    <!-- Core App Logic -->
    <script type="module" src="<?php echo asset_url('js/modules/session.js'); ?>"></script>
    <script type="module" src="<?php echo asset_url('js/admin/app.js'); ?>"></script>

</body>
</html>
