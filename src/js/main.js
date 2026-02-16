import { fetchContent } from './db.js';
import { setItems } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailConfig, attachEmailListeners } from './email.js';
import { STATIC_CONTENT } from './fallback/staticContent.js';
import { initCarousel } from './carousel.js';

// Import New Core Modules
import { checkAdminAutoLogin } from './core/adminCheck.js';
import { setupNavigation } from './core/navigation.js';
import { initAutoSave } from './core/autosave.js';

// --- GLOBAL IMAGE DEBUGGER ---
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        console.error("❌ IMAGE FAILED TO LOAD:", e.target.src);
        // e.target.style.border = "2px solid red"; // Optional visual aid
    }
}, true);

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');

    // 1. ADMIN CHECK
    // If admin is detected, we launch POS and keep running (or return if you want exclusive mode)
    await checkAdminAutoLogin();
    
    // 2. SETUP
    const MIN_LOAD_TIME = 1000;
    const startTime = Date.now();
    initEmailConfig();
    setupToastObserver();

    let items = [];
    let isOfflineMode = false;

    // 3. FETCH CONTENT
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

    // 4. INITIALIZE APP
    try {
        setItems(items);
        
        // Initial Renders
        setupNavigation();
        render(); 
        attachEmailListeners(); 
        initCarousel(); 

        // Tools (Editor works offline for local changes)
        initEditor(); 
        initToolbar();
        
        // Start Auto-Saver
        initAutoSave(isOfflineMode);
        
        // Hide Maintenance Mode & Spinner
        document.getElementById('maintenance-view').classList.add('hidden');
        handleLoadingScreen(startTime, MIN_LOAD_TIME);

    } catch (criticalError) {
        console.error("CRITICAL FAILURE:", criticalError);
        document.getElementById('loading-view').style.display = 'none';
        triggerMaintenanceMode();
    }
}

// Helper: Hides spinner smoothly
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

// Helper: Maintenance View
function triggerMaintenanceMode() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('super-header').style.display = 'none';
    const maint = document.getElementById('maintenance-view');
    maint.classList.remove('hidden');
    maint.style.display = 'flex';
}

// Helper: Toast Observer
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

// Launch
startApp();