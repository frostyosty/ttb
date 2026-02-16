// src/js/pos/genericLabelMaker.js
import { supabase } from '../db.js';
import { renderGenericLabelForm } from './ui/genericLabelForm.js';
import { setupLabelEditorController } from './lib/labelLogic.js'; // 👈 Shared Logic

export async function initGenericLabelMaker() {
    const container = document.getElementById('pos-content-area');
    container.innerHTML = 'Loading Templates...';

    // 1. Fetch Templates
    const { data: templates } = await supabase
        .from('tweed_trading_label_templates')
        .select('*')
        .order('created_at', { ascending: false });

    // 2. Render UI
    container.innerHTML = renderGenericLabelForm(templates);

    // 3. Initialize Editor (Shared Logic)
    // We map the generic fields to standard 'name', 'price', 'sku' keys expected by the renderer
    const editor = await setupLabelEditorController({
        previewId: 'generic-preview-box',
        inputMap: { 
            name: 'gl-title', 
            price: 'gl-subtitle',
            sku: 'gl-code'
        },
        toggleId: 'toggle-generic-edit',
        toolbarId: 'generic-toolbar',
        templateSelectId: 'gl-template-loader'
    });

    // 4. Bind Print Button
    document.getElementById('btn-print-generic').addEventListener('click', async () => {
        const data = {
            name: document.getElementById('gl-title').value,
            price: document.getElementById('gl-subtitle').value,
            sku: document.getElementById('gl-code').value || ''
        };
        await editor.print(data);
    });
}