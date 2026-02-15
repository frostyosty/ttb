import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { supabase } from '../db.js';

// State
let currentConfig = [];
let currentTemplateId = null;
let isEditing = false;
let dragItem = null;
let previewData = {}; // Stores current Name/Price for live update

// --- 1. INITIALIZATION & LOADING ---

export async function initLabelEditor(containerId, inputIds) {
    const container = document.getElementById(containerId);
    
    // Load last used template ID from local storage
    const lastId = localStorage.getItem('tweed_pos_last_template');
    if (lastId) {
        await loadTemplateById(lastId);
    } else {
        // Default Start: Standard Barcode
        currentConfig = [
            { id: 1, type: 'title', x: 5, y: 5, fontSize: 16, width: 200 },
            { id: 2, type: 'price', x: 5, y: 30, fontSize: 32, bold: true },
            { id: 3, type: 'barcode', x: 5, y: 70, height: 40, width: 200 },
            { id: 4, type: 'sku', x: 5, y: 115, fontSize: 10 }
        ];
    }

    // Setup Inputs Listener
    Object.values(inputIds).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => refreshPreview(container, inputIds));
    });

    // Initial Draw
    refreshPreview(container, inputIds);

    return {
        getConfig: () => currentConfig,
        toggleEdit: (enabled) => { 
            isEditing = enabled; 
            refreshPreview(container, inputIds); 
        },
        saveTemplate: (name) => saveTemplateToDB(name),
        loadTemplate: (id) => loadTemplateById(id),
        addItem: (type) => addItemToConfig(type, container, inputIds),
        refresh: () => refreshPreview(container, inputIds)
    };
}

// --- 2. RENDERING ENGINE (The Core) ---

function refreshPreview(container, inputIds) {
    // 1. Gather Data
    previewData = {
        name: document.getElementById(inputIds.name)?.value || 'Product Name',
        price: document.getElementById(inputIds.price)?.value || '0.00',
        sku: 'PREVIEW-SKU'
    };

    renderLabel(container, currentConfig, previewData, isEditing);
}

