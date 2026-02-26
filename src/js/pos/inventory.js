// ./src/js/pos/inventory.js 

import { supabase } from '../db.js';
import { printLabelData } from './editor/index.js';

export async function initInventory() {
  const container = document.getElementById('pos-content-area');
  container.innerHTML = `
        <div style="padding:20px; height:100%; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h2 style="margin:0;">📋 Inventory</h2>
                <input type="text" id="inv-search" placeholder="Search Name or SKU..." 
                    style="padding:10px; width:200px; border:1px solid #ccc; border-radius:4px;">
            </div>

            <div style="flex:1; overflow:auto; background:white; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                    <thead style="background:#f4f4f4; position:sticky; top:0;">
                        <tr style="text-align:left; color:#666;">
                            <th style="padding:12px;">Image</th>
                            <th style="padding:12px;">Name / SKU</th>
                            <th style="padding:12px;">Stock</th>
                            <th style="padding:12px;">Price</th>
                            <th style="padding:12px; text-align:right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="inv-list">
                        <tr><td colspan="5" style="padding:20px; text-align:center;">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

  loadInventory();

  let timer;
  document.getElementById('inv-search').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => loadInventory(e.target.value), 500);
  });
}

async function loadInventory(search = '') {
  let query = supabase.from('tweed_trading_products').
  select('*').
  order('created_at', { ascending: false }).
  limit(50);

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  const { data, error } = await query;
  const tbody = document.getElementById('inv-list');

  if (error || !data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="padding:20px; text-align:center;">No items found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((item) => `
        <tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">
                ${item.image_url ? `<img src="${item.image_url}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">` : '<div style="width:40px; height:40px; background:#eee; border-radius:4px;"></div>'}
            </td>
            <td style="padding:10px;">
                <div style="font-weight:bold;">${item.name}</div>
                <div style="font-size:0.8rem; color:#888;">${item.sku}</div>
            </td>
            <td style="padding:10px;">${item.stock_level}</td>
            <td style="padding:10px;">$${item.price}</td>
            <td style="padding:10px; text-align:right;">
                <button class="pos-btn" onclick="window.posReprint('${item.id}')" title="Reprint Label">🖨️</button>
                <button class="pos-btn" onclick="window.posDelete('${item.id}')" style="color:red;" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');

  window.posReprint = (id) => {
    const item = data.find((i) => i.id == id);
    if (item) {

      printLabelData(item, null);
    }
  };

  window.posDelete = async (id) => {
    if (confirm('Delete this item?')) {
      await supabase.from('tweed_trading_products').delete().eq('id', id);
      loadInventory(search);
    }
  };
}