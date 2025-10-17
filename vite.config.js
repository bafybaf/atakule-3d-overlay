import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './client',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/outputs': 'http://localhost:3000',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    outDir: '../client-dist',
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: []
  },
  define: {
    global: 'globalThis',
  },
  worker: {
    format: 'es'
  },
});


