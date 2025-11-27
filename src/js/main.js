/// src/js/main.js
import { fetchContent, saveContent } from './db.js';
import { setItems, setPage, state } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailConfig, attachEmailListeners } from './email.js';
import { STATIC_CONTENT } from './fallback/staticContent.js';
import { initCarousel } from './carousel.js';

let saveTimer;

// --- GLOBAL IMAGE DEBUGGER ---
// This listens for any "error" event on the page.
// If it came from an <img> tag, we log the broken URL.
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        console.error("❌ IMAGE FAILED TO LOAD:");
        console.error("   Source:", e.target.src);
        console.error("   Element ID:", e.target.id || '(No ID)');
        
        // Optional: Visual indicator for debugging
        e.target.style.border = "5px solid red";
    }
}, true); // "true" ensures we catch the error during the capture phase

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');
    
    const startTime = Date.now();
    const MIN_LOAD_TIME = 1000; // Keep spinner for at least 1s so it doesn't flash

    // --- DIMMING OBSERVER ---
    const toastObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const toast = document.getElementById('toast');
                if (toast && !toast.classList.contains('hidden')) {
                    document.body.classList.add('toast-active');
                } else {
                    document.body.classList.remove('toast-active');
                }
            }
        });
    });
    const toastEl = document.getElementById('toast');
    if (toastEl) toastObserver.observe(toastEl, { attributes: true });

    initEmailConfig();

    let items = [];
    let isOfflineMode = false;

    try {
        // --- TIMEOUT REDUCED TO 4 SECONDS ---
        const fetchPromise = fetchContent();
        
        // 4 Second Limit: If network is slow/blocked, switch to Static Mode
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Network Timeout (4s)")), 4000)
        );

        items = await Promise.race([fetchPromise, timeoutPromise]);

        if (!items || items.length === 0) throw new Error("Database Empty");

    } catch (error) {
        console.warn("Switching to Static High-Fidelity Mode:", error.message);
        
        // LOAD STATIC CONTENT
        items = STATIC_CONTENT;
        isOfflineMode = true;
    }

    try {
        setItems(items);
        setupNavigation();
        
        render(); 
        attachEmailListeners(); 
        initCarousel(); 

        // Only enable Editing tools if we are actually connected
        // If we are using Static Content, saving won't work anyway, so why show tools?
        // However, user might want to access "My Notes" which works offline.
        initEditor(); 
        initToolbar();
        
        document.getElementById('maintenance-view').classList.add('hidden');

        // --- HIDE LOADING SCREEN ---
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsedTime);

        setTimeout(() => {
            const loader = document.getElementById('loading-view');
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(() => loader.style.display = 'none', 500);
            }
        }, remainingTime);

        // Optional: Show a subtle "Offline Mode" indicator if you want
        if (isOfflineMode) {
            console.log("App running in Offline / Static Mode");
        }

    } catch (criticalError) {
        console.error("CRITICAL FAILURE:", criticalError);
        // If even the static content crashes, allow maintenance view
        const loader = document.getElementById('loading-view');
        if(loader) loader.style.display = 'none';
        triggerMaintenanceMode();
    }

    // --- AUTO-SAVE LISTENER ---
    document.addEventListener('app-render-request', () => {
        // If Offline, we allow UI updates (re-sort etc) but disable Saving
        state.items.sort((a, b) => (a.position || 0) - (b.position || 0));
        render();
        setupNavigation();
        initCarousel();
        import('./email.js').then(m => m.attachEmailListeners());

        if (isOfflineMode) {
            console.log("Offline Mode: Changes are temporary and will not save to database.");
            return; // STOP HERE
        }

        // Only save if Online
        clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
            console.log("Auto-saving...");
            try {
                const freshItems = await saveContent(state.items);
                if (freshItems && freshItems.length > 0) {
                    freshItems.sort((a, b) => (a.position || 0) - (b.position || 0));
                    setItems(freshItems);
                    console.log("Synced.");
                }
            } catch (err) {
                console.error("Auto-save failed:", err);
            }
        }, 1000);
    });
}

function setupNavigation() {
    const navContainer = document.querySelector('.main-nav');
    if(!navContainer) return;
    
    const pages = new Set(state.items.map(i => i.page || 'home'));
    const orderedPages = ['home', 'products', 'contact'];
    pages.forEach(p => { if (!orderedPages.includes(p)) orderedPages.push(p); });

    navContainer.innerHTML = '';

    orderedPages.forEach(pageName => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        if(pageName === (state.currentPage || 'home')) btn.classList.add('active');
        btn.setAttribute('data-page', pageName);
        btn.innerText = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setPage(pageName);
            render();
            attachEmailListeners();
            initCarousel();
        });
        navContainer.appendChild(btn);
    });
}

function triggerMaintenanceMode() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('super-header').style.display = 'none';
    document.getElementById('maintenance-view').classList.remove('hidden');
    document.getElementById('maintenance-view').style.display = 'flex';
}

startApp();