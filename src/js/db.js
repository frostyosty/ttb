/// src/js/db.js
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLE_CONTENT = 'tweed_trading_content';
const TABLE_HISTORY = 'tweed_trading_history';

export async function fetchContent() {
    // ... (Keep existing fetchContent logic same) ...
    const { data, error } = await supabase
        .from(TABLE_CONTENT).select('*').order('position', { ascending: true });
    if (error) { console.error(SUPABASE_ERROR, error); return []; }
    return data;
}

export async function saveContent(items) {
    // 1. Create History (Background)
    supabase.from(TABLE_HISTORY).insert({ snapshot: items }).then(({ error }) => {
        if (error) console.warn('History save warning:', error.message);
    });

    // 2. Upsert Items
    const { error } = await supabase.from(TABLE_CONTENT).upsert(items);

    if (error) {
        // ONLY show alert if it fails
        showErrorToast('Save Failed: ' + error.message);
        throw error;
    }
    // Success is now SILENT (Optimistic)
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
    // Delete all current content (Clean slate)
    await supabase.from(TABLE_CONTENT).delete().neq('id', 0); 
    
    // Insert old snapshot
    const { error } = await supabase.from(TABLE_CONTENT).insert(snapshotItems);
    
    if (error) console.error(error);
    return !error;
}

// Helper for error toast
function showErrorToast(msg) {
    const toast = document.getElementById('toast');
    if(toast) {
        toast.innerText = msg;
        toast.style.background = 'red';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
    }
}