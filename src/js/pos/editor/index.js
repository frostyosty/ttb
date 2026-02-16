import { EditorState } from './state.js';
import { renderLabel } from './renderer.js';
import { initInteractions } from './interactions.js';
import { setPropertyRefresh } from './propertiesPanel.js';
import { supabase } from '../../db.js';

let activeContainer = null;
let activeData = {};
let isEditing = false; // 👈 Track state locally
let currentPaperSize = '62mm'; // 👈 Track size locally

export async function initLabelEditor(containerId, inputIds) {
    activeContainer = document.getElementById(containerId);
    
    // Helper to redraw
    const refresh = () => {
        // Pass isEditing and currentPaperSize to the renderer
        renderLabel(activeContainer, EditorState.get(), activeData, isEditing, currentPaperSize);
    };
    
    // Init Interactions
    initInteractions(activeContainer, refresh);
    setPropertyRefresh(refresh);

    // Live Data binding
    const updateData = () => {
        activeData = {
            name: document.getElementById(inputIds.name)?.value || 'Product Name',
            price: document.getElementById(inputIds.price)?.value || '0.00',
            sku: 'PREVIEW'
        };
        refresh();
    };

    Object.values(inputIds).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', updateData);
    });

    // Initial Load
    EditorState.reset();
    updateData();

    // 👇 RETURN THE PUBLIC API 👇
    return {
        // 1. Toggle Edit Mode (Fixes your error)
        toggleEdit: (enabled) => {
            isEditing = enabled;
            refresh();
        },
        // 2. Set Paper Size
        setPaperSize: (size) => {
            currentPaperSize = size;
            refresh();
        },
        // 3. Add Item
        addItem: (type) => {
            EditorState.addElement(type);
            refresh();
        },
        // 4. Load/Save Templates
        loadTemplate: async (id) => {
            const { data } = await supabase.from('tweed_trading_label_templates').select('*').eq('id', id).single();
            if(data) {
                EditorState.set(data.config);
                refresh();
            }
        },
        saveTemplate: async (name) => {
            const { data, error } = await supabase.from('tweed_trading_label_templates')
                .insert({ name, config: EditorState.get() }).select().single();
            return error ? null : data;
        },
        // 5. Utils
        refresh: updateData,
        print: async (realData) => {
            const win = window.open('', '', 'width=400,height=600');
            win.document.write('<html><head><style>@page { size: 62mm auto; margin: 0; } body { margin: 0; }</style></head><body><div id="print-area"></div></body></html>');
            const container = win.document.getElementById('print-area');
            await renderLabel(container, EditorState.get(), realData, false, currentPaperSize);
            setTimeout(() => { win.print(); setTimeout(() => win.close(), 1000); }, 500);
        }
    };
}


/**
 * STANDALONE PRINTER
 * Use this when you just want to print data (e.g. from Inventory list)
 * without loading the full Editor UI.
 */

export async function printLabelData(data, config = null) {
    // 1. Use provided config, or fallback to whatever is currently in State/Default
    const layout = config || EditorState.get(); // You might want to load a specific default here in future

    // 2. Open Print Window
    const win = window.open('', '', 'width=400,height=600');
    win.document.write('<html><head><style>@page { size: 62mm auto; margin: 0; } body { margin: 0; }</style></head><body><div id="print-area"></div></body></html>');
    
    const container = win.document.getElementById('print-area');
    
    // 3. Render (isEditing = false)
    await renderLabel(container, layout, data, false);
    
    // 4. Print
    setTimeout(() => { 
        win.print(); 
        setTimeout(() => win.close(), 1000); 
    }, 500);
}