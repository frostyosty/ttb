// ./src/js/main.js 

import { fetchContent } from './db.js';
import { setItems } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailConfig, attachEmailListeners } from './email.js';
import { STATIC_CONTENT } from './fallback/staticContent.js';
import { initCarousel } from './carousel.js';

import { checkAdminAutoLogin } from './core/adminCheck.js';
import { setupNavigation } from './core/navigation.js';
import { initAutoSave } from './core/autosave.js';

window.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    console.error("❌ IMAGE FAILED TO LOAD:", e.target.src);

  }
}, true);

async function startApp() {
  console.log('Initializing Tweed Trading CMS...');

  await checkAdminAutoLogin();

  const MIN_LOAD_TIME = 1000;
  const startTime = Date.now();
  initEmailConfig();
  setupToastObserver();

  let items = [];
  let isOfflineMode = false;

  try {
    const fetchPromise = fetchContent();
    const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Network Timeout (4s)")), 4000)
    );

    items = await Promise.race([fetchPromise, timeoutPromise]);
    if (!items || items.length === 0) throw new Error("Database Empty");

  } catch (error) {
    console.warn("⚠️ Mode Switch: Static High-Fidelity (" + error.message + ")");
    items = STATIC_CONTENT;
    isOfflineMode = true;
  }

  try {
    setItems(items);

    setupNavigation();
    render();
    attachEmailListeners();
    initCarousel();

    initEditor();
    initToolbar();

    initAutoSave(isOfflineMode);

    document.getElementById('maintenance-view').classList.add('hidden');
    handleLoadingScreen(startTime, MIN_LOAD_TIME);

  } catch (criticalError) {
    console.error("CRITICAL FAILURE:", criticalError);
    document.getElementById('loading-view').style.display = 'none';
    triggerMaintenanceMode();
  }
}

function handleLoadingScreen(startTime, minTime) {
  const elapsedTime = Date.now() - startTime;
  const remainingTime = Math.max(0, minTime - elapsedTime);

  setTimeout(() => {
    const loader = document.getElementById('loading-view');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.style.display = 'none', 500);
    }
  }, remainingTime);
}

function triggerMaintenanceMode() {
  document.getElementById('app-container').style.display = 'none';
  document.getElementById('super-header').style.display = 'none';
  const maint = document.getElementById('maintenance-view');
  maint.classList.remove('hidden');
  maint.style.display = 'flex';
}

function setupToastObserver() {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        if (!toastEl.classList.contains('hidden')) {
          document.body.classList.add('toast-active');
        } else {
          document.body.classList.remove('toast-active');
        }
      }
    });
  }).observe(toastEl, { attributes: true });
}

startApp();