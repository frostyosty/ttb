// ./src/js/pos/ui/genericLabelForm.js 


export function renderGenericLabelForm(templates) {
  return `
    <div style="display:flex; height:100%; overflow:hidden;">

        <!-- LEFT: CONTROLS -->
        <div style="flex:1; padding:20px; overflow-y:auto; background:#f9f9f9;">
            <h2 style="margin-top:0; color:#d32f2f;">🏷️ Generic Label Maker</h2>

            <!-- ... (Keep Title/Subtitle inputs) ... -->
            <div class="form-group" style="margin-bottom:15px;">
                <label>Main Title</label>
                <input type="text" id="gl-title" placeholder="e.g. All Bricks" style="font-size:1.2rem; padding:10px; width:100%;">
            </div>

            <div class="form-group" style="margin-bottom:15px;">
                <label>Subtitle / Price</label>
                <input type="text" id="gl-subtitle" placeholder="e.g. $5.00 ea" style="font-size:1.2rem; padding:10px; width:100%;">
            </div>

            <div class="form-group" style="margin-bottom:15px;">
                <label>Barcode Data</label>
                <input type="text" id="gl-code" placeholder="Optional data" style="font-family:monospace; width:100%;">
            </div>

            <!-- 👇 NEW PHOTO INPUT -->
            <div class="form-group" style="margin-bottom:15px;">
                <label>Photo / Logo (Optional)</label>
                <input type="file" id="gl-image" accept="image/*" style="width:100%;">
            </div>

            <hr style="border:0; border-top:1px solid #ddd; margin:20px 0;">

            <!-- ... (Keep Size/Template dropdowns) ... -->
            <div class="form-group" style="margin-bottom:15px;">
                <label>Paper Size</label>
                <select id="gl-paper-size" style="padding:10px; width:100%;">
                     <option value="62mm" selected>62mm Continuous</option>
                     <option value="38mm">38mm Address</option>
                     <option value="54mm">54mm File Folder</option>
                     <option value="102mm">102mm Shipping</option>
                </select>
            </div>

            <div class="form-group">
                <label>
                    Load Template 
                    <button type="button" id="btn-manage-tpl" style="background:none; border:none; color:#2196f3; cursor:pointer; font-weight:bold;">[+]</button>
                </label>
                <select id="gl-template-loader" style="padding:10px; width:100%;">
                    <option value="">-- Default Layout --</option>
                    ${(templates || []).map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
            </div>

            <button id="btn-print-generic" class="pos-btn" style="width:100%; padding:20px; font-size:1.3rem; margin-top:20px; background:#d32f2f; color:white; justify-content:center;">
                🖨️ Print Label
            </button>
        </div>

        <!-- RIGHT: PREVIEW (Same as before) -->
        <div style="width:340px; background:#333; padding:20px; display:flex; flex-direction:column; align-items:center; border-left:1px solid #ddd;">

            <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px; color:white;">
                <label style="cursor:pointer;"><input type="checkbox" id="toggle-generic-edit"> Edit Layout</label>
            </div>

            <div id="generic-toolbar" class="hidden" style="display:flex; gap:5px; margin-bottom:10px; flex-wrap:wrap;">
                <button onclick="window.posAdd('text')" style="font-size:0.8rem;">+Txt</button>
                <button onclick="window.posAdd('barcode')" style="font-size:0.8rem;">+Bar</button>
                <button onclick="window.posAdd('qr')" style="font-size:0.8rem;">+QR</button>
                <button onclick="window.posAdd('image')" style="font-size:0.8rem;">+Img</button> <!-- Added Img -->
                <button onclick="window.posSave()" style="font-size:0.8rem; background:#2196f3; color:white; margin-left:auto;">Save</button>
            </div>

            <div id="generic-preview-box" style="background:white; min-height:200px; width:100%; border-radius:4px;"></div>

            <div id="editor-properties-panel" style="width:100%; background:#f4f4f4; margin-top:15px; padding:10px; border-radius:4px; min-height:80px;">
                <small style="color:#666;">Select element to edit</small>
            </div>
        </div>
    </div>
    `;
}