export function renderAddItemForm(categories, templates) {
    return `
    <div class="split-view" style="display:flex; height:100%; overflow:hidden;">
        
        <!-- LEFT: FORM -->
        <div style="flex:1; padding:15px; overflow-y:auto; background:#fff;">
            <h2 style="margin-top:0; font-size:1.2rem; color:#333;">📦 Add Inventory</h2>
            
            <form id="add-product-form" class="product-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="p-name" placeholder="Item Name" required>
                </div>

                <div style="display:flex; gap:10px;">
                    <div class="form-group" style="flex:1;">
                        <label>Category</label>
                        <select id="p-cat">
                            <option value="">-- Unlinked --</option>
                            ${(categories || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="width:100px;">
                        <label>Price</label>
                        <input type="number" id="p-price" step="0.01" required>
                    </div>
                </div>

                 <div style="display:flex; gap:10px;">
                    <div class="form-group" style="flex:1;">
                        <label>Stock</label>
                        <input type="number" id="p-stock" value="1">
                    </div>
                    <div class="form-group" style="flex:1;">
                         <label>Load Template</label>
                         <select id="p-template-loader">
                             <option value="">-- Load Saved --</option>
                             ${(templates || []).map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                         </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Photo</label>
                    <input type="file" id="p-image" accept="image/*" capture="environment">
                </div>

                <button type="submit" class="submit-btn" style="width:100%; padding:12px; font-size:1rem; margin-top:10px; background:#2e7d32; color:white; border:none; border-radius:4px;">
                    💾 Save & Print
                </button>
            </form>
        </div>

        <!-- RIGHT: PREVIEW & EDITOR -->
        <div class="preview-panel" style="width:340px; background:#e0e0e0; padding:15px; border-left:1px solid #ccc; display:flex; flex-direction:column;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; font-size:1rem;">Label Designer</h3>
                <label style="font-size:0.8rem; display:flex; align-items:center; gap:5px; cursor:pointer;">
                    <input type="checkbox" id="toggle-edit-mode"> Edit Layout
                </label>
            </div>

            <!-- TOOLBAR (Hidden unless editing) -->
            <div id="editor-toolbar" class="hidden" style="margin-bottom:10px; display:flex; gap:5px; flex-wrap:wrap;">
                <button class="pos-btn" onclick="window.posAdd('static_text')">+Text</button>
                <button class="pos-btn" onclick="window.posAdd('qr')">+QR</button>
                <button class="pos-btn" onclick="window.posAdd('barcode')">+Bar</button>
                <button class="pos-btn" style="margin-left:auto; background:#2196f3; color:white;" onclick="window.posSave()">Save As...</button>
            </div>

            <!-- PREVIEW CONTAINER -->
            <div style="flex:1; display:flex; justify-content:center; overflow:hidden;">
                <div id="preview-box" style="box-shadow:0 2px 10px rgba(0,0,0,0.1);"></div>
            </div>
            
            <p style="text-align:center; font-size:0.75rem; color:#666; margin-top:5px;">
                Width: 62mm | Height: Auto
            </p>
        </div>
    </div>
    `;
}