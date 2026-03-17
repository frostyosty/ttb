// src/js/pos/lib/offlineQueue.js

const DB_NAME = 'TweedOfflineDB';
const STORE_NAME = 'offline_products';

// 1. Initialize the Local Database
function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 2. Save Item to Queue
export async function saveToOfflineQueue(productData, imageFile) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        const payload = {
            ...productData,
            imageFile: imageFile, // IndexedDB can store actual File/Blob objects natively!
            timestamp: Date.now()
        };

        store.add(payload);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// 3. Get all pending items
export async function getOfflineQueue() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 4. Delete item after successful sync
export async function deleteFromOfflineQueue(id) {
    const db = await getDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
    });
}