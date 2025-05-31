const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
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
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
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
