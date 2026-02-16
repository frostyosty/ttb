// src/js/pos/ui/genericLabelForm.js

export function renderGenericLabelForm(templates) {
    return `
    <div style="display:flex; height:100%; overflow:hidden;">
        
        <!-- LEFT: CONTROLS -->
        <div style="flex:1; padding:20px; overflow-y:auto; background:#f9f9f9;">
            <h2 style="margin-top:0; color:#d32f2f;">🏷️ Generic Label Maker</h2>
            <p style="color:#666; font-size:0.9rem;">Create signs or bulk tags. Does not save to inventory.</p>
            
            <div class="form-group" style="margin-bottom:15px;">
                <label>Main Title</label>
                <input type="text" id="gl-title" placeholder="e.g. All Bricks" style="font-size:1.2rem; padding:10px; width:100%;">
            </div>

            <div class="form-group" style="margin-bottom:15px;">
                <label>Subtitle / Price</label>
                <input type="text" id="gl-subtitle" placeholder="e.g. $5.00 ea" style="font-size:1.2rem; padding:10px; width:100%;">
            </div>

            <div class="form-group" style="margin-bottom:15px;">
                <label>Barcode / QR Data</label>
                <input type="text" id="gl-code" placeholder="Optional data (e.g. BULK-001)" style="font-family:monospace; width:100%;">
            </div>

            <hr style="border:0; border-top:1px solid #ddd; margin:20px 0;">

            <div class="form-group">
                <label>Template</label>
                <select id="gl-template-loader" style="padding:10px; width:100%;">
                    <option value="">-- Default Layout --</option>
                    ${(templates || []).map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
            </div>

            <button id="btn-print-generic" class="pos-btn" style="width:100%; padding:20px; font-size:1.3rem; margin-top:20px; background:#d32f2f; color:white; justify-content:center;">
                🖨️ Print Label
            </button>
        </div>

        <!-- RIGHT: PREVIEW -->
        <div style="width:340px; background:#333; padding:20px; display:flex; flex-direction:column; align-items:center; border-left:1px solid #ddd;">
            
            <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px; color:white;">
                <label style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                    <input type="checkbox" id="toggle-generic-edit"> Edit Layout
                </label>
                <div id="generic-toolbar" class="hidden" style="display:flex; gap:5px;">
                    <button onclick="window.posAdd('text')" style="font-size:0.8rem;">+Text</button>
                    <button onclick="window.posAdd('barcode')" style="font-size:0.8rem;">+Bar</button>
                    <button onclick="window.posSave()" style="font-size:0.8rem; background:#2196f3; color:white;">Save</button>
                </div>
            </div>

            <div id="generic-preview-box" style="background:white; min-height:200px; width:100%; border-radius:4px;"></div>
            
            <!-- PROPERTIES PANEL (Context Menu) -->
            <div id="editor-properties-panel" style="width:100%; background:#f4f4f4; margin-top:15px; padding:10px; border-radius:4px; min-height:80px;">
                <small style="color:#666;">Select element to edit</small>
            </div>
        </div>
    </div>
    `;
}