export async function checkAdminAutoLogin() {
    // Check local storage for the admin cookie
    if (localStorage.getItem('tweed_admin_logged_in') === 'true') {
        console.log("🔑 Admin Cookie Found. Launching POS...");
        
        const toolbar = document.getElementById('dev-toolbar');
        if(toolbar) toolbar.classList.remove('hidden');
        
        // Dynamic import to keep initial load fast
        const module = await import('../pos/posMain.js');
        module.initPOS();
        
        return true; // Return true to signal admin mode is active
    }
    return false;
}