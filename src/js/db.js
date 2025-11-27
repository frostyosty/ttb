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
    // 1. CLEAN THE DATA
    const cleanItems = items.map(item => {
        const clean = {
            type: item.type,
            content: item.content,
            styles: item.styles || {},
            position: item.position || 0,
            page: item.page || 'home'
        };
        // Only keep ID if it is a real number
        if (item.id && typeof item.id === 'number') {
            clean.id = item.id;
        }
        return clean;
    });

    // 2. SAVE HISTORY (Background)
    supabase.from(TABLE_HISTORY).insert({ snapshot: cleanItems }).then(({ error }) => {
        if (error) console.warn('History save warning:', error.message);
    });

    // 3. SPLIT THE JOB
    // Group A: Existing items (Have ID) -> UPDATE
    const toUpdate = cleanItems.filter(i => i.id);
    // Group B: New items (No ID) -> INSERT
    const toInsert = cleanItems.filter(i => !i.id);

    console.log(`Saving: ${toUpdate.length} Updates, ${toInsert.length} Inserts`);

    let freshData = [];

    // Operation A: Upsert existing
    if (toUpdate.length > 0) {
        const { data: updatedData, error: updateError } = await supabase
            .from(TABLE_CONTENT)
            .upsert(toUpdate)
            .select();
            
        if (updateError) throw updateError;
        freshData = [...freshData, ...updatedData];
    }

    // Operation B: Insert new (Forces DB to generate IDs)
    if (toInsert.length > 0) {
        const { data: insertedData, error: insertError } = await supabase
            .from(TABLE_CONTENT)
            .insert(toInsert)
            .select(); // Get the new IDs back

        if (insertError) throw insertError;
        freshData = [...freshData, ...insertedData];
    }

    // 4. RETURN COMBINED FRESH DATA
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