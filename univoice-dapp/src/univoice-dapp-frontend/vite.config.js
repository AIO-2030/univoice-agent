import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import path from 'path'
import fs from 'fs';

dotenv.config({ path: '../../.env' });

// Function to create self-signed certificates if they don't exist
const createCertificates = () => {
  const certDir = path.resolve(__dirname, '.certificates');
  const keyPath = path.resolve(certDir, 'key.pem');
  const certPath = path.resolve(certDir, 'cert.pem');

  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('Self-signed certificates not found, please generate them with:');
    console.log('mkdir -p .certificates && cd .certificates && openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"');
    return null;
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
};

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    sourcemap: true,
    // Use newer build config that's more compatible
    target: 'es2020',
    // Make sure to include all required files for deployment
    assetsInlineLimit: 0,
  },
  base: process.env.NODE_ENV === 'production' 
    ? '/' 
    : '/',
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
      "/api/v2/status": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      // Add proxy for assets
      "/assets": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
        rewrite: (path) => path
      },
    },
    port: 4944,
    https: createCertificates(),
    // Add CORS configuration
    cors: {
      origin: ['http://localhost:*', 'http://*.localhost:4943', 'http://224r2-ziaaa-aaaah-aol2a-cai.localhost:4943'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
      'Content-Security-Policy': "default-src 'self'; connect-src *; worker-src 'self' blob:; script-src 'self' blob: 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:;",
      'Permissions-Policy': "microphone=(self)"
    }
  },
  plugins: [
    react({
      // Completely disable Fast Refresh - this removes the preamble requirement
      fastRefresh: false
    }),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    {
      name: 'html-transform',
      transformIndexHtml(html, ctx) {
        if (process.env.NODE_ENV !== 'production') {
          return fs.readFileSync(path.resolve(__dirname, 'index-dev.html'), 'utf-8');
        }
        return html;
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },{
        find: "@",
        replacement: path.resolve(__dirname, 'src'),
      }
    ],
  },
});
