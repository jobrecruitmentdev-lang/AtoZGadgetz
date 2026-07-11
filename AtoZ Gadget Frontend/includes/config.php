<?php
declare(strict_types=1);

// Application Configuration
define('APP_NAME', 'AtoZ Gadgets');
define('API_BASE_URL', 'http://localhost:8000'); // Matches FastAPI backend
define('CURRENCY', 'INR');
define('CURRENCY_SYMBOL', '₹');
define('TIMEZONE', 'Asia/Kolkata');

// Timezone setup
date_default_timezone_set(TIMEZONE);

// Base Path Definitions
define('BASE_PATH', dirname(__DIR__));
define('PUBLIC_PATH', BASE_PATH . '/public');
define('COMPONENTS_PATH', BASE_PATH . '/components');
define('PAGES_PATH', BASE_PATH . '/pages');
define('INCLUDES_PATH', BASE_PATH . '/includes');

// Cache settings (for client side or proxy assets)
define('ASSETS_VERSION', '1.0.6');
