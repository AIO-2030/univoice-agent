import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import path from 'path';

// Minimal development config that doesn't rely on the React plugin
export default defineConfig({
  // Basic build options
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      input: path.resolve(__dirname, 'index-dev.html'),
    },
  },
  // Server configuration
  server: {
    port: 5000,
    // No HTTPS for basic development setup
    open: true,
    // Handle CORS issues
    cors: {
      origin: ['http://localhost:5000', 'http://localhost:4943', 'http://*.localhost:4943', 'http://224r2-ziaaa-aaaah-aol2a-cai.localhost:4943'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
        secure: false,
      },
      "/api/v2/status": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization",
      // Updated Content Security Policy to allow LottieFiles CDN connections
      "Content-Security-Policy": "default-src 'self'; connect-src 'self' http://localhost:* https://icp0.io https://*.icp0.io https://icp-api.io https://cdn.jsdelivr.net https://*.jsdelivr.net https://unpkg.com https://*.unpkg.com; worker-src 'self' blob:; script-src 'self' blob: 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:;",
      "Permissions-Policy": "microphone=(self)"
    }
  },
  plugins: [
    // Only include essential plugins, not the React plugin
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          '<script type="module" src="/src/main.tsx"></script>',
          '<script type="module" src="/src/main.dev.tsx"></script>'
        );
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Override the main entry point for development
  optimizeDeps: {
    entries: ['src/main.dev.tsx'],
  },
}); 