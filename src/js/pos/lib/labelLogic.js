// src/js/pos/lib/labelLogic.js
import { initLabelEditor } from '../editor/index.js';
import { supabase } from '../../db.js';

/**
 * Initializes the Label Editor and binds standard controls (Edit Toggle, Template Loader)
 * Returns the 'editor' instance.
 */
export async function setupLabelEditorController({
    previewId, inputMap, toggleId, toolbarId, templateSelectId
}) {
    
    // 1. Initialize Core
    // Ensure preview container exists before starting
    if (!document.getElementById(previewId)) {
        console.warn(`Label Editor: Preview container '${previewId}' not found.`);
        return null; 
    }

    const editor = await initLabelEditor(previewId, inputMap);

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

    // 4. Bind Window Helpers
    window.posAdd = (type) => editor.addItem(type);
    
    window.posSave = async () => {
        // ... existing save logic ...
        // (Make sure to check if 'select' exists before appending to it)
        const name = prompt("Layout Name:");
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