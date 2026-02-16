// src/js/pos/productManager.js
import { supabase } from '../db.js';
import { renderAddItemForm } from './ui/addItemForm.js';
import { setupLabelEditorController } from './lib/labelLogic.js'; // 👈 USES SHARED LOGIC

export async function initProductManager() {
    const container = document.getElementById('pos-content-area');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px;">Loading...</div>';

    // 1. Fetch Categories & Templates
    const [catRes, tplRes] = await Promise.all([
        supabase.from('tweed_trading_categories').select('*').order('name'),
        supabase.from('tweed_trading_label_templates').select('*').order('created_at', { ascending: false })
    ]);

    // 2. Render UI
    container.innerHTML = renderAddItemForm(catRes.data, tplRes.data);
    
    // 3. Inject "Save Only" Button (Custom logic for this form)
    setupActionButtons();

    // 4. Initialize Shared Editor Logic
    // This handles all the "posAdd", "posSave", "toggle-edit-mode" logic for us
    const editor = await setupLabelEditorController({
        previewId: 'preview-box',
        inputMap: { name: 'p-name', price: 'p-price' }, // Maps form inputs to label fields
        toggleId: 'toggle-edit-mode',
        toolbarId: 'editor-toolbar',
        templateSelectId: 'p-template-loader'
    });

    // 5. Handle Form Submit
    document.getElementById('add-product-form').addEventListener('submit', (e) => handleFormSubmit(e, true, editor));
}

// Helper to add the grey button
function setupActionButtons() {
    const formBtn = document.querySelector('.submit-btn');
    if(formBtn) {
        const btnGroup = document.createElement('div');
        Object.assign(btnGroup.style, { display:'flex', gap:'10px', marginTop:'10px' });
        
        formBtn.style.marginTop = '0';
        formBtn.style.flex = '1';
        
        const saveOnlyBtn = document.createElement('button');
        saveOnlyBtn.type = 'button';
        saveOnlyBtn.innerText = '💾 Save Only';
        saveOnlyBtn.className = 'pos-btn';
        Object.assign(saveOnlyBtn.style, { flex:'1', background:'#757575', color:'white', justifyContent:'center' });
        
        // Bind click event for Save Only (pass false for shouldPrint)
        // We need to access the handler, so we dispatch a custom event or bind directly if we hoist the handler.
        // EASIER WAY: Let the main handler check the submitter, or just attach listener here.
        saveOnlyBtn.addEventListener('click', (e) => {
            // We need to trigger the main submit logic but with print=false.
            // Since we can't easily pass the 'editor' instance here if it's not ready, 
            // we will cheat and trigger the form submit, but set a flag on the form.
            const form = document.getElementById('add-product-form');
            form.dataset.print = "false";
            form.requestSubmit(); // Triggers the main listener
        });

        formBtn.addEventListener('click', () => {
             document.getElementById('add-product-form').dataset.print = "true";
        });
        
        formBtn.parentNode.insertBefore(btnGroup, formBtn);
        btnGroup.appendChild(saveOnlyBtn);
        btnGroup.appendChild(formBtn);
    }
}

async function handleFormSubmit(e, defaultPrintState, editor) {
    e.preventDefault();
    
    // Check if we clicked "Save Only" or "Save & Print"
    const shouldPrint = e.target.dataset.print !== "false"; 

    const btns = document.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);

    try {
        const name = document.getElementById('p-name').value;
        const price = document.getElementById('p-price').value;
        const catId = document.getElementById('p-cat').value || null;
        const stock = document.getElementById('p-stock').value;
        const file = document.getElementById('p-image').files[0];
        const sku = 'TWD-' + Math.floor(100000 + Math.random() * 900000);

        // Upload Image
        let imageUrl = null;
        if (file) {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const { data } = await supabase.storage.from('tweed_trading_assets').upload(fileName, file);
            if (data) imageUrl = `https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/tweed_trading_assets/${fileName}`;
        }

        // DB Insert
        const { error } = await supabase.from('tweed_trading_products').insert({
            name, price, category_id: catId, sku, 
            image_url: imageUrl, stock_level: stock,
            is_printed: shouldPrint
        });

        if (error) throw error;

        // Print?
        if (shouldPrint) {
            await editor.print({ name, price, sku, image_url: imageUrl });
        } else {
            alert("Saved to Inventory (Not Printed)");
        }

        // Reset
        e.target.reset();
        editor.refresh(); 
        document.getElementById('p-name').focus();

    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btns.forEach(b => b.disabled = false);
    }
}