import { initProductManager } from './productManager.js';
import { initScanner } from './scanner.js';

export function initPOS() {
    console.log("🏭 Loading Tweed ERP...");

    // 1. Hijack the App Container
    const app = document.getElementById('app-container');
    const header = document.getElementById('super-header');
    
    if(header) header.style.display = 'none';
    if(document.querySelector('.main-nav')) document.querySelector('.main-nav').style.display = 'none';

    // 2. Render Basic Layout
    app.innerHTML = `
        <div id="pos-view">
            <header class="pos-header">
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="/assets/icon.svg" style="height:30px;">
                    <h2>Tweed ERP</h2>
                </div>
                <button id="exit-pos" style="background:#d32f2f; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Exit</button>
            </header>
            
            <div class="pos-grid">
                <aside class="pos-sidebar">
                    <button class="pos-btn active" id="nav-add-item">📦 Add Item</button>
                    <button class="pos-btn" id="nav-checkout">💰 Checkout</button>
                    <button class="pos-btn" id="nav-inventory">📋 Inventory</button>
                </aside>

                <main class="pos-content" id="pos-content-area">
                    <!-- Dynamic Content Loads Here -->
                </main>
            </div>
        </div>
    `;

    // 3. Bind Exit Button
    document.getElementById('exit-pos').addEventListener('click', () => {
        // Optional: Logout on exit? Or just go back to website?
        // localStorage.removeItem('tweed_admin_logged_in'); // Uncomment to force logout
        location.reload();
    });

    // 4. Initialize Sub-Modules
    initScanner(); // Start listening for barcodes
    initProductManager(); // Load "Add Item" screen by default
}