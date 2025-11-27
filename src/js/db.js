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
        console.error('SUPABASE FETCH ERROR:', error.message);
        return [];
    }
    return data;
}

export async function saveContent(items) {
    // 1. SANITIZE PAYLOAD
    // We strictly reconstruct the object to ensure no hidden 'null' IDs slip through
    const payload = items.map(item => {
        const cleanItem = {
            type: item.type,
            content: item.content,
            styles: item.styles || {},
            position: item.position || 0,
            page: item.page || 'home'
        };

        // ONLY add ID if it is a valid number. 
        // If it is null, undefined, or string "null", we LEAVE IT OUT entirely.
        if (item.id && typeof item.id === 'number') {
            cleanItem.id = item.id;
        }

        return cleanItem;
    });

    // --- DEBUG LOG: LOOK HERE IN CONSOLE ---
    console.log("Saving Payload to DB:", payload); 

    // 2. CREATE HISTORY
    supabase.from(TABLE_HISTORY).insert({ snapshot: payload }).then(({ error }) => {
        if (error) console.warn('History save warning:', error.message);
    });

    // 3. UPSERT
    const { data, error } = await supabase
        .from(TABLE_CONTENT)
        .upsert(payload, { onConflict: 'id' }) 
        .select();

    if (error) {
        showErrorToast('Save Failed: ' + error.message);
        console.error("FULL DB ERROR:", error);
        throw error;
    }
    
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
    }
}