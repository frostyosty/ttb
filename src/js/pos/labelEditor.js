import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { supabase } from '../db.js';

// State
let currentConfig = [];
let isEditing = false;
let dragItem = null;
let startMouseX, startMouseY, originalItemX, originalItemY; // Better drag tracking

// --- INITIALIZATION ---
export async function initLabelEditor(containerId, inputIds) {
    const container = document.getElementById(containerId);
    
    // Load last template or defaults
    const lastId = localStorage.getItem('tweed_pos_last_template');
    if (lastId) {
        await loadTemplateById(lastId);
    } else {
        // Safe Default
        currentConfig = [
            { id: 1, type: 'title', x: 10, y: 10, fontSize: 16, width: 200 },
            { id: 2, type: 'price', x: 10, y: 40, fontSize: 32, bold: true },
            { id: 3, type: 'barcode', x: 10, y: 90, height: 40, width: 200 },
            { id: 4, type: 'sku', x: 10, y: 140, fontSize: 10 }
        ];
    }

    // Attach Listeners to Form Inputs
    Object.values(inputIds).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', () => refreshPreview(container, inputIds));
    });

    // Window Resize Listener for Zooming
    window.addEventListener('resize', () => applyScale(container));

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

// --- RENDERING & SCALING ---

function refreshPreview(container, inputIds) {
    const data = {
        name: document.getElementById(inputIds.name)?.value || 'Product Name',
        price: document.getElementById(inputIds.price)?.value || '0.00',
        sku: 'PREVIEW-SKU'
    };
    renderLabel(container, currentConfig, data, isEditing);
    applyScale(container);
}

// Calculates CSS Zoom so the 58mm label fits inside the 300px (or smaller) phone screen
function applyScale(container) {
    const parent = container.parentElement;
    if (!parent) return;
    
    // Reset transform to measure naturally
    container.style.transform = 'none';
    
    const parentWidth = parent.clientWidth - 20; // 20px padding
    const labelWidth = 220; // Approx 58mm in pixels
    
    if (parentWidth < labelWidth) {
        const scale = parentWidth / labelWidth;
        container.style.transformOrigin = 'top left';
        container.style.transform = `scale(${scale})`;
        
        // Adjust parent height so things below it don't overlap
        parent.style.height = (300 * scale) + 'px';
    } else {
        container.style.transform = 'none';
        parent.style.height = 'auto'; // Reset
    }
}

// --- DRAWING THE LABEL ---

export async function renderLabel(container, config, data, editMode = false) {
    container.innerHTML = '';
    
    // Simulate 62mm Brother Tape
    Object.assign(container.style, {
        width: '220px', // Approx 58mm print area
        height: '300px', // Fixed canvas height
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden', // Clip content
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        backgroundImage: editMode ? 'linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)' : 'none',
        backgroundSize: '20px 20px'
    });

    for (const item of config) {
        const el = document.createElement('div');
        
        Object.assign(el.style, {
            position: 'absolute',
            left: (item.x || 0) + 'px',
            top: (item.y || 0) + 'px',
            cursor: editMode ? 'grab' : 'default',
            border: editMode ? '1px dashed #2196f3' : 'none',
            padding: '2px',
            whiteSpace: 'nowrap',
            zIndex: 10
        });

        // --- CONTENT TYPES ---
        if (item.type === 'title') {
            el.innerText = (data.name || '').substring(0, 25);
            el.style.fontSize = (item.fontSize || 14) + 'px';
            el.style.fontWeight = item.bold ? 'bold' : 'normal';
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
             el.innerText = item.text || "Text";
             el.style.fontSize = (item.fontSize || 12) + 'px';
        }

        // --- DRAG HANDLERS ---
        if (editMode) {
            // Delete 'X' button
            const del = document.createElement('div');
            del.innerHTML = '×';
            Object.assign(del.style, {
                position: 'absolute', top: '-10px', right: '-10px',
                background: 'red', color: 'white', borderRadius: '50%',
                width: '18px', height: '18px', textAlign: 'center', lineHeight:'18px',
                cursor: 'pointer', fontSize:'14px', zIndex: 20
            });
            del.onclick = (e) => {
                e.stopPropagation();
                currentConfig = currentConfig.filter(c => c.id !== item.id);
                renderLabel(container, currentConfig, data, true);
            };
            el.appendChild(del);

            el.onmousedown = (e) => {
                if(e.target === del) return;
                e.preventDefault(); // Stop text selection
                dragItem = item;
                startMouseX = e.clientX;
                startMouseY = e.clientY;
                originalItemX = item.x || 0;
                originalItemY = item.y || 0;
                el.style.cursor = 'grabbing';
            };
            
            // Touch Support for Mobile
            el.ontouchstart = (e) => {
                if(e.target === del) return;
                dragItem = item;
                startMouseX = e.touches[0].clientX;
                startMouseY = e.touches[0].clientY;
                originalItemX = item.x || 0;
                originalItemY = item.y || 0;
            };
        }

        container.appendChild(el);
    }

    // --- GLOBAL MOUSE MOVE (ON CONTAINER) ---
    if (editMode) {
        const handleMove = (clientX, clientY) => {
            if (!dragItem) return;

            // Calculate Delta (How much did mouse move?)
            const deltaX = clientX - startMouseX;
            const deltaY = clientY - startMouseY;

            // Apply Delta to Original Position
            // (We divide by scale if zoomed, but let's keep it simple first)
            let newX = originalItemX + deltaX;
            let newY = originalItemY + deltaY;

            // Snap to Grid (10px)
            newX = Math.round(newX / 10) * 10;
            newY = Math.round(newY / 10) * 10;

            // Update Config
            const configItem = currentConfig.find(c => c.id === dragItem.id);
            if (configItem) {
                configItem.x = newX;
                configItem.y = newY;
                renderLabel(container, currentConfig, data, true);
            }
        };

        container.onmousemove = (e) => handleMove(e.clientX, e.clientY);
        container.ontouchmove = (e) => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); };
        
        const stopDrag = () => { dragItem = null; };
        container.onmouseup = stopDrag;
        container.onmouseleave = stopDrag;
        container.ontouchend = stopDrag;
    }
}

// ... (Rest of Template saving/loading logic remains same) ...
function addItemToConfig(type, container, inputIds) {
    const id = Date.now();
    currentConfig.push({ id, type, x: 20, y: 20, fontSize: 16 });
    refreshPreview(container, inputIds);
}

async function saveTemplateToDB(name) {
    const { data, error } = await supabase.from('tweed_trading_label_templates').insert({ name, config: currentConfig }).select().single();
    if(!error && data) {
        localStorage.setItem('tweed_pos_last_template', data.id);
        return data;
    }
}

async function loadTemplateById(id) {
    const { data } = await supabase.from('tweed_trading_label_templates').select('*').eq('id', id).single();
    if(data) {
        currentConfig = data.config;
        localStorage.setItem('tweed_pos_last_template', id);
    }
}

export async function printCurrentLabel(data) {
    const win = window.open('', '', 'width=400,height=600');
    win.document.write('<html><head><style>@page { size: 62mm auto; margin: 0; } body { margin: 0; }</style></head><body><div id="print-area"></div></body></html>');
    const container = win.document.getElementById('print-area');
    // Render without edit mode
    await renderLabel(container, currentConfig, data, false);
    setTimeout(() => { win.print(); setTimeout(() => win.close(), 1000); }, 500);
}