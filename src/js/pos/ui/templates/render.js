export function renderTemplateModal() {
    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)', zIndex: 10005, display: 'flex', justifyContent: 'center', alignItems: 'center'
    });

    modal.innerHTML = `
        <div style="background:white; width:90%; max-width:650px; border-radius:8px; padding:20px; max-height:80vh; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0;">📂 Manage Templates</h3>
                <button id="btn-close-tpl" class="pos-btn" style="padding:5px 15px;">Done</button>
            </div>

            <div style="margin-bottom:10px; font-size:0.85rem; color:#666;">
                Use <strong>✢</strong> to drag (Desktop) or <strong>⬆ ⬇</strong> to reorder (Mobile).
            </div>

            <!-- LIST CONTAINER -->
            <div id="tpl-list" style="flex:1; overflow-y:auto; border:1px solid #eee; border-radius:4px; margin-bottom:15px; background:#fafafa;">
                Loading...
            </div>
        </div>
    `;
    return modal;
}

export function renderTemplateList(items) {
    if(!items || items.length === 0) return '<div style="padding:20px; text-align:center; color:#999;">No saved templates.</div>';
    
    return items.map((t, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return `
        <div class="tpl-row" draggable="true" data-id="${t.id}" data-index="${index}" style="display:flex; align-items:center; gap:8px; padding:8px; border-bottom:1px solid #eee; background:white;">
            
            <!-- DRAG HANDLE (Desktop) -->
            <div class="drag-handle" style="cursor:grab; color:#ccc; padding:0 5px; font-size:1.2rem; user-select:none;" title="Drag to reorder">
                ✢
            </div>

            <!-- MOBILE SORT BUTTONS -->
            <div style="display:flex; flex-direction:column; gap:2px;">
                <button class="tpl-up-btn" style="border:1px solid #eee; background:white; font-size:10px; padding:2px 5px; cursor:pointer; visibility:${isFirst ? 'hidden' : 'visible'}">▲</button>
                <button class="tpl-down-btn" style="border:1px solid #eee; background:white; font-size:10px; padding:2px 5px; cursor:pointer; visibility:${isLast ? 'hidden' : 'visible'}">▼</button>
            </div>

            <!-- NAME -->
            <span style="flex:1; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding-left:5px;">
                ${t.name}
            </span>
            
            <!-- ACTIONS -->
            <button class="tpl-copy-btn pos-btn" data-id="${t.id}" title="Duplicate" style="font-size:0.8rem; background:#f0f0f0; border:1px solid #ccc; padding:5px 8px;">
                📄
            </button>

            <button class="tpl-rename-btn pos-btn" data-id="${t.id}" data-name="${t.name}" style="font-size:0.8rem; background:#f0f0f0; border:1px solid #ccc; padding:5px 8px;">
                ✏️
            </button>

            <button class="tpl-del-btn pos-btn" data-id="${t.id}" style="color:white; background:#d32f2f; font-size:0.8rem; border:none; padding:5px 8px;">
                🗑️
            </button>
        </div>
    `}).join('');
}