import { supabase } from '../db.js'; // Re-using your connection
import JsBarcode from 'jsbarcode';

// State
let categories = [];

export async function initPOS() {
    console.log("🏪 Initializing POS System...");
    
    // 1. Fetch Categories for the dropdown
    const { data } = await supabase.from('tweed_trading_categories').select('*');
    if(data) categories = data;

    // 2. Render the Dashboard
    renderPOS();
}

function renderPOS() {
    const app = document.getElementById('app-container'); // We hijack the main app
    const header = document.getElementById('super-header');
    
    // Hide standard website elements
    header.style.display = 'none';
    document.querySelector('.main-nav').style.display = 'none';

    app.innerHTML = `
        <div id="pos-view">
            <header class="pos-header">
                <h2>🏭 Tweed ERP v1.0</h2>
                <button id="exit-pos" style="background:red; color:white; border:none; padding:5px 15px; border-radius:4px; cursor:pointer;">Exit POS</button>
            </header>
            
            <div class="pos-grid">
                <!-- SIDEBAR -->
                <aside class="pos-sidebar">
                    <button class="pos-btn active" onclick="alert('Already here')">📦 Add Product</button>
                    <button class="pos-btn">💰 New Sale (Cash Reg)</button>
                    <button class="pos-btn">📋 Inventory List</button>
                    <button class="pos-btn">📊 Reports</button>
                </aside>

                <!-- CONTENT -->
                <main class="pos-content">
                    <h1>Add New Inventory</h1>
                    
                    <form id="add-product-form" class="product-form">
                        <div class="form-group">
                            <label>Product Name</label>
                            <input type="text" id="p-name" placeholder="e.g. Vintage Rimu Door" required>
                        </div>

                        <div class="form-group">
                            <label>Category</label>
                            <select id="p-cat" required>
                                <option value="">Select Category...</option>
                                ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Price ($)</label>
                            <input type="number" id="p-price" step="0.01" placeholder="0.00" required>
                        </div>

                        <div class="form-group">
                            <label>Initial Stock</label>
                            <input type="number" id="p-stock" value="1" required>
                        </div>

                        <div class="form-group">
                            <label>Photo</label>
                            <input type="file" id="p-image" accept="image/*">
                        </div>

                        <button type="submit" style="background:#2e7d32; color:white; border:none; padding:12px; width:100%; border-radius:6px; font-size:1.1rem; cursor:pointer;">
                            💾 Save & Print Label
                        </button>
                    </form>
                </main>
            </div>
        </div>
        
        <!-- LABEL PREVIEW MODAL -->
        <div id="label-modal" class="modal hidden">
            <div class="modal-content" style="text-align:center;">
                <h3>🖨️ Label Preview</h3>
                <div id="sticker-canvas" class="sticker-mockup">
                    <h2 id="lbl-name" style="margin:0; font-size:1.2rem;">Product</h2>
                    <svg id="barcode"></svg>
                    <h3 id="lbl-price" style="margin:5px 0;">$0.00</h3>
                </div>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button id="btn-print-real" style="background:#2196f3; color:white; padding:10px 20px; border:none; border-radius:4px; cursor:pointer;">🖨️ Print Now</button>
                    <button id="btn-close-lbl" style="background:#ccc; padding:10px 20px; border:none; border-radius:4px; cursor:pointer;">Close</button>
                </div>
            </div>
        </div>
    `;

    // Exit Button Logic
    document.getElementById('exit-pos').addEventListener('click', () => {
        location.reload(); // Easiest way to get back to "Website Mode"
    });

    // Close Label Modal
    document.getElementById('btn-close-lbl').addEventListener('click', () => {
        document.getElementById('label-modal').classList.add('hidden');
    });

    // Form Submit Logic
    document.getElementById('add-product-form').addEventListener('submit', handleProductSubmit);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const catId = document.getElementById('p-cat').value;
    const stock = document.getElementById('p-stock').value;
    const file = document.getElementById('p-image').files[0];

    // 1. Generate SKU (Simple Logic: TWEED-[Random 4 Digits])
    // In real life, you might scan an existing barcode here, but we will generate one.
    const sku = 'TWD-' + Math.floor(1000 + Math.random() * 9000);

    console.log("Processing...", { name, sku });

    // 2. Upload Image (If exists)
    let imageUrl = null;
    if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('tweed_trading_assets')
            .upload(fileName, file);
        
        if (!error && data) {
            // Construct Public URL
            imageUrl = `https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/tweed_trading_assets/${fileName}`;
        }
    }

    // 3. Insert into Database
    const { error } = await supabase.from('tweed_trading_products').insert({
        name,
        price,
        category_id: catId,
        stock_level: stock,
        sku: sku,
        image_url: imageUrl
    });

    if (error) {
        alert("Error saving: " + error.message);
        return;
    }

    // 4. Show Label Maker
    generateLabel(name, price, sku);
}

function generateLabel(name, price, sku) {
    const modal = document.getElementById('label-modal');
    modal.classList.remove('hidden');

    document.getElementById('lbl-name').innerText = name.substring(0, 20); // Truncate for label
    document.getElementById('lbl-price').innerText = `$${price}`;

    // GENERATE BARCODE using JsBarcode
    JsBarcode("#barcode", sku, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: true
    });

    // Handle Actual Print
    document.getElementById('btn-print-real').onclick = () => {
        const content = document.getElementById('sticker-canvas').outerHTML;
        const win = window.open('', '', 'height=500,width=500');
        win.document.write('<html><head><title>Print Label</title>');
        win.document.write('</head><body >');
        win.document.write(content);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    };
}