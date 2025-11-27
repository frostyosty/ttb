/// src/js/db.js
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE_CONTENT = 'tweed_trading_content';
const TABLE_HISTORY = 'tweed_trading_history';

export async function fetchContent() {
    const { data, error } = await supabase
        .from(TABLE_CONTENT)
        .select('*')
        .order('position', { ascending: true });

    if (error) {
        console.error('SUPABASE ERROR:', error.message);
        return [];
    }
    return data;
}

export async function saveContent(items) {
    // 1. SANITIZE PAYLOAD (Fixes the "Null ID" crash)
    const payload = items.map(item => {
        // Create a copy so we don't mess up the local state
        const cleanItem = { ...item };
        
        // If ID is missing, null, or 0, delete the key entirely.
        // This tells Supabase: "This is a new row, please generate an ID."
        if (!cleanItem.id) {
            delete cleanItem.id;
        }
        return cleanItem;
    });

    // 2. Create History (Background)
    supabase.from(TABLE_HISTORY).insert({ snapshot: payload }).then(({ error }) => {
        if (error) console.warn('History save warning:', error.message);
    });

    // 3. Upsert Items
    const { data, error } = await supabase
        .from(TABLE_CONTENT)
        .upsert(payload)
        .select(); // We ask Supabase to return the new data (with IDs)

    if (error) {
        showErrorToast('Save Failed: ' + error.message);
        throw error;
    }
    
    // Optional: Return the data so we can update local state with real IDs
    return data;
}

export async function fetchHistory() {
    const { data, error } = await supabase
        .from(TABLE_HISTORY)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (error) console.error(error);
    return data || [];
}

export async function restoreSnapshot(snapshotItems) {
    await supabase.from(TABLE_CONTENT).delete().neq('id', 0); 
    const { error } = await supabase.from(TABLE_CONTENT).insert(snapshotItems);
    if (error) console.error(error);
    return !error;
}

function showErrorToast(msg) {
    const toast = document.getElementById('toast');
    if(toast) {
        toast.innerText = msg;
        toast.style.background = '#d32f2f'; // Red
        toast.style.border = '2px solid white';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
    }
}