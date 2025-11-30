/// src/js/db.js
// Use CDN for robust loading
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
// import { notifyAdminOfChange } from './security.js';
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
    // 1. PREPARE PAYLOAD
    const payload = items.map(item => {
        const clean = {
            type: item.type,
            content: item.content,
            styles: item.styles || {},
            position: item.position || 0,
            page: item.page || 'home'
        };
        // Keep ID if it exists
        if (item.id && typeof item.id === 'number') {
            clean.id = item.id;
        }
        return clean;
    });

    console.log("Saving...", payload);

    // 2. SAVE HISTORY (Background)
    supabase.from(TABLE_HISTORY).insert({ snapshot: payload }).then(({ error }) => {
        if (error) console.warn('History save warning:', error.message);
    });

    // 3. DELETE MISSING ITEMS (The Fix for Zombie Pages)
    // We collect all IDs that currently exist in our app. 
    // Anything in the DB that is NOT in this list will be deleted.
    const activeIds = payload
        .filter(i => i.id) // Only look at items that have an ID
        .map(i => i.id);

    if (activeIds.length > 0) {
        const { error: deleteError } = await supabase
            .from(TABLE_CONTENT)
            .delete()
            .not('id', 'in', `(${activeIds.join(',')})`); // Delete where ID is NOT in list
        
        if (deleteError) console.error("Delete sync failed:", deleteError);
    } else {
        // Edge case: If user deleted EVERYTHING, wipe the table
        // (Optional safety: usually we don't want to wipe the whole table easily)
        // await supabase.from(TABLE_CONTENT).delete().neq('id', 0); 
    }

    // 4. SPLIT UPDATES vs INSERTS
    const toUpdate = payload.filter(i => i.id);
    const toInsert = payload.filter(i => !i.id);
    let freshData = [];

    // Operation A: Update existing
    if (toUpdate.length > 0) {
        const { data: updatedData, error: updateError } = await supabase
            .from(TABLE_CONTENT)
            .upsert(toUpdate)
            .select();
        if (updateError) throw updateError;
        freshData = [...freshData, ...updatedData];
    }

    // Operation B: Insert new
    if (toInsert.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
            .from(TABLE_CONTENT)
            .insert(toInsert)
            .select();
        if (insertError) throw insertError;
        freshData = [...freshData, ...insertedData];
    }

    return freshData;
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