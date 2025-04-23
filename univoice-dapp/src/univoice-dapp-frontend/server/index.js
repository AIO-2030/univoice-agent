const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure CORS based on environment
const corsOptions = {
  origin: isDevelopment 
    ? '*'  // Allow all origins in development
    : [
       // Allow specific origins in production
       // Note: Update these with your actual production domains
       'https://yourdomain.com', 
       'https://*.ic0.app', 
       'https://*.icp0.io'
    ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

// Enable CORS for all routes with environment-specific settings
app.use(cors(corsOptions));

// Specific middleware for the /api/v2/status endpoint
app.use('/api/v2/status', (req, res, next) => {
  // Set CORS headers based on environment
  if (isDevelopment) {
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    // In production, only allow specific origins
    const allowedOrigins = corsOptions.origin;
    const origin = req.headers.origin;
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For GET requests, return a simple status response
  if (req.method === 'GET') {
    return res.json({ status: 'ok' });
  }
  
  next();
});

// Proxy all other /api requests to the actual backend
// Only in development - in production, API calls are handled directly
if (isDevelopment) {
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api', // No path rewriting needed
    },
    onProxyRes: function(proxyRes, req, res) {
      // Add CORS headers to the proxied response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
  }));
}

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// All other requests return the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running in ${isDevelopment ? 'development' : 'production'} mode on port ${PORT}`);
  console.log(`Access the app at http${isDevelopment ? '' : 's'}://localhost:${PORT}`);
}); 