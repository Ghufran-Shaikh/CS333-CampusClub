<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://127.0.0.1:5501/campus_hub_frontend/index.html'); 
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log request details for debugging
$debugLog = [
    'REQUEST_URI' => $_SERVER['REQUEST_URI'],
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
    'SERVER' => $_SERVER
];
file_put_contents('debug.log', json_encode($debugLog, JSON_PRETTY_PRINT) . "\n", FILE_APPEND);

// Get the request URI and method
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove query string and trim slashes
$uri = parse_url($requestUri, PHP_URL_PATH);
$uri = trim($uri, '/');

// Split the URI into segments
$segments = explode('/', $uri);

// Log segments
file_put_contents('debug.log', json_encode(['segments' => $segments], JSON_PRETTY_PRINT) . "\n", FILE_APPEND);

// Base path for the API
$basePath = 'api';
$endpoint = '';
$param = null;

// Check if the base path matches
if (!empty($segments) && $segments[0] === $basePath) {
    array_shift($segments);
    $endpoint = !empty($segments) ? $segments[0] : '';
    $param = isset($segments[1]) ? $segments[1] : null;
} else {
    $endpoint = $uri;
}

// Log endpoint and param
file_put_contents('debug.log', json_encode(['endpoint' => $endpoint, 'param' => $param], JSON_PRETTY_PRINT) . "\n", FILE_APPEND);

// Route requests
switch ($endpoint) {
    case 'reviews':
        if ($method === 'GET' && $param === null) {
            require 'reviews/read.php';
        } elseif ($method === 'POST') {
            require 'reviews/create.php';
        } elseif ($method === 'PUT' && $param !== null) {
            require 'reviews/update.php';
        } elseif ($method === 'DELETE' && $param !== null) {
            require 'reviews/delete.php';
        } elseif ($method === 'POST' && $param === 'like') {
            require 'reviews/like.php';
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    case 'comments':
        if ($method === 'GET' && $param === null) {
            require 'comments/read.php';
        } elseif ($method === 'POST') {
            require 'comments/create.php';
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>