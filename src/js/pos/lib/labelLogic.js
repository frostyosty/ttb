// src/js/pos/lib/labelLogic.js
import { initLabelEditor } from '../editor/index.js';
import { supabase } from '../../db.js';
import { showPosInput } from '../ui/posModals.js'; // Import it
import { openTemplateManager } from '../ui/templates/index.js';

/**
 * Initializes the Label Editor and binds standard controls (Edit Toggle, Template Loader)
 * Returns the 'editor' instance.
 */
export async function setupLabelEditorController({
    previewId, inputMap, toggleId, toolbarId, templateSelectId, imageInputId
}) {
    
    // 1. Initialize Core
    // Ensure preview container exists before starting
    if (!document.getElementById(previewId)) {
        console.warn(`Label Editor: Preview container '${previewId}' not found.`);
        return null; 
    }

    const editor = await initLabelEditor(previewId, inputMap, imageInputId );

    // 2. Bind Edit Toggle (Safe Check)
    const toggle = document.getElementById(toggleId);
    const toolbar = document.getElementById(toolbarId);
    
    if (toggle && toolbar) {
        // Remove old listeners to be safe (cloning node is a quick hack, or just ignore)
        toggle.addEventListener('change', (e) => {
            // 👇 Call the function we just exposed in step 2
            editor.toggleEdit(e.target.checked);
            
            if (e.target.checked) toolbar.classList.remove('hidden');
            else toolbar.classList.add('hidden');
        });
    }

    // 3. Bind Template Loader (Safe Check)
    const select = document.getElementById(templateSelectId);
    if (select) {
        select.addEventListener('change', async (e) => {
            if (e.target.value) {
                await editor.loadTemplate(e.target.value);
                editor.refresh();
            }
        });
    }

    // Bind Template Manager Button
    const btnManage = document.getElementById('btn-manage-tpl');
    if(btnManage) {
        btnManage.addEventListener('click', () => {
            openTemplateManager(async () => {
                // Refresh Dropdown
                const { data } = await supabase.from('tweed_trading_label_templates').select('*').order('name');
                const select = document.getElementById(templateSelectId);
                if(select && data) {
                    const oldVal = select.value;
                    select.innerHTML = '<option value="">-- Default Layout --</option>' + 
                                       data.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
                    select.value = oldVal; // Try to keep selection if it still exists
                }
            });
        });
    }

    // 4. Bind Window Helpers
    window.posAdd = (type) => editor.addItem(type);
    
    window.posSave = async () => {
        // ... existing save logic ...
        // (Make sure to check if 'select' exists before appending to it)
const name = await showPosInput("Name this Layout:", "e.g. 62mm Standard");

        if(name) {
            const newTpl = await editor.saveTemplate(name);
            if(newTpl && select) {
                 const opt = document.createElement('option');
                 opt.value = newTpl.id;
                 opt.text = newTpl.name;
                 select.insertBefore(opt, select.firstChild.nextSibling);
                 select.value = newTpl.id;
            }
        }
    };

    return editor;
}