export async function renderLabel(container, config, data, editMode = false) {
    container.innerHTML = '';
    
    // CSS Layout for 62mm Tape
    Object.assign(container.style, {
        width: '58mm', // 4mm safety margin
        height: '300px', // Canvas area
        backgroundColor: 'white',
        position: 'relative', // Vital for absolute children
        overflow: 'hidden',
        border: editMode ? '1px solid #ccc' : 'none',
        backgroundImage: editMode ? 
            'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)' : 'none',
        backgroundSize: '10px 10px' // The Grid
    });

    for (const item of config) {
        const el = document.createElement('div');
        
        // Base Styles
        Object.assign(el.style, {
            position: 'absolute',
            left: (item.x || 0) + 'px',
            top: (item.y || 0) + 'px',
            cursor: editMode ? 'move' : 'default',
            border: editMode ? '1px dashed #2196f3' : 'none',
            padding: '2px',
            userSelect: 'none'
        });

        // Content Logic
        if (item.type === 'title') {
            el.innerText = (data.name || '').substring(0, 30);
            el.style.fontSize = (item.fontSize || 14) + 'px';
            el.style.fontWeight = item.bold ? 'bold' : 'normal';
            el.style.width = (item.width || 200) + 'px';
            el.style.whiteSpace = 'nowrap';
            el.style.overflow = 'hidden';
        }
        else if (item.type === 'price') {
            el.innerText = `$${data.price}`;
            el.style.fontSize = (item.fontSize || 24) + 'px';
            el.style.fontWeight = 'bold';
        }
        else if (item.type === 'sku') {
            el.innerText = data.sku;
            el.style.fontSize = '10px';
        }
        else if (item.type === 'barcode') {
            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, data.sku, {
                    format: "CODE128", displayValue: false, margin:0,
                    height: item.height || 40, width: 2
                });
                el.appendChild(canvas);
            } catch(e) {}
        }
        else if (item.type === 'qr') {
            const img = document.createElement('img');
            const url = `https://www.tweedtrading.co.nz/?s=${data.sku}`;
            img.src = await QRCode.toDataURL(url, { margin: 0 });
            img.style.width = (item.size || 80) + 'px';
            el.appendChild(img);
        }
        else if (item.type === 'static_text') {
             el.innerText = item.text || "Custom Text";
             el.style.fontSize = (item.fontSize || 12) + 'px';
        }

        // --- DRAG LOGIC ---
        if (editMode) {
            // Delete Button (Small X)
            const delBtn = document.createElement('div');
            delBtn.innerHTML = '×';
            Object.assign(delBtn.style, {
                position: 'absolute', top: '-8px', right: '-8px',
                background: 'red', color: 'white', borderRadius: '50%',
                width: '16px', height: '16px', fontSize: '12px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                cursor: 'pointer'
            });
            delBtn.onclick = (e) => {
                e.stopPropagation();
                currentConfig = currentConfig.filter(c => c.id !== item.id);
                renderLabel(container, currentConfig, data, true);
            };
            el.appendChild(delBtn);

            // Mouse Down -> Start Drag
            el.onmousedown = (e) => {
                if(e.target === delBtn) return;
                dragItem = { 
                    id: item.id, 
                    offsetX: e.clientX - el.offsetLeft, 
                    offsetY: e.clientY - el.offsetTop 
                };
            };
        }

        container.appendChild(el);
    }

    // --- GLOBAL DRAG HANDLER ---
    if (editMode) {
        container.onmousemove = (e) => {
            if (!dragItem) return;
            const item = currentConfig.find(c => c.id === dragItem.id);
            if (item) {
                // Snap to Grid (10px)
                let rawX = e.clientX - dragItem.offsetX - container.getBoundingClientRect().left;
                let rawY = e.clientY - dragItem.offsetY - container.getBoundingClientRect().top;
                
                item.x = Math.round(rawX / 10) * 10;
                item.y = Math.round(rawY / 10) * 10;
                
                renderLabel(container, currentConfig, data, true);
            }
        };
        
        container.onmouseup = () => { dragItem = null; };
        container.onmouseleave = () => { dragItem = null; };
    }
}

// --- 3. TEMPLATE MANAGEMENT ---

function addItemToConfig(type, container, inputIds) {
    const id = Date.now();
    const defaults = { id, type, x: 10, y: 10 };
    
    if(type === 'title') Object.assign(defaults, { fontSize: 16, width: 200 });
    if(type === 'price') Object.assign(defaults, { fontSize: 24, bold: true });
    if(type === 'barcode') Object.assign(defaults, { height: 40 });
    if(type === 'qr') Object.assign(defaults, { size: 80 });
    if(type === 'static_text') Object.assign(defaults, { text: 'New Text', fontSize: 12 });

    currentConfig.push(defaults);
    refreshPreview(container, inputIds);
}

async function saveTemplateToDB(name) {
    const { data, error } = await supabase
        .from('tweed_trading_label_templates')
        .insert({ name, config: currentConfig })
        .select()
        .single();
        
    if(error) {
        alert("Error saving: " + error.message);
    } else {
        alert("Template Saved!");
        currentTemplateId = data.id;
        localStorage.setItem('tweed_pos_last_template', data.id);
        return data;
    }
}

async function loadTemplateById(id) {
    const { data } = await supabase
        .from('tweed_trading_label_templates')
        .select('*')
        .eq('id', id)
        .single();
        
    if (data) {
        currentConfig = data.config;
        currentTemplateId = data.id;
        localStorage.setItem('tweed_pos_last_template', data.id);
    }
}

// --- 4. PRINTING ---
export async function printCurrentLabel(data) {
    const win = window.open('', '', 'width=400,height=600');
    win.document.write('<html><head><style>@page { size: 62mm auto; margin: 0; } body { margin: 0; }</style></head><body><div id="print-area"></div></body></html>');
    const container = win.document.getElementById('print-area');
    await renderLabel(container, currentConfig, data, false);
    setTimeout(() => { win.print(); setTimeout(() => win.close(), 1000); }, 500);
}