/// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { execSync } from 'child_process';

// --- 1. Calculate NZST Timestamp ---
let buildTimestamp = new Date().toISOString();
try {
  // Get the last commit date from git
  const gitDate = execSync('git log -1 --format=%cd').toString().trim();
  buildTimestamp = gitDate;
} catch (e) {
  // console.warn("Git history not found, using current time.");
}

// Format for New Zealand
const nzstDate = new Date(buildTimestamp).toLocaleString('en-NZ', {
  timeZone: 'Pacific/Auckland',
  dateStyle: 'full',
  timeStyle: 'long'
});
// -----------------------------------

export default defineConfig({
    optimizeDeps: {
    include: ['@supabase/supabase-js']
  },
  base: '/',
  // --- 2. Inject Global Variable ---
  define: {
    '__BUILD_TIMESTAMP__': JSON.stringify(nzstDate),
    global: 'window',
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true, // Ensure we clear old files
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // FORCE CLEANUP OF OLD CACHES
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // Don't cache the index.html initially to prevent this loop
        navigateFallback: null, 
      },
      manifest: {
        name: 'Tweed Trading CMS',
        short_name: 'Tweed',
        theme_color: '#2e7d32',
        icons: [
          { src: 'assets/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'assets/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ],
      },
    }),
  ],
});