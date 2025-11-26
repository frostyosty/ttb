/// src/js/main.js
import { fetchContent } from './db.js';
import { setItems, setPage } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailSystem } from './email.js';
import { FALLBACK_ITEMS } from './fallbackData.js';
import { initCarousel } from './carousel.js';  // <--- CRITICAL LINE

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');

    let items = [];

    // 1. Attempt to Load Data
    try {
        items = await fetchContent();
        if (!items || items.length === 0) throw new Error("Database Empty");
    } catch (error) {
        console.warn("SUPABASE FAILED. Switching to Fallback Mode.", error);
        items = FALLBACK_ITEMS; 
        
        const saveBtn = document.getElementById('btn-save');
        if(saveBtn) {
            saveBtn.style.opacity = '0.5';
            saveBtn.innerText = 'Offline (Read Only)';
        }
    }

    // 2. Continue Loading App
    try {
        setItems(items);
        render(); 

        initEditor();
        initToolbar();
        initEmailSystem();
        initCarousel(); // <--- This will crash if line 8 is missing

        // Navigation Logic
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setPage(btn.getAttribute('data-page'));
                
                render();
                initCarousel(); // Re-run carousel on tab change
            });
        });

        document.getElementById('maintenance-view').classList.add('hidden');

    } catch (criticalError) {
        console.error("CRITICAL APP FAILURE:", criticalError);
        triggerMaintenanceMode();
    }
}

function triggerMaintenanceMode() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('super-header').style.display = 'none';
    document.getElementById('maintenance-view').classList.remove('hidden');
    document.getElementById('maintenance-view').style.display = 'flex';
}

startApp();