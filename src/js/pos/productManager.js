import { supabase } from '../db.js';
import { printLabel } from './labelPrinter.js';

export async function initProductManager() {
    const container = document.getElementById('pos-content-area');
    
    container.innerHTML = '<h3>Loading...</h3>';

    // Fetch Categories
    const { data: categories } = await supabase.from('tweed_trading_categories').select('*');
    
    // Render Form
    container.innerHTML = `
        <h1>Add New Inventory</h1>
        <form id="add-product-form" class="product-form">
            <div class="form-group">
                <label>Product Name</label>
                <input type="text" id="p-name" placeholder="e.g. Rimu Door 810mm" required autofocus>
            </div>
            
            <div style="display:flex; gap:10px;">
                <div class="form-group" style="flex:1;">
                    <label>Category</label>
                    <select id="p-cat" required>
                        <option value="">Select...</option>
                        ${(categories || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Price ($)</label>
                    <input type="number" id="p-price" step="0.01" placeholder="0.00" required>
                </div>
            </div>

            <div class="form-group">
                <label>Photo</label>
                <input type="file" id="p-image" accept="image/*" capture="environment">
            </div>


            <div class="form-group">
        <label>Label Style</label>
        <select id="p-label-style">
            <option value="standard">Standard (Barcode)</option>
            <option value="smart_qr">Smart (QR + Details)</option>
            <option value="visual">Visual (Photo + Barcode)</option>
        </select>
    </div>
    
            <button type="submit" class="submit-btn" style="width:100%; margin-top:10px;">
                💾 Save & Print Label
            </button>
        </form>
    `;

    // Bind Submit
    document.getElementById('add-product-form').addEventListener('submit', handleSave);
}

async function handleSave(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Saving...";

    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const catId = document.getElementById('p-cat').value;
    const file = document.getElementById('p-image').files[0];

    // Generate SKU
    const sku = 'TWD-' + Math.floor(10000 + Math.random() * 90000);

    // Upload Image logic (Simplified for brevity)
    let imageUrl = null;
    if (file) {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
        const { data } = await supabase.storage.from('tweed_trading_assets').upload(fileName, file);
        if (data) imageUrl = `https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/tweed_trading_assets/${fileName}`;
    }

    // Insert DB
    const { error } = await supabase.from('tweed_trading_products').insert({
        name, price, category_id: catId, sku, image_url: imageUrl, stock_level: 1
    });

    if (error) {
        alert("Error: " + error.message);
        btn.disabled = false;
        return;
    }

    // Success -> Print
    await printLabel({ name, price, sku });
    
    // Reset Form
    e.target.reset();
    btn.disabled = false;
    btn.innerText = "💾 Save & Print Label";
    document.getElementById('p-name').focus();
}