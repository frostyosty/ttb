// src/js/pos/productManager.js
import { supabase } from '../db.js';
import { renderAddItemForm } from './ui/addItemForm.js';
import { setupLabelEditorController } from './lib/labelLogic.js';
import { openCategoryManager } from './ui/categoryManager.js';

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
    setupActionButtons();

    // 3. Initialize Editor
    const editor = await setupLabelEditorController({
        previewId: 'preview-box',
        inputMap: { name: 'p-name', price: 'p-price' },
        toggleId: 'toggle-edit-mode',
        toolbarId: 'editor-toolbar',
        templateSelectId: 'p-template-loader'
    });

    // 👇 NEW: Bind Category Manager Button
    const btnManageCats = document.getElementById('btn-manage-cats');
    if(btnManageCats) {
        btnManageCats.addEventListener('click', () => {
            openCategoryManager(async () => {
                // Refresh Dropdown after modal closes
                const { data } = await supabase.from('tweed_trading_categories').select('*').order('name');
                const sel = document.getElementById('p-cat');
                const oldVal = sel.value;
                sel.innerHTML = '<option value="">-- Unlinked --</option>' + 
                                data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
                sel.value = oldVal;
            });
        });
    }

    // 👇 NEW: Handle Paper Size Change
    const sizeSelect = document.getElementById('p-paper-size');
    sizeSelect.addEventListener('change', () => {
        // Pass the new size to the refresh function
        // (You may need to update 'setupLabelEditorController' to accept a size getter, 
        //  but simpler is to update the 'editor.refresh' method in editor/index.js)
        editor.setPaperSize(sizeSelect.value);
        editor.refresh();
    });

    
    // 3. Inject "Save Only" Button (Custom logic for this form)
    setupActionButtons();


    // 5. Handle Form Submit
    document.getElementById('add-product-form').addEventListener('submit', (e) => handleFormSubmit(e, true, editor));
}

// Helper to add the grey button
function setupActionButtons() {
    const originalSubmitBtn = document.querySelector('#add-product-form .submit-btn');
    
    // Safety check: Don't run this twice if we reload the tab
    if(originalSubmitBtn && !originalSubmitBtn.dataset.processed) {
        
        // 1. Mark as processed
        originalSubmitBtn.dataset.processed = "true";
        
        // 2. Ensure the original button text is correct
        originalSubmitBtn.innerText = "💾 Save & Print Label";
        originalSubmitBtn.style.flex = "1";
        originalSubmitBtn.style.marginTop = "0"; // Reset margin for flex layout

        // 3. Create Container
        const btnGroup = document.createElement('div');
        Object.assign(btnGroup.style, { display:'flex', gap:'10px', marginTop:'10px' });

        // 4. Create "Save Only" Button
        const saveOnlyBtn = document.createElement('button');
        saveOnlyBtn.type = 'button'; // Important: Prevent default submit
        saveOnlyBtn.innerText = '💾 Save Only';
        saveOnlyBtn.className = 'pos-btn';
        Object.assign(saveOnlyBtn.style, { flex:'1', background:'#757575', color:'white', justifyContent:'center' });

        // 5. Insert into DOM
        originalSubmitBtn.parentNode.insertBefore(btnGroup, originalSubmitBtn);
        btnGroup.appendChild(saveOnlyBtn);
        btnGroup.appendChild(originalSubmitBtn); // Move original into group

        // 6. Bind Logic
        saveOnlyBtn.addEventListener('click', () => {
             const form = document.getElementById('add-product-form');
             form.dataset.print = "false"; // Signal to not print
             form.requestSubmit(); // Trigger main form handler
        });

        originalSubmitBtn.addEventListener('click', () => {
             document.getElementById('add-product-form').dataset.print = "true";
        });
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