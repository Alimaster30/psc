<?php
// Simple PHP fallback for SPA routing
// This serves the index.html for any PHP server

$indexFile = __DIR__ . '/index.html';

if (file_exists($indexFile)) {
    // Set proper content type
    header('Content-Type: text/html; charset=utf-8');
    
    // Read and output the index.html file
    readfile($indexFile);
} else {
    // Fallback if index.html doesn't exist
    header('HTTP/1.1 404 Not Found');
    echo '<!DOCTYPE html>
<html>
<head>
    <title>Prime Skin Clinic - File Not Found</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>Application Not Found</h1>
    <p>The Prime Skin Clinic application files could not be located.</p>
    <p>Please contact your system administrator.</p>
</body>
</html>';
}
?>
