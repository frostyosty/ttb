import { supabase } from '../db.js';
import { initLabelEditor, printCurrentLabel } from './labelEditor.js';
import { renderAddItemForm } from './ui/addItemForm.js';

export async function initProductManager() {
    const container = document.getElementById('pos-content-area');
    container.innerHTML = 'Loading...';

    // 1. Fetch Categories AND Saved Templates
    const [catRes, tplRes] = await Promise.all([
        supabase.from('tweed_trading_categories').select('*').order('name'),
        supabase.from('tweed_trading_label_templates').select('*').order('created_at', { ascending: false })
    ]);

    // 2. Render UI
    container.innerHTML = renderAddItemForm(catRes.data, tplRes.data);

    // 3. Init Editor Logic
    const editor = await initLabelEditor('preview-box', {
        name: 'p-name',
        price: 'p-price'
    });

    // --- BIND EDITOR ACTIONS ---
    // Toggle Edit Mode
    document.getElementById('toggle-edit-mode').addEventListener('change', (e) => {
        editor.toggleEdit(e.target.checked);
        const toolbar = document.getElementById('editor-toolbar');
        if(e.target.checked) toolbar.classList.remove('hidden');
        else toolbar.classList.add('hidden');
    });

    // Load Template Dropdown
    document.getElementById('p-template-loader').addEventListener('change', async (e) => {
        if(e.target.value) {
            await editor.loadTemplate(e.target.value);
            editor.refresh();
        }
    });

    // Global Window Hooks for the HTML buttons (lazy binding)
    window.posAdd = (type) => editor.addItem(type);
    window.posSave = async () => {
        const name = prompt("Name this label layout:");
        if(name) {
            const newTpl = await editor.saveTemplate(name);
            // Refresh dropdown (quick hack: reload module or append option)
            if(newTpl) {
                const select = document.getElementById('p-template-loader');
                const opt = document.createElement('option');
                opt.value = newTpl.id;
                opt.text = newTpl.name;
                select.appendChild(opt);
                select.value = newTpl.id;
            }
        }
    };

   
    // --- SAVE LOGIC ---
    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSaveProduct(e, updatePreview);
    });
}

// Separate function to handle the heavy lifting of saving
async function handleSaveProduct(e, resetPreviewCb) {
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    
    try {
        btn.disabled = true;
        btn.innerText = "Saving...";

        const name = document.getElementById('p-name').value;
        const price = document.getElementById('p-price').value;
        const catId = document.getElementById('p-cat').value || null;
        const stock = document.getElementById('p-stock').value;
        const file = document.getElementById('p-image').files[0];
        
        // Generate Real SKU
        const sku = 'TWD-' + Math.floor(100000 + Math.random() * 900000);

        // 1. Upload Image
        let imageUrl = null;
        if (file) {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const { data } = await supabase.storage.from('tweed_trading_assets').upload(fileName, file);
            if (data) imageUrl = `https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/tweed_trading_assets/${fileName}`;
        }

        // 2. Save to Database
        const { error } = await supabase.from('tweed_trading_products').insert({
            name, price, category_id: catId, sku, image_url: imageUrl, stock_level: stock
        });

        if (error) throw error;

        // 3. Print Label
        await printCurrentLabel({ name, price, sku });

        // 4. Reset Form
        e.target.reset();
        resetPreviewCb(); // Reset the visual preview
        alert("Saved & Sent to Printer!");
        document.getElementById('p-name').focus();

    } catch (error) {
        alert("Error saving: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}