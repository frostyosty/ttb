/// public/js/db.js
import { createClient } from '@supabase/supabase-js'; // <--- NEW IMPORT
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Use createClient instead of window.supabase.createClient
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLE_CONTENT = 'tweed_trading_content';
const TABLE_HISTORY = 'tweed_trading_history';

export async function fetchContent() {
    console.log('Fetching content from Supabase...');
    
    const { data, error } = await supabase
        .from(TABLE_CONTENT)
        .select('*')
        .order('position', { ascending: true });

    if (error) {
        console.error('SUPABASE ERROR:', error.message);
        // Fallback if DB is empty or fails
        return [];
    }
    return data;
}

export async function saveContent(items) {
    console.log('Attempting to save...');

    // 1. Create a snapshot in history
    const { error: histError } = await supabase.from(TABLE_HISTORY).insert({
        snapshot: items
    });
    
    if (histError) console.warn('History save failed:', histError.message);

    // 2. Upsert (Update/Insert) current items
    const { error } = await supabase
        .from(TABLE_CONTENT)
        .upsert(items);

    if (error) {
        alert('SAVE FAILED: ' + error.message);
        console.error(error);
    } else {
        alert('Saved successfully to Live DB!');
    }
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