const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Handle API routes - let them pass through (for future API calls)
app.use('/api', (req, res, next) => {
  // This allows API routes to be handled by the backend if needed
  // For now, we'll just pass them through
  next();
});

// Handle React Router - fallback to index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't handle API routes with the fallback
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
