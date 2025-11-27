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
    // 1. SANITIZE PAYLOAD
    // We create a clean array to send to Supabase
    const payload = items.map(item => {
        // Deep clone to ensure we don't mutate local state unexpectedly
        const clean = JSON.parse(JSON.stringify(item));
        
        // CRITICAL FIX: Explicitly remove ID if it is null, undefined, 0, or "null"
        if (!clean.id || clean.id === 'null') {
            delete clean.id; // Let Supabase generate the ID
        }
        return clean;
    });

    // 2. CREATE HISTORY (Background)
    supabase.from(TABLE_HISTORY).insert({ snapshot: payload }).then(({ error }) => {
        if (error) console.warn('History save warning:', error.message);
    });

    // 3. UPSERT & RETURN DATA
    const { data, error } = await supabase
        .from(TABLE_CONTENT)
        .upsert(payload, { onConflict: 'id' }) 
        .select(); // <--- IMPORTANT: Get the data back (including new IDs)

    if (error) {
        showErrorToast('Save Failed: ' + error.message);
        throw error;
    }
    
    // 4. RETURN FRESH DATA
    // We return the data so the app can update local state with the new IDs
    return data;
}

export async function fetchHistory() {
    const { data, error } = await supabase
        .from(TABLE_HISTORY)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    return data || [];
}

export async function restoreSnapshot(snapshotItems) {
    await supabase.from(TABLE_CONTENT).delete().neq('id', 0); 
    const { error } = await supabase.from(TABLE_CONTENT).insert(snapshotItems);
    return !error;
}

function showErrorToast(msg) {
    const toast = document.getElementById('toast');
    if(toast) {
        toast.innerText = msg;
        toast.style.background = '#d32f2f';
        toast.style.border = '2px solid white';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
    } else {
        console.error(msg);
    }
}