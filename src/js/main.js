/// src/js/main.js
import { fetchContent } from './db.js';
import { setItems, setPage, state } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailConfig, attachEmailListeners } from './email.js';
import { FALLBACK_ITEMS } from './fallbackData.js';
import { initCarousel } from './carousel.js';

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');

    // 1. Record Start Time
    const startTime = Date.now();
    const MIN_LOAD_TIME = 1000; // 1 second minimum

    initEmailConfig();

    let items = [];
    try {
        items = await fetchContent();
        if (!items || items.length === 0) throw new Error("Database Empty");
    } catch (error) {
        console.warn("SUPABASE FAILED. Switching to Fallback Mode.", error);
        items = FALLBACK_ITEMS; 
    }

    try {
        // 2. Prepare Data (But don't show yet)
        setItems(items);
        setupNavigation();
        render(); 
        attachEmailListeners(); 
        initCarousel(); 
        initEditor();
        initToolbar();
        
// Re-render when renderer asks (from element tools)
    document.addEventListener('app-render-request', () => {
        // We re-sort items just in case position changed
        // (Simple sort logic matching toolbar.js)
        state.items.sort((a, b) => (a.position || 0) - (b.position || 0));
        render();
        // Re-attach listeners for other features
        initCarousel();
        // (Email listeners are persistent on form, so less worry there, but good to check)
        import('./email.js').then(m => m.attachEmailListeners()); 
    });

        document.getElementById('maintenance-view').classList.add('hidden');

        // 3. Calculate Remaining Time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsedTime);

        // 4. Wait (if needed) then Fade Out
        setTimeout(() => {
            const loader = document.getElementById('loading-view');
            if (loader) {
                loader.classList.add('fade-out');
                // Remove from DOM after fade completes
                setTimeout(() => loader.style.display = 'none', 500);
            }
        }, remainingTime);

    } catch (criticalError) {
        console.error("CRITICAL APP FAILURE:", criticalError);
        // If critical failure, hide loader immediately so Maintenance view shows
        const loader = document.getElementById('loading-view');
        if(loader) loader.style.display = 'none';
        
        triggerMaintenanceMode();
    }
}

function setupNavigation() {
    const navContainer = document.querySelector('.main-nav');
    if(!navContainer) return;
    
    const pages = new Set(state.items.map(i => i.page || 'home'));
    const orderedPages = ['home', 'products', 'contact'];
    pages.forEach(p => {
        if (!orderedPages.includes(p)) orderedPages.push(p);
    });

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