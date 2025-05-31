<?php
// Simple PHP fallback for SPA routing
// This file will be served for any 404 errors
header('Content-Type: text/html; charset=utf-8');
header('HTTP/1.1 200 OK'); // Override 404 status

// Get the original requested path
$requestedPath = $_SERVER['REQUEST_URI'] ?? '/';

// Read and serve the index.html file
$indexFile = __DIR__ . '/index.html';

if (file_exists($indexFile)) {
    // Serve the React app
    readfile($indexFile);
} else {
    // Fallback if index.html doesn't exist
    echo '<!DOCTYPE html>
<html>
<head>
    <title>Prime Skin Clinic</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>Loading...</h1>
    <script>
        // Redirect to the main domain
        window.location.href = "/";
    </script>
</body>
</html>';
}
?>
