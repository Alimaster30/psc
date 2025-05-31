const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Check if build directory exists
const buildPath = path.join(__dirname, 'client/dist');
const indexPath = path.join(buildPath, 'index.html');

console.log('Build path:', buildPath);
console.log('Index path:', indexPath);
console.log('Build directory exists:', fs.existsSync(buildPath));
console.log('Index.html exists:', fs.existsSync(indexPath));

if (!fs.existsSync(buildPath)) {
  console.error('ERROR: Build directory does not exist!');
  console.error('Expected path:', buildPath);
}

if (!fs.existsSync(indexPath)) {
  console.error('ERROR: index.html does not exist!');
  console.error('Expected path:', indexPath);
}

// Serve static files from the React app build directory
app.use(express.static(buildPath));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'frontend',
    timestamp: new Date().toISOString(),
    buildPath: buildPath,
    indexExists: fs.existsSync(indexPath)
  });
});

// API routes should be proxied to the backend (handled by Render's routing)
// This is just a fallback in case someone hits the frontend server directly
app.get('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found on frontend server',
    message: 'API requests should go to the backend service'
  });
});

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  console.log(`Serving React app for route: ${req.path}`);

  const indexFile = path.join(__dirname, 'client/dist', 'index.html');

  // Check if index.html exists before serving
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    console.error('ERROR: index.html not found at:', indexFile);
    res.status(404).send(`
      <h1>Build Error</h1>
      <p>The React app build was not found.</p>
      <p>Expected location: ${indexFile}</p>
      <p>Please check the build process.</p>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Frontend server error:', err);
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
  console.log(`Serving React app from: ${path.join(__dirname, 'client/dist')}`);
});
