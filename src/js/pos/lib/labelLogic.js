// src/js/pos/lib/labelLogic.js
import { initLabelEditor } from '../editor/index.js';
import { supabase } from '../../db.js';

/**
 * Initializes the Label Editor and binds standard controls (Edit Toggle, Template Loader)
 * Returns the 'editor' instance.
 */
export async function setupLabelEditorController({
    previewId,      // ID of the div to draw the label in
    inputMap,       // Object mapping data keys to DOM Input IDs: { name: 'p-name', price: 'p-price' }
    toggleId,       // ID of "Edit Layout" checkbox
    toolbarId,      // ID of the editor toolbar div
    templateSelectId // ID of the template dropdown
}) {
    
    // 1. Initialize the Core Editor
    const editor = await initLabelEditor(previewId, inputMap);

    // 2. Bind Edit Mode Toggle
    const toggle = document.getElementById(toggleId);
    const toolbar = document.getElementById(toolbarId);
    
    if (toggle && toolbar) {
        toggle.addEventListener('change', (e) => {
            editor.toggleEdit(e.target.checked);
            if (e.target.checked) toolbar.classList.remove('hidden');
            else toolbar.classList.add('hidden');
        });
    }

    // 3. Bind Template Loader
    const select = document.getElementById(templateSelectId);
    if (select) {
        select.addEventListener('change', async (e) => {
            if (e.target.value) {
                await editor.loadTemplate(e.target.value);
                editor.refresh(); // Force redraw with current form data
            }
        });
    }

    // 4. Bind Window Helpers (posAdd / posSave)
    // We overwrite these every time a tab loads so they point to the CURRENT editor
    window.posAdd = (type) => editor.addItem(type);
    
    window.posSave = async () => {
        const name = prompt("Name this label layout:");
        if (name) {
            const newTpl = await editor.saveTemplate(name);
            if (newTpl && select) {
                // Add new template to dropdown immediately
                const opt = document.createElement('option');
                opt.value = newTpl.id;
                opt.text = newTpl.name;
                select.insertBefore(opt, select.firstChild.nextSibling); // Add to top
                select.value = newTpl.id;
                alert("Template Saved!");
            }
        }
    };

    return editor;
}