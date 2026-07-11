<?php
declare(strict_types=1);

// Load Autoloader & Helpers
require_once __DIR__ . '/includes/autoload.php';

// Request URI Parsing
$requestUri = $_SERVER['REQUEST_URI'];
if (($pos = strpos($requestUri, '?')) !== false) {
    $requestUri = substr($requestUri, 0, $pos);
}
$requestUri = rawurldecode($requestUri);

// Subdirectory compatibility resolving
$scriptDir = implode('/', array_slice(explode('/', $_SERVER['SCRIPT_NAME']), 0, -1));
$route = $requestUri;
if ($scriptDir !== '/' && strpos($requestUri, $scriptDir) === 0) {
    $route = substr($requestUri, strlen($scriptDir));
}
$route = '/' . ltrim($route, '/');

// Routing Table (Regex-based path resolution)
$page = '404';
$routeParams = [];

if ($route === '/' || $route === '') {
    $page = 'login';
} elseif ($route === '/home') {
    $page = 'home';
} elseif ($route === '/login') {
    $page = 'login';
} elseif ($route === '/register') {
    $page = 'register';
} elseif ($route === '/forgot-password') {
    $page = 'forgot-password';
} elseif ($route === '/reset-password') {
    $page = 'reset-password';
} elseif ($route === '/cart') {
    $page = 'cart';
} elseif ($route === '/wishlist') {
    $page = 'wishlist';
} elseif ($route === '/account') {
    $page = 'account';
} elseif ($route === '/checkout') {
    $page = 'checkout';
} elseif ($route === '/order-success') {
    $page = 'order-success';
} elseif ($route === '/admin') {
    $page = 'admin/layout';
} elseif ($route === '/compare') {
    $page = 'compare';
} elseif (preg_match('#^/product/([a-zA-Z0-9_-]+)$#', $route, $matches)) {
    $page = 'product';
    $routeParams['slug'] = $matches[1];
} elseif (preg_match('#^/category/([a-zA-Z0-9_-]+)$#', $route, $matches)) {
    $page = 'category';
    $routeParams['category_slug'] = $matches[1];
} elseif (preg_match('#^/brand/([a-zA-Z0-9_-]+)$#', $route, $matches)) {
    $page = 'brand';
    $routeParams['brand_slug'] = $matches[1];
} elseif ($route === '/products') {
    $page = 'products';
} elseif (preg_match('#^/search/([^/]+)$#', $route, $matches)) {
    $page = 'search';
    $routeParams['query'] = $matches[1];
} elseif ($route === '/search') {
    $page = 'search';
    $routeParams['query'] = $_GET['q'] ?? '';
} else {
    $page = '404';
}

// Store route configuration globally so pages can access parameters
$GLOBALS['route_params'] = $routeParams;
$GLOBALS['current_page'] = $page;

// Fetch SEO data
$seoData = get_seo_meta($page, $routeParams);

// If page is product and we have a slug, we will pull detailed product info during JS render.
// PHP templates will render initial SEO tags from slug parameters.

// View Render Pipeline
if (file_exists(PAGES_PATH . '/' . $page . '.php')) {
    require_once COMPONENTS_PATH . '/header.php';
    require_once PAGES_PATH . '/' . $page . '.php';
    require_once COMPONENTS_PATH . '/footer.php';
} else {
    http_response_code(404);
    require_once COMPONENTS_PATH . '/header.php';
    require_once PAGES_PATH . '/404.php';
    require_once COMPONENTS_PATH . '/footer.php';
}
