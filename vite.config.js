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
    chunkSizeWarningLimit: 2000, // 2MB warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js ve 3D kütüphanelerini ayrı chunk'a ayır
          'three': ['three', 'troika-three-text'],
          // React ve ilgili kütüphaneleri ayrı chunk'a ayır
          'react': ['react', 'react-dom'],
        },
        // Chunk dosya adlandırma stratejisi
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Rollup'un yeni sürümünde names kullanılıyor
          const assetName = assetInfo.names?.[0] || assetInfo.name || 'asset';
          
          if (!assetName) {
            return `assets/[name]-[hash].[ext]`;
          }
          
          const info = assetName.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetName)) {
            return `media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetName)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetName)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    }
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


