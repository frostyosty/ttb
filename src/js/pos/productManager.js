import { supabase } from '../db.js';
import { initLabelEditor, printCurrentLabel } from './labelEditor.js';
import { renderAddItemForm } from './ui/addItemForm.js';

export async function initProductManager() {
    const container = document.getElementById('pos-content-area');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px;">Loading...</div>';

    // 1. Fetch Data
    const [catRes, tplRes] = await Promise.all([
        supabase.from('tweed_trading_categories').select('*').order('name'),
        supabase.from('tweed_trading_label_templates').select('*').order('created_at', { ascending: false })
    ]);

    // 2. Render UI (Added "Save Without Printing" button)
    container.innerHTML = renderAddItemForm(catRes.data, tplRes.data);
    
    // Inject the second button into the form
    const formBtn = container.querySelector('.submit-btn');
    if(formBtn) {
        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '10px';
        btnGroup.style.marginTop = '10px';
        
        formBtn.style.marginTop = '0';
        formBtn.style.flex = '1';
        
        const saveOnlyBtn = document.createElement('button');
        saveOnlyBtn.type = 'button';
        saveOnlyBtn.innerText = '💾 Save Only';
        saveOnlyBtn.className = 'pos-btn'; // Re-use existing class
        saveOnlyBtn.style.flex = '1';
        saveOnlyBtn.style.background = '#757575';
        saveOnlyBtn.style.color = 'white';
        saveOnlyBtn.style.justifyContent = 'center';
        
        // Replace original button with group
        formBtn.parentNode.insertBefore(btnGroup, formBtn);
        btnGroup.appendChild(saveOnlyBtn);
        btnGroup.appendChild(formBtn);
        
        // Bind "Save Only" Logic
        saveOnlyBtn.addEventListener('click', (e) => handleFormSubmit(e, false));
    }

    // 3. Init Editor
    const editor = await initLabelEditor('preview-box', {
        name: 'p-name',
        price: 'p-price'
    });

    // 4. Bind Editor Controls
    document.getElementById('toggle-edit-mode').addEventListener('change', (e) => {
        editor.toggleEdit(e.target.checked);
        const toolbar = document.getElementById('editor-toolbar');
        if(e.target.checked) toolbar.classList.remove('hidden');
        else toolbar.classList.add('hidden');
    });

    document.getElementById('p-template-loader').addEventListener('change', async (e) => {
        if(e.target.value) {
            await editor.loadTemplate(e.target.value);
            editor.refresh();
        }
    });

    // 5. Handle "Save & Print" (The main submit)
    document.getElementById('add-product-form').addEventListener('submit', (e) => handleFormSubmit(e, true));

    // --- SHARED SAVE LOGIC ---
    async function handleFormSubmit(e, shouldPrint) {
        e.preventDefault();
        
        // Get Buttons
        const form = document.getElementById('add-product-form');
        const btns = form.querySelectorAll('button');
        btns.forEach(b => b.disabled = true); // Disable all

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
                is_printed: shouldPrint // Track status
            });

            if (error) throw error;

            if (shouldPrint) {
                await printCurrentLabel({ name, price, sku, image_url: imageUrl });
            } else {
                alert("Saved to Inventory (Not Printed)");
            }

            // Reset UI
            form.reset();
            editor.refresh(); // ✅ FIXED: Uses editor instance, not undefined function
            document.getElementById('p-name').focus();

        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            btns.forEach(b => b.disabled = false);
        }
    }
}