/// src/js/main.js
import { fetchContent } from './db.js';
import { setItems } from './state.js';
import { render } from './renderer.js';
import { initEditor } from './editor.js';
import { initToolbar } from './toolbar.js';
import { MAINTENANCE_ESTIMATE } from './config.js'; // Import the time

async function startApp() {
    console.log('Initializing Tweed Trading CMS...');

    try {
        // 1. Attempt to Load Data
        const items = await fetchContent();
        
        // CHECK: If DB returns empty array unexpectedly, trigger maintenance?
        // Uncomment next line if you want empty DB to equal maintenance
        // if (items.length === 0) throw new Error("Database Empty");

        setItems(items);

        // 2. Render
        render();

        // 3. Setup Listeners
        initEditor();
        initToolbar();

        // If we got here, everything is good. Ensure maintenance is hidden.
        document.getElementById('maintenance-view').classList.add('hidden');

    } catch (error) {
        console.error("CRITICAL APP FAILURE:", error);
        triggerMaintenanceMode();
    }
}

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