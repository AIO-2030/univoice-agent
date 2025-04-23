import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
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
    },
    port: 4945,
    https: createCertificates(),
    headers: {
      'Content-Security-Policy': "default-src 'self'; connect-src *; worker-src 'self' blob:; script-src 'self' blob: 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;"
    }
  },
  plugins: [
    react({
      // Simple configuration for older version
      babel: {
        presets: [
          '@babel/preset-env',
          ['@babel/preset-react', { runtime: 'classic' }],
          '@babel/preset-typescript',
        ],
        // Ensure compatibility with older browsers
        plugins: [],
        // Make sure to include all files
        exclude: 'node_modules/**',
      }
    }),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
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
