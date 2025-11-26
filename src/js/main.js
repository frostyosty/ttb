/// src/js/main.js
import { fetchContent } from './db.js';
// 👇 ADDED 'state' TO THIS IMPORT
import { setItems, setPage, state } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailConfig, attachEmailListeners } from './email.js';
import { FALLBACK_ITEMS } from './fallbackData.js';
import { initCarousel } from './carousel.js';

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');

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
        
        // This function uses 'state', so the import above is required
        setupNavigation();
        
        render(); 
        attachEmailListeners(); 
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
    
    // 1. Find all unique page names from the database items
    const pages = new Set(state.items.map(i => i.page || 'home'));
    
    // Ensure standard order
    const orderedPages = ['home', 'products', 'contact'];
    // Add any custom pages the user created to the list
    pages.forEach(p => {
        if (!orderedPages.includes(p)) orderedPages.push(p);
    });

    // 2. Clear hardcoded HTML
    navContainer.innerHTML = '';

    // 3. Build Buttons
    orderedPages.forEach(pageName => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        if(pageName === 'home') btn.classList.add('active');
        btn.setAttribute('data-page', pageName);
        btn.innerText = pageName.charAt(0).toUpperCase() + pageName.slice(1); // Capitalize
        
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