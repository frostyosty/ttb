// Default Label Config
let currentConfig = [];
let selectedId = null;

// Default Template
const DEFAULT_CONFIG = [
    { id: 'title', type: 'text', html: '<b>Product Name</b>', x: 10, y: 10, width: 200, fontSize: 16, fontFamily: 'Arial' },
    { id: 'price', type: 'text', html: '<b>$0.00</b>', x: 10, y: 40, width: 100, fontSize: 32, fontFamily: 'Arial' },
    { id: 'barcode', type: 'barcode', x: 10, y: 90, width: 200, height: 40 },
    { id: 'sku', type: 'text', html: 'SKU-0000', x: 10, y: 140, width: 150, fontSize: 10, fontFamily: 'Monospace' }
];

export const EditorState = {
    get: () => currentConfig,
    set: (cfg) => { currentConfig = cfg; },
    reset: () => { currentConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); },
    
    // Selection
    getSelectedId: () => selectedId,
    select: (id) => { selectedId = id; },
    getSelectedElement: () => currentConfig.find(el => el.id === selectedId),
    
    // CRUD
    updateElement: (id, updates) => {
        const idx = currentConfig.findIndex(el => el.id === id);
        if (idx > -1) {
            currentConfig[idx] = { ...currentConfig[idx], ...updates };
        }
    },
    addElement: (type) => {
        const id = Date.now().toString();
        const newEl = { id, type, x: 20, y: 20, width: 100, height: 100 }; // Default 100x100
        

        
        
        if (type === 'text') {
            newEl.html = 'New Text';
            newEl.fontSize = 14;
            newEl.fontFamily = 'Arial';
} else if (type === 'qr') {
            newEl.width = 80; newEl.height = 80;
        } else if (type === 'image') {
            newEl.width = 100; newEl.height = 100;
        }
        
        currentConfig.push(newEl);
        return id; // Return ID so we can select it if we want
    },
    removeElement: (id) => {
        currentConfig = currentConfig.filter(el => el.id !== id);
        if (selectedId === id) selectedId = null;
    }
};