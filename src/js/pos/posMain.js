// ./src/js/pos/posMain.js 

import { initScanner } from './scanner.js';
import { initProductManager } from './productManager.js';
import { initInventory } from './inventory.js';
import { initCheckout } from './checkout.js';
import { initCustomerFacing } from './customerFacing.js';
import { initGenericLabelMaker } from './genericLabelMaker.js';
import { initTransactions } from './transactions.js';
import { initReports } from './reports.js';


export async function initPOS() {
  console.log("🏭 Loading Tweed ERP...");
  checkOfflineQueue();
  const app = document.getElementById('app-container');
  const header = document.getElementById('super-header');

  if (!app) {
    console.error("CRITICAL: App container not found!");
    return;
  }

  if (header) header.style.display = 'none';
  if (document.querySelector('.main-nav')) document.querySelector('.main-nav').style.display = 'none';

  app.innerHTML = `
        <div id="pos-view">
             <!-- ... (Keep your existing Header/Sidebar HTML) ... -->
             <header class="pos-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <strong style="font-size:1.2rem;">Tweed ERP</strong>
                </div>
                <button id="exit-pos" style="background:#d32f2f; color:white; border:none; padding:5px 12px; border-radius:4px;">Exit</button>
            </header>

            <div class="pos-grid">
                <nav class="pos-sidebar">
                    <button class="pos-btn active" data-tab="add">📦 Add Item</button>
                    <button class="pos-btn" data-tab="checkout">💰 Checkout</button>
                    <button class="pos-btn" data-tab="inventory">📋 Inventory</button>
                    <hr style="border:0; border-top:1px solid #ddd; margin:5px 0;">
                    <button class="pos-btn" data-tab="labels">🏷️ Label Maker</button>
                    <button class="pos-btn" data-tab="settings">⚙️ Public Store</button>
                     <button class="pos-btn" data-tab="transactions">📜 History</button> <!-- NEW -->
    <button class="pos-btn" data-tab="reports">📈 Financials</button> <!-- NEW -->
    <hr style="border:0; border-top:1px solid #ddd; margin:5px 0;">
                </nav>

                <main class="pos-content" id="pos-content-area">
                    <!-- Dynamic Content Loads Here -->
                </main>
            </div>
        </div>
    `;

  initScanner();
  document.getElementById('exit-pos').addEventListener('click', () => location.reload());

  const tabs = document.querySelectorAll('.pos-btn[data-tab]');
  tabs.forEach((btn) => {
    btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
  });

  setTimeout(() => {
    switchTab('add');
  }, 50);
}

function switchTab(tabName) {

  document.querySelectorAll('.pos-btn').forEach((b) => b.classList.remove('active'));
  document.querySelector(`.pos-btn[data-tab="${tabName}"]`)?.classList.add('active');

  const container = document.getElementById('pos-content-area');
  container.innerHTML = '';

  if (tabName === 'add') {
    initProductManager();
  } else
  if (tabName === 'checkout') {
    initCheckout();
  } else
  if (tabName === 'inventory') {
    initInventory();
  } else
  if (tabName === 'labels') {
    initGenericLabelMaker();
  } else
  if (tabName === 'settings') {
    initCustomerFacing();
  } else
  if (tabName === 'transactions') initTransactions();else
  if (tabName === 'reports') initReports();
}

async function checkOfflineQueue() {
    const items = await getOfflineQueue();
    if (items.length > 0) {
        const header = document.querySelector('.pos-header');
        const syncBtn = document.createElement('button');
        syncBtn.id = 'sync-btn';
        syncBtn.innerHTML = `⚠️ Sync ${items.length} Items`;
        Object.assign(syncBtn.style, {
            background: '#ff9800', color: 'white', border: 'none', 
            padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        });

        syncBtn.onclick = async () => {
            if (!navigator.onLine) return alert("You are still offline!");
            
            syncBtn.innerText = "Syncing...";
            syncBtn.disabled = true;

            let successCount = 0;

            for (const item of items) {
                try {
                    let imageUrl = null;
                    // Upload Image
                    if (item.imageFile) {
                        const fileName = `${Date.now()}_offline.jpg`;
                        await supabase.storage.from('tweed_trading_assets').upload(fileName, item.imageFile);
                        const { data } = supabase.storage.from('tweed_trading_assets').getPublicUrl(fileName);
                        imageUrl = data.publicUrl;
                    }

                    // Insert Row
                    const { error } = await supabase.from('tweed_trading_products').insert({
                        name: item.name, price: item.price, category_id: item.category_id, 
                        sku: item.sku, stock_level: item.stock_level, is_printed: item.is_printed,
                        image_url: imageUrl
                    });

                    if (error) throw error;

                    // Delete from local queue
                    await deleteFromOfflineQueue(item.id);
                    successCount++;

                } catch (e) {
                    console.error("Sync error on item:", item, e);
                }
            }

            syncBtn.remove();
            showPosToast(`Successfully synced ${successCount} items!`);
            
            // Refresh Inventory if we are on that tab
            const invSearch = document.getElementById('inv-search');
            if (invSearch) invSearch.dispatchEvent(new Event('input'));
        };

        header.insertBefore(syncBtn, document.getElementById('exit-pos'));
    }
}