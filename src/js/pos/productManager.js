import { supabase } from '../db.js';
import { initLabelEditor, printCurrentLabel } from './labelEditor.js';

export async function initProductManager() {
    const container = document.getElementById('pos-content-area');
    container.innerHTML = '<h3>Loading Categories...</h3>';

    // Fetch Categories
    const { data: categories } = await supabase
        .from('tweed_trading_categories')
        .select('*')
        .order('name', { ascending: true });

    // RENDER THE UI (Split View: Left Form, Right Preview)
    container.innerHTML = `
        <div style="display:flex; gap:20px; height:100%;">
            
            <!-- LEFT: INPUT FORM -->
            <div style="flex:1; overflow-y:auto;">
                <h1>Add New Inventory</h1>
                <form id="add-product-form" class="product-form">
                    
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" id="p-name" placeholder="Type to see preview..." required autofocus>
                    </div>

                    <div style="display:flex; gap:10px;">
                        <div class="form-group" style="flex:1;">
                            <label>Category</label>
                            <select id="p-cat">
                                <option value="">(Unlinked)</option>
                                ${(categories || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label>Price ($)</label>
                            <input type="number" id="p-price" step="0.01" placeholder="0.00" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Stock Count</label>
                        <input type="number" id="p-stock" value="1">
                    </div>

                    <div class="form-group">
                        <label>Photo</label>
                        <input type="file" id="p-image" accept="image/*" capture="environment">
                    </div>

                    <!-- LABEL CONFIGURATION CONTROLS -->
                    <div style="background:#f4f4f4; padding:10px; border-radius:8px; margin-bottom:15px;">
                        <label><strong>Label Design</strong></label>
                        <div style="display:flex; gap:5px; margin-top:5px;">
                            <button type="button" class="editor-btn" onclick="window.setLabelConfig('standard')">Standard</button>
                            <button type="button" class="editor-btn" onclick="window.setLabelConfig('qr')">QR + Info</button>
                            <button type="button" class="editor-btn" onclick="window.setLabelConfig('visual')">Photo Mode</button>
                        </div>
                    </div>

                    <button type="submit" class="submit-btn" style="width:100%; font-size:1.2rem; padding:15px; background:#ff9800; color:white; border:none; border-radius:6px;">
                        💾 Save & Print
                    </button>
                </form>
            </div>

            <!-- RIGHT: LIVE PREVIEW -->
            <div style="width:320px; background:#333; padding:20px; display:flex; flex-direction:column; align-items:center; border-radius:10px;">
                <h3 style="color:white; margin-top:0;">Live Label Preview</h3>
                <div style="background:white; padding:10px; border-radius:4px; box-shadow:0 0 10px rgba(0,0,0,0.5);">
                    <!-- The Label Container (Scales to resemble 62mm tape) -->
                    <div id="label-preview-container" style="border:1px dashed #ccc; min-height:200px;"></div>
                </div>
                <p style="color:#aaa; font-size:0.8rem; margin-top:10px;">Actual print size: 62mm wide</p>
            </div>
        </div>
    `;

    // Initialize Editor
    const editor = initLabelEditor('label-preview-container', {
        name: 'p-name',
        price: 'p-price'
    });

    // Expose config switcher to window (for the buttons above)
    window.setLabelConfig = (mode) => {
        let cfg = [];
        if(mode === 'standard') cfg = [{type:'title', fontSize:'18px'}, {type:'price', fontSize:'30px', bold:true}, {type:'barcode', height:50}, {type:'sku', fontSize:'10px'}];
        if(mode === 'qr') cfg = [{type:'qr', size:'35mm'}, {type:'title', fontSize:'14px'}, {type:'price', fontSize:'24px', bold:true}];
        if(mode === 'visual') cfg = [{type:'image', height:'30mm'}, {type:'title', fontSize:'16px'}, {type:'price', fontSize:'24px', bold:true}, {type:'barcode', height:30}];
        
        editor.setConfig(cfg);
    };

    // HANDLE SAVE
    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerText = "Saving...";

        const name = document.getElementById('p-name').value;
        const price = document.getElementById('p-price').value;
        const catId = document.getElementById('p-cat').value || null; // Handle Unlinked
        const stock = document.getElementById('p-stock').value;
        const file = document.getElementById('p-image').files[0];
        const sku = 'TWD-' + Math.floor(10000 + Math.random() * 90000);

        // Upload Image
        let imageUrl = null;
        if (file) {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const { data } = await supabase.storage.from('tweed_trading_assets').upload(fileName, file);
            if (data) imageUrl = `https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/tweed_trading_assets/${fileName}`;
        }

        // Save to DB
        const { error } = await supabase.from('tweed_trading_products').insert({
            name, price, category_id: catId, sku, image_url: imageUrl, stock_level: stock
        });

        if (error) {
            alert("Error: " + error.message);
            btn.disabled = false;
            return;
        }

        // Print
        await printCurrentLabel({ name, price, sku, image_url: imageUrl });

        // Reset
        e.target.reset();
        editor.refresh(); // Clear preview
        btn.disabled = false;
        btn.innerText = "💾 Save & Print";
        document.getElementById('p-name').focus();
    });
}