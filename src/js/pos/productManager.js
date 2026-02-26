import { supabase } from '../db.js';
import { renderAddItemForm } from './ui/addItemForm.js';
import { setupLabelEditorController } from './lib/labelLogic.js';
import { openCategoryManager } from './ui/categoryManager.js';

// 👇 New Imports
import { setupActionButtons } from './lib/uiHelpers.js';
import { handleInventorySubmit } from './lib/formHandler.js';
import { initSmartCategory, initSmartTemplate } from './lib/smartFeatures.js';

export async function initProductManager() {
    const container = document.getElementById('pos-content-area');
    if (!container) {
        console.error("POS Content Area missing");
        return;
    }
    
    container.innerHTML = '<div style="padding:20px;">Loading...</div>';

    // 1. Fetch Categories & Templates
    const [catRes, tplRes] = await Promise.all([
        supabase.from('tweed_trading_categories').select('*').order('name'),
        supabase.from('tweed_trading_label_templates').select('*').order('created_at', { ascending: false })
    ]);

    if (!document.getElementById('pos-content-area')) return;

    // 2. Render UI
    container.innerHTML = renderAddItemForm(catRes.data, tplRes.data);
    setupActionButtons(); // Injects the "Save Only" button

    // 3. Initialize Shared Editor Logic
    await new Promise(r => setTimeout(r, 0)); // DOM Paint Wait

    const editor = await setupLabelEditorController({
        previewId: 'preview-box',
        inputMap: { name: 'p-name', price: 'p-price' },
        toggleId: 'toggle-edit-mode',
        toolbarId: 'editor-toolbar',
        templateSelectId: 'p-template-loader',
        imageInputId: 'p-image' // Important: Passes the ID so editor handles Blob generation
    });

    if (!editor) return;

    // 4. 🧠 INITIALIZE SMART FEATURES
    // Pass the category data we fetched earlier
    initSmartCategory('p-name', 'p-cat', catRes.data);
    initSmartTemplate('p-cat', 'p-template-loader', catRes.data);

    // 5. Bind Helpers (Category Manager, Paper Size)
    bindHelperControls(editor);

    // 6. Auto-Insert Image Logic
    // (If user uploads a photo but no image element exists on label, add one)
    const photoInput = document.getElementById('p-image');
    if (photoInput) {
        photoInput.addEventListener('change', () => {
            if (photoInput.files[0]) {
                // Check if 'image' element exists in current config
                const currentConfig = editor.getConfig(); 
                const hasImage = currentConfig.some(el => el.type === 'image');

                if (!hasImage) {
                    editor.addItem('image'); // Auto-add to layout
                }
                // Note: The editor inside 'setupLabelEditorController' already handles 
                // generating the Blob URL because we passed 'imageInputId'.
                editor.refresh();
            }
        });
    }

    // 7. Handle Form Submit
    const form = document.getElementById('add-product-form');
    if (form) {
        form.addEventListener('submit', (e) => handleInventorySubmit(e, editor));
    }
}

function bindHelperControls(editor) {
    // Manage Categories Button
    const btnManageCats = document.getElementById('btn-manage-cats');
    if (btnManageCats) {
        btnManageCats.addEventListener('click', () => {
            openCategoryManager(async () => {
                const { data } = await supabase.from('tweed_trading_categories').select('*').order('name');
                const sel = document.getElementById('p-cat');
                if (sel && data) {
                    const oldVal = sel.value;
                    sel.innerHTML = '<option value="">-- Unlinked --</option>' + 
                                    data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
                    sel.value = oldVal;
                }
            });
        });
    }

    // Paper Size
    const sizeSelect = document.getElementById('p-paper-size');
    if (sizeSelect) {
        sizeSelect.addEventListener('change', () => {
            if (editor && editor.setPaperSize) {
                editor.setPaperSize(sizeSelect.value);
            }
        });
    }
}