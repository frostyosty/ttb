// ./src/js/db.js 


import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { notifyAdminOfChange } from './security.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLE_CONTENT = 'tweed_trading_content';
const TABLE_HISTORY = 'tweed_trading_history';

export async function fetchContent() {
  const { data, error } = await supabase.
  from(TABLE_CONTENT).
  select('*').
  order('position', { ascending: true });

  if (error) {
    console.error('SUPABASE FETCH ERROR:', error.message);
    return [];
  }
  return data;
}

export async function saveContent(items) {

  const payload = items.map((item) => {
    const clean = {
      type: item.type,
      content: item.content,
      styles: item.styles || {},
      position: item.position || 0,
      page: item.page || 'home'
    };

    if (item.id && typeof item.id === 'number') {
      clean.id = item.id;
    }

    if (item.metadata) {
      clean.metadata = item.metadata;
    }
    return clean;
  });

  console.log("Saving payload...", payload);

  supabase.from(TABLE_HISTORY).insert({ snapshot: payload }).then(({ error }) => {
    if (error) console.warn('History save warning:', error.message);
  });

  const activeIds = payload.
  filter((i) => i.id).
  map((i) => i.id);

  if (activeIds.length > 0) {
    const { error: deleteError } = await supabase.
    from(TABLE_CONTENT).
    delete().
    not('id', 'in', `(${activeIds.join(',')})`);

    if (deleteError) console.error("Delete sync failed:", deleteError);
  }

  const toUpdate = payload.filter((i) => i.id);
  const toInsert = payload.filter((i) => !i.id);
  let freshData = [];

  try {

    if (toUpdate.length > 0) {
      const { data: updatedData, error: updateError } = await supabase.
      from(TABLE_CONTENT).
      upsert(toUpdate).
      select();

      if (updateError) throw updateError;
      freshData = [...freshData, ...updatedData];
    }

    if (toInsert.length > 0) {
      const { data: insertedData, error: insertError } = await supabase.
      from(TABLE_CONTENT).
      insert(toInsert).
      select();

      if (insertError) throw insertError;
      freshData = [...freshData, ...insertedData];
    }

    notifyAdminOfChange();

    return freshData;

  } catch (error) {
    showErrorToast('Save Failed: ' + error.message);
    throw error;
  }
}

export async function fetchHistory() {
  const { data, error } = await supabase.
  from(TABLE_HISTORY).
  select('*').
  order('created_at', { ascending: false }).
  limit(10);
  return data || [];
}

export async function restoreSnapshot(snapshotItems) {
  await supabase.from(TABLE_CONTENT).delete().neq('id', 0);
  const { error } = await supabase.from(TABLE_CONTENT).insert(snapshotItems);
  return !error;
}

function showErrorToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.innerText = msg;
    toast.style.background = '#d32f2f';
    toast.style.border = '2px solid white';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
  } else {
    console.error(msg);
  }
}