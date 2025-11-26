/// src/js/main.js
import { fetchContent } from './db.js';
import { setItems, setPage } from './state.js'; // Import setPage
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { initEmailSystem } from './email.js'; // Import Email
import { MAINTENANCE_ESTIMATE } from './config.js';

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');

    try {
        const items = await fetchContent();
        setItems(items);
        render();

        initEditor();
        initToolbar();
        initEmailSystem(); // Start Email Listener

        // --- NAVIGATION LOGIC ---
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. Update UI
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 2. Update State & Render
                const page = btn.getAttribute('data-page');
                setPage(page);
                render();
            });
        });

        document.getElementById('maintenance-view').classList.add('hidden');

    } catch (error) {
        console.error("CRITICAL APP FAILURE:", error);
        triggerMaintenanceMode(); // (Existing logic)
    }
}

startApp();

function triggerMaintenanceMode() {
    // 1. Hide the App container
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('super-header').style.display = 'none';

    // 2. Show Maintenance Screen
    const maint = document.getElementById('maintenance-view');
    maint.classList.remove('hidden');
    maint.style.display = 'flex'; // Force flex for centering

    // 3. Set the time
    document.getElementById('maintenance-time').innerText = MAINTENANCE_ESTIMATE;
}

startApp();