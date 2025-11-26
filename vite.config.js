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
  // --- 2. Inject Global Variable ---
  define: {
    '__BUILD_TIMESTAMP__': JSON.stringify(nzstDate),
  },

  build: {
    outDir: 'dist',
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
      includeAssets: [
        'assets/icon.svg',          // Your Red T Icon
        'assets/quick_logo.png'     // Your Logo
      ],
      manifest: {
        name: 'Tweed Trading CMS',
        short_name: 'Tweed',
        description: 'Manage Tweed Trading recycled materials inventory.',
        theme_color: '#2e7d32',     // Your Green
        background_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
            // Using your SVG as a placeholder for PWA icons for now
            // You should generate real PNGs later for full PWA support
          { src: 'assets/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'assets/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ],
      },
    }),
  ],
});