/// src/js/main.js
import { fetchContent } from './db.js';
import { setItems, setPage } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailConfig, attachEmailListeners } from './email.js'; // Updated Imports
import { FALLBACK_ITEMS } from './fallbackData.js';
import { initCarousel } from './carousel.js';

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');

    // 1. Setup Email Keys Once
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
        setItems(items);
        setupNavigation();
        
        // 2. Initial Render & Attachments
        render(); 
        attachEmailListeners(); // <--- Attach form listeners
        initCarousel(); 

        initEditor();
        initToolbar();
        
        document.getElementById('maintenance-view').classList.add('hidden');

    } catch (criticalError) {
        console.error("CRITICAL APP FAILURE:", criticalError);
        triggerMaintenanceMode();
    }
}

function setupNavigation() {
    const navContainer = document.querySelector('.main-nav');
    if(!navContainer) return;
    
    // Calculate pages...
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
            
            // 3. Re-Attach Listeners on Page Change
            render();
            attachEmailListeners(); // <--- Check for form on new page
            initCarousel();         // <--- Check for carousel on new page
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