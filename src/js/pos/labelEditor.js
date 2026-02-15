import { supabase } from '../db.js';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

// Default Layout
let currentConfig = [
    { type: 'title', fontSize: '18px', bold: true },
    { type: 'price', fontSize: '32px', bold: true },
    { type: 'barcode', height: 50 },
    { type: 'sku', fontSize: '12px' }
];

// Reusable Render Function (Used by Preview AND Printer)
// This ensures "What You See" is exactly "What You Print"
export async function renderLabelToContainer(container, config, data) {
    container.innerHTML = '';
    container.style.width = '58mm'; // 62mm tape with margin
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.textAlign = 'center';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '5px';
    container.style.padding = '2mm';

    for (const item of config) {
        const div = document.createElement('div');
        
        if (item.type === 'title') {
            div.innerText = data.name || 'Product Name';
            div.style.fontSize = item.fontSize;
            div.style.fontWeight = item.bold ? 'bold' : 'normal';
            div.style.lineHeight = '1.2';
            div.style.overflow = 'hidden';
            div.style.maxHeight = '2.4em'; // Limit to 2 lines
        } 
        
        else if (item.type === 'price') {
            div.innerText = `$${data.price || '0.00'}`;
            div.style.fontSize = item.fontSize;
            div.style.fontWeight = item.bold ? 'bold' : 'normal';
        } 
        
        else if (item.type === 'sku') {
            div.innerText = data.sku || 'SKU-1234';
            div.style.fontSize = item.fontSize;
            div.style.color = '#555';
        }

        else if (item.type === 'barcode') {
            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, data.sku || '123456', {
                    format: "CODE128",
                    displayValue: false,
                    margin: 0,
                    height: item.height || 40,
                    width: 2
                });
                div.appendChild(canvas);
            } catch(e) { console.warn("Barcode error", e); }
        }

        else if (item.type === 'qr') {
            const img = document.createElement('img');
            const url = `https://www.tweedtrading.co.nz/?sku=${data.sku}`;
            img.src = await QRCode.toDataURL(url, { margin: 0 });
            img.style.width = item.size || '30mm';
            img.style.height = item.size || '30mm';
            img.style.margin = '0 auto';
            div.appendChild(img);
        }

        else if (item.type === 'image' && data.image_url) {
            const img = document.createElement('img');
            img.src = data.image_url;
            img.style.maxHeight = item.height || '30mm';
            img.style.objectFit = 'contain';
            div.appendChild(img);
        }

        container.appendChild(div);
    }
}

// THE EDITOR UI (Drag and Drop / Settings)
export function initLabelEditor(previewContainerId, dataInputIds) {
    const previewEl = document.getElementById(previewContainerId);
    
    // Live Update Listener
    const updatePreview = async () => {
        const data = {
            name: document.getElementById(dataInputIds.name).value,
            price: document.getElementById(dataInputIds.price).value,
            sku: 'PREVIEW-SKU',
            image_url: null // TODO: handling local file preview is tricky, skipping for now
        };
        await renderLabelToContainer(previewEl, currentConfig, data);
    };

    // Listen to form changes to update preview
    Object.values(dataInputIds).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', updatePreview);
    });

    // Initial Render
    updatePreview();

    return {
        getConfig: () => currentConfig,
        setConfig: (newConfig) => { currentConfig = newConfig; updatePreview(); },
        refresh: updatePreview
    };
}

export async function printCurrentLabel(data) {
    // Open Print Window
    const win = window.open('', '', 'width=400,height=600');
    win.document.write('<html><head><style>@page { size: 62mm auto; margin: 0; } body { margin: 0; }</style></head><body><div id="print-area"></div></body></html>');
    
    const container = win.document.getElementById('print-area');
    await renderLabelToContainer(container, currentConfig, data);
    
    // Wait for images/canvases to render
    setTimeout(() => {
        win.print();
        setTimeout(() => win.close(), 500);
    }, 500);
}