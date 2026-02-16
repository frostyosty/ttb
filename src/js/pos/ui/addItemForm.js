// src/js/pos/ui/addItemForm.js

export function renderAddItemForm(categories, templates) {
    return `
    <div class="pos-mobile-stack" style="display:flex; height:100%; overflow:hidden;">
        
        <!-- LEFT: INPUT FORM -->
        <div style="flex:1; padding:20px; overflow-y:auto; background:#f9f9f9;">
            <h2 style="margin-top:0; color:#2e7d32;">📦 Add Inventory</h2>
            
            <form id="add-product-form" class="product-form">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="p-name" placeholder="e.g. 1920s Rimu Door" required autofocus>
                </div>

                <div style="display:flex; gap:10px;">
                    <div class="form-group" style="flex:1;">
                        <label>Category <button type="button" id="btn-manage-cats" style="background:none; border:none; color:#2196f3; cursor:pointer; font-weight:bold;" title="Add/Edit Categories">[+]</button></label>
                        <select id="p-cat">
                            <option value="">-- Unlinked --</option>
                            ${(categories || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="width:120px;">
                        <label>Price ($)</label>
                        <input type="number" id="p-price" step="0.01" placeholder="0.00" required>
                    </div>
                </div>

                <div style="display:flex; gap:10px;">
                    <div class="form-group" style="flex:1;">
                        <label>Stock Qty</label>
                        <input type="number" id="p-stock" value="1">
                    </div>
                    <div class="form-group" style="flex:1;">
                         <label>Paper Size</label>
                         <select id="p-paper-size">
                             <option value="62mm" selected>62mm Continuous</option>
                             <option value="38mm">38mm Address</option>
                             <option value="54mm">54mm File Folder</option>
                             <option value="102mm">102mm Shipping</option>
                         </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Load Template</label>
                    <select id="p-template-loader">
                        <option value="">-- Default Layout --</option>
                        ${(templates || []).map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Photo (Optional)</label>
                    <input type="file" id="p-image" accept="image/*" capture="environment">
                </div>

                <!-- Action buttons will be injected here -->
                <button type="submit" class="submit-btn hidden">Save</button>
            </form>
        </div>

        <!-- RIGHT: PREVIEW -->
        <div class="preview-panel" style="width:340px; background:#333; padding:20px; display:flex; flex-direction:column; align-items:center; border-left:1px solid #ddd;">
            <!-- ... (Keep your existing preview toolbar HTML) ... -->
             <div style="display:flex; gap:10px; margin-bottom:10px; color:white; align-items:center;">
                <label style="cursor:pointer;"><input type="checkbox" id="toggle-edit-mode"> Edit Layout</label>
            </div>
            
            <div id="editor-toolbar" class="hidden" style="display:flex; gap:5px; margin-bottom:10px; flex-wrap:wrap;">
                 <button class="pos-btn" onclick="window.posAdd('text')">+Txt</button>
                 <button class="pos-btn" onclick="window.posAdd('barcode')">+Bar</button>
                 <button class="pos-btn" onclick="window.posAdd('qr')">+QR</button>
                 <button class="pos-btn" onclick="window.posSave()" style="background:#2196f3; color:white;">Save</button>
            </div>

            <div id="preview-box" style="background:white; min-height:200px; width:100%; border-radius:4px; box-shadow:0 0 15px rgba(0,0,0,0.5);"></div>
            
            <!-- PROPERTIES PANEL -->
            <div id="editor-properties-panel" style="width:100%; background:#f4f4f4; margin-top:15px; padding:10px; border-radius:4px; min-height:80px;">
                <small style="color:#666;">Select an element to edit</small>
            </div>
        </div>
    </div>
    `;
}