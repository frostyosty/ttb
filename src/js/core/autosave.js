// ./src/js/core/autosave.js 

import { saveContent } from '../db.js';
import { state, setItems } from '../state.js';
import { setupNavigation } from './navigation.js';
import { render } from '../renderer.js';
import { initCarousel } from '../carousel.js';
import { attachEmailListeners } from '../email.js';

let saveTimer;

export function initAutoSave(isOfflineMode) {
  document.addEventListener('app-render-request', () => {

    state.items.sort((a, b) => (a.position || 0) - (b.position || 0));
    render();
    setupNavigation();
    initCarousel();
    attachEmailListeners();

    if (isOfflineMode) {
      console.log("Offline Mode: Changes are temporary.");
      return;
    }

    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      console.log("☁️ Auto-saving...");
      try {
        const freshItems = await saveContent(state.items);
        if (freshItems && freshItems.length > 0) {
          freshItems.sort((a, b) => (a.position || 0) - (b.position || 0));
          setItems(freshItems);
          console.log("✅ Synced.");
        }
      } catch (err) {
        console.error("❌ Auto-save failed:", err);
      }
    }, 1000);
  });
}