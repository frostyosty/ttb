import { supabase } from '../db.js';
import { initLabelEditor, printCurrentLabel } from './labelEditor.js';

export async function initGenericLabelMaker() {
    const container = document.getElementById('pos-content-area');
    
    // 1. Fetch saved templates to reuse layouts
    const { data: templates } = await supabase
        .from('tweed_trading_label_templates')
        .select('*')
        .order('created_at', { ascending: false });

    // 2. Render UI (Split View)
    container.innerHTML = `
        <div style="display:flex; height:100%; overflow:hidden;">
            
            <!-- LEFT: CONTROLS -->
            <div style="flex:1; padding:20px; overflow-y:auto; background:#f9f9f9;">
                <h2 style="margin-top:0; color:#d32f2f;">🏷️ Quick Label Maker</h2>
                <p style="color:#666; font-size:0.9rem;">Create generic signs, shelf tags, or bulk bin labels.</p>
                
                <div class="form-group" style="margin-bottom:15px;">
                    <label>Main Title (e.g. "All Bricks")</label>
                    <input type="text" id="gl-title" placeholder="Big Header Text" style="font-size:1.2rem; padding:10px;">
                </div>

                <div class="form-group" style="margin-bottom:15px;">
                    <label>Subtitle / Price (e.g. "$5.00 ea")</label>
                    <input type="text" id="gl-subtitle" placeholder="Price or details" style="font-size:1.2rem; padding:10px;">
                </div>

                <div class="form-group" style="margin-bottom:15px;">
                    <label>Barcode / QR Content (Optional)</label>
                    <input type="text" id="gl-code" placeholder="Data to scan (e.g. BRICK-BULK)" style="font-family:monospace;">
                    <small style="color:#666;">Leave empty to hide barcode</small>
                </div>

                <hr style="border:0; border-top:1px solid #ddd; margin:20px 0;">

                <div class="form-group">
                    <label>Load Layout Template</label>
                    <select id="gl-template-loader" style="padding:10px;">
                        <option value="">-- Default Layout --</option>
                        ${(templates || []).map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                </div>

                <button id="btn-print-generic" class="submit-btn" style="width:100%; padding:20px; font-size:1.3rem; margin-top:20px; background:#d32f2f; color:white; border:none; border-radius:6px; cursor:pointer;">
                    🖨️ Print Label
                </button>
            </div>

            <!-- RIGHT: PREVIEW -->
            <div style="width:340px; background:#333; padding:20px; display:flex; flex-direction:column; align-items:center; border-left:1px solid #ddd;">
                <h3 style="color:white; margin-top:0;">Live Preview</h3>
                
                <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px;">
                    <label style="color:#ccc; font-size:0.8rem; cursor:pointer;">
                        <input type="checkbox" id="toggle-generic-edit"> Edit Layout
                    </label>
                    <button onclick="window.posAddGeneric('static_text')" style="font-size:0.8rem; padding:2px 8px;">+Text</button>
                </div>

                <div id="generic-preview-box" style="background:white; min-height:200px; width:100%; border-radius:4px; box-shadow:0 0 15px rgba(0,0,0,0.5);"></div>
                
                <p style="color:#aaa; font-size:12px; margin-top:10px;">62mm Width</p>
            </div>
        </div>
    `;

    // 3. Init Editor 
    // We map generic fields to the 'product' fields expected by labelEditor
    const editor = await initLabelEditor('generic-preview-box', {
        name: 'gl-title',
        price: 'gl-subtitle'
    });

    // Special handling for the 'Code' input since labelEditor expects 'sku' hidden or auto-generated
    const codeInput = document.getElementById('gl-code');
    codeInput.addEventListener('input', () => {
        // Manually trigger a refresh but inject our custom SKU/Code
        // We do this by hacking the preview data in the next step or just relying on the fact that
        // labelEditor refreshes on input events.
        // Actually, we need to wire this up manually because labelEditor listens to specific IDs passed in config.
        // We passed name/price, but not SKU.
        
        // We override the refresh logic slightly for this module
        const data = {
            name: document.getElementById('gl-title').value,
            price: document.getElementById('gl-subtitle').value,
            sku: codeInput.value || ' ' // Space prevents barcode error if empty
        };
        // We can access renderLabel directly or just use editor.refresh if we could inject data.
        // Since initLabelEditor pulls from DOM IDs, we can't easily inject the SKU without modifying labelEditor.
        // QUICK FIX: Let's assume the labelEditor uses a default 'sku' unless we change it.
        // A better way: Let's just update the DOM element that labelEditor reads from? 
        // No, labelEditor reads from a hidden object list. 
        
        // Let's just update the PREVIEW logic locally:
        import('./labelEditor.js').then(mod => {
            mod.renderLabel(document.getElementById('generic-preview-box'), editor.getConfig(), data, document.getElementById('toggle-generic-edit').checked);
        });
    });

    // We need to shim the refresh for the other inputs to include the custom code
    ['gl-title', 'gl-subtitle'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
             const data = {
                name: document.getElementById('gl-title').value,
                price: document.getElementById('gl-subtitle').value,
                sku: document.getElementById('gl-code').value || ' '
            };
            import('./labelEditor.js').then(mod => {
                mod.renderLabel(document.getElementById('generic-preview-box'), editor.getConfig(), data, document.getElementById('toggle-generic-edit').checked);
            });
        });
    });

    // Bind Edit Toggle
    document.getElementById('toggle-generic-edit').addEventListener('change', (e) => {
        editor.toggleEdit(e.target.checked);
    });

    // Bind Template Loader
    document.getElementById('gl-template-loader').addEventListener('change', async (e) => {
        if(e.target.value) {
            await editor.loadTemplate(e.target.value);
            // Trigger manual refresh
            document.getElementById('gl-title').dispatchEvent(new Event('input'));
        }
    });

    // Bind Add Text
    window.posAddGeneric = (type) => editor.addItem(type);

    // Bind Print
    document.getElementById('btn-print-generic').addEventListener('click', async () => {
        const data = {
            name: document.getElementById('gl-title').value,
            price: document.getElementById('gl-subtitle').value,
            sku: document.getElementById('gl-code').value || ''
        };
        await printCurrentLabel(data);
    });
}