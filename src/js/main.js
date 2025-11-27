/// src/js/main.js
import { fetchContent, saveContent } from './db.js';
import { setItems, setPage, state } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailConfig, attachEmailListeners } from './email.js';
import { FALLBACK_ITEMS } from './fallbackData.js';
import { initCarousel } from './carousel.js';

let saveTimer;

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');
    
    const startTime = Date.now();
    const MIN_LOAD_TIME = 1000; 

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

    // --- STARTUP ---
    initEmailConfig();
    let items = [];
    
    try {
        // Timeout Race
        const fetchPromise = fetchContent();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
        items = await Promise.race([fetchPromise, timeoutPromise]);

        if (!items || items.length === 0) throw new Error("Database Empty");

    } catch (error) {
        console.warn("Fallback Mode Active", error);
        items = FALLBACK_ITEMS; 
    }

    try {
        setItems(items);
        setupNavigation();
        render(); 
        attachEmailListeners(); 
        initCarousel(); 
        initEditor();
        initToolbar();
        
        document.getElementById('maintenance-view').classList.add('hidden');

        // Hide Loader
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsedTime);
        setTimeout(() => {
            const loader = document.getElementById('loading-view');
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(() => loader.style.display = 'none', 500);
            }
        }, remainingTime);

    } catch (criticalError) {
        console.error("CRITICAL FAILURE:", criticalError);
        const loader = document.getElementById('loading-view');
        if(loader) loader.style.display = 'none';
        triggerMaintenanceMode();
    }

    // --- AUTO-SAVE LISTENER (UPDATED) ---
    document.addEventListener('app-render-request', () => {
        // 1. Optimistic Render
        state.items.sort((a, b) => (a.position || 0) - (b.position || 0));
        render();
        initCarousel();
        import('./email.js').then(m => m.attachEmailListeners());

        // 2. Debounce Save
        clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
            console.log("Auto-saving...");
            try {
                // SAVE and GET FRESH DATA (with new IDs)
                const freshItems = await saveContent(state.items);
                
                // UPDATE LOCAL STATE with the real IDs
                if (freshItems && freshItems.length > 0) {
                    // We preserve the current order/sort
                    freshItems.sort((a, b) => (a.position || 0) - (b.position || 0));
                    setItems(freshItems);
                    console.log("Auto-save synced successfully.");
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
        if(pageName === 'home') btn.classList.add('active');
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