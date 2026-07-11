<?php
declare(strict_types=1);

/**
 * XSS Mitigation escaping helper
 */
function escape(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/**
 * Format currency in Indian Rupees style (INR)
 */
function format_price(float|int|string $amount): string {
    $amount = (float) $amount;
    // Simple standard formatting with 2 decimals
    return CURRENCY_SYMBOL . ' ' . number_format($amount, 2, '.', ',');
}

/**
 * Clean asset URL path generator
 */
function asset_url(string $path): string {
    return '/public/assets/' . ltrim($path, '/') . '?v=' . ASSETS_VERSION;
}

/**
 * Clean absolute link builder
 */
function url(string $path): string {
    return '/' . ltrim($path, '/');
}

/**
 * Generate standard and dynamic SEO Meta structures for any view
 */
function get_seo_meta(string $page, array $data = []): array {
    $siteName = APP_NAME;
    $defaultTitle = "AtoZ Gadgets — Premium Electronics & Accessories";
    $defaultDesc = "Discover premium gadgets, smartphones, smart home appliances, and custom electronics at AtoZ Gadgets. Experience seamless shopping, fast shipping, and exceptional support.";
    
    $canonicalUrl = "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    
    $seo = [
        'title' => $defaultTitle,
        'description' => $defaultDesc,
        'canonical' => $canonicalUrl,
        'og_type' => 'website',
        'og_image' => '/public/assets/images/og-default.png',
        'schema' => ''
    ];
    
    switch ($page) {
        case 'home':
            $seo['title'] = "AtoZ Gadgets | High-End Electronic Store";
            $seo['description'] = "Shop high-end smartphones, computers, smartwatches, and premium gadgets online. Official partner of leading brands.";
            break;
            
        case 'product':
            if (!empty($data['name'])) {
                $name = $data['name'];
                $brand = $data['brand'] ?? 'Gadgets';
                $seo['title'] = escape("Buy $name | $brand - $siteName");
                $seo['description'] = escape($data['short_description'] ?? "Get the premium $name with official warranty and express delivery from AtoZ Gadgets.");
                $seo['og_type'] = 'product';
                if (!empty($data['image'])) {
                    $seo['og_image'] = $data['image'];
                }
                
                // Construct Product Schema
                $price = $data['price'] ?? '0.00';
                $sku = $data['sku'] ?? 'SKU-000';
                $seo['schema'] = '
                {
                  "@context": "https://schema.org/",
                  "@type": "Product",
                  "name": "' . escape($name) . '",
                  "image": "' . escape($seo['og_image']) . '",
                  "description": "' . escape($seo['description']) . '",
                  "sku": "' . escape($sku) . '",
                  "offers": {
                    "@type": "Offer",
                    "url": "' . escape($canonicalUrl) . '",
                    "priceCurrency": "' . CURRENCY . '",
                    "price": "' . $price . '",
                    "availability": "https://schema.org/InStock",
                    "itemCondition": "https://schema.org/NewCondition"
                  }
                }';
            }
            break;
            
        case 'category':
            if (!empty($data['name'])) {
                $name = $data['name'];
                $seo['title'] = escape("Shop Premium $name | Categories - $siteName");
                $seo['description'] = escape("Browse our premium catalog of $name. Compare specs, prices and buy online with easy payment terms.");
            }
            break;
            
        case 'search':
            $query = escape($data['query'] ?? '');
            $seo['title'] = "Search Results for '$query' | $siteName";
            $seo['description'] = "Browse through all matching devices and electronics found for '$query' on $siteName.";
            break;
            
        case 'cart':
            $seo['title'] = "Shopping Cart | $siteName";
            $seo['description'] = "Review the premium gadgets in your shopping cart before completing your order securely.";
            break;

        case 'checkout':
            $seo['title'] = "Secure Checkout | $siteName";
            $seo['description'] = "Securely complete your electronic order and choose from premium shipping options.";
            break;
            
        case 'login':
            $seo['title'] = "Log In | $siteName Account Portal";
            $seo['description'] = "Log in to your $siteName account to check order status, manage wishlist, and edit profile details.";
            break;
            
        case 'register':
            $seo['title'] = "Create Account | Join $siteName";
            $seo['description'] = "Join $siteName to access customized notifications, express checkouts, and priority member discounts.";
            break;
            
        case 'account':
            $seo['title'] = "My Profile Dashboard | $siteName";
            $seo['description'] = "Manage your user profile, order history, billing address, and security logs.";
            break;
            
        case 'wishlist':
            $seo['title'] = "My Curated Wishlist | $siteName";
            $seo['description'] = "Save your dream gadgets and premium accessories in your custom wishlist to track discounts.";
            break;

        case '404':
            $seo['title'] = "Page Not Found | $siteName";
            $seo['description'] = "The page you are looking for does not exist on our servers. Return home to browse our premium collection.";
            break;
    }
    
    return $seo;
}
