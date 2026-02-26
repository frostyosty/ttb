// ./vite.config.js 


import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { execSync } from 'child_process';

let buildTimestamp = new Date().toISOString();
try {

  const gitDate = execSync('git log -1 --format=%cd').toString().trim();
  buildTimestamp = gitDate;
} catch (e) {

}

const nzstDate = new Date(buildTimestamp).toLocaleString('en-NZ', {
  timeZone: 'Pacific/Auckland',
  dateStyle: 'full',
  timeStyle: 'long'
});

export default defineConfig({
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  },
  base: '/',

  define: {
    '__BUILD_TIMESTAMP__': JSON.stringify(nzstDate),
    global: 'window'
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  includeAssets: [
  'assets/icon.svg'],

  plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',

    workbox: {
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,

      navigateFallback: null
    },
    manifest: {
      name: 'Tweed Trading CMS',
      short_name: 'Tweed',
      theme_color: '#2e7d32',
      icons: [
      { src: 'assets/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: 'assets/icon.svg', sizes: '512x512', type: 'image/svg+xml' }]

    }
  })]

});