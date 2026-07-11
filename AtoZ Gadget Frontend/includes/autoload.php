<?php
declare(strict_types=1);

// Include Core Configuration
require_once __DIR__ . '/config.php';

// Include Global Helper Functions
require_once __DIR__ . '/functions.php';

// Secure Session Management (PSR-12 and Section 34 compatibility)
if (session_status() === PHP_SESSION_NONE) {
    // Only send cookies over HTTP/HTTPS, not accessible to script languages
    ini_set('session.cookie_httponly', '1');
    
    // HTTPS check for secure cookies
    $isSecure = false;
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        $isSecure = true;
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        $isSecure = true;
    }
    
    if ($isSecure) {
        ini_set('session.cookie_secure', '1');
    } else {
        ini_set('session.cookie_secure', '0');
    }
    
    // Mitigate CSRF risks
    ini_set('session.cookie_samesite', 'Lax');
    
    // Start session
    session_start();
    
    // Periodic session ID regeneration for session fixation protection
    if (!isset($_SESSION['last_regeneration'])) {
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    } elseif (time() - $_SESSION['last_regeneration'] > 1800) { // every 30 mins
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }
}
