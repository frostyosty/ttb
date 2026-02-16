import { EditorState } from './state.js';
import { renderLabel } from './renderer.js';
import { initInteractions } from './interactions.js';
import { setPropertyRefresh, renderPropertiesPanel } from './propertiesPanel.js';
import { supabase } from '../../db.js';

let activeContainer = null;
let activeData = {};

export async function initLabelEditor(containerId, inputIds) {
    activeContainer = document.getElementById(containerId);
    
    // Init Components
    const refresh = () => renderLabel(activeContainer, EditorState.get(), activeData, true);
    
    initInteractions(activeContainer, refresh);
    setPropertyRefresh(refresh); // Let properties panel trigger re-renders

    // Setup Form Listeners (Live Preview)
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

let currentSize = '62mm';

    return {
        // CRUD
        addItem: (type) => {
            EditorState.addElement(type);
            refresh();
        },
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

setPaperSize: (sz) => { currentSize = sz; },
    refresh: () => {
        // Update to pass currentSize
        renderLabel(activeContainer, EditorState.get(), activeData, true, currentSize);
    },
        // Utils
        refresh: updateData,
        print: async (realData) => {
            const win = window.open('', '', 'width=400,height=600');
            win.document.write('<html><head><style>@page { size: 62mm auto; margin: 0; } body { margin: 0; }</style></head><body><div id="print-area"></div></body></html>');
            const container = win.document.getElementById('print-area');
        await renderLabel(container, EditorState.get(), realData, false, currentSize);
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