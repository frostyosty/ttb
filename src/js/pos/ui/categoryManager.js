import { supabase } from '../../db.js';
import { showPosAlert, showPosConfirm } from './posModals.js';

export async function openCategoryManager(onUpdate) {
    // 1. Fetch Categories
    const { data: cats } = await supabase.from('tweed_trading_categories').select('*').order('name');

    // 2. Create Modal HTML
    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center'
    });

    modal.innerHTML = `
        <div style="background:white; width:90%; max-width:400px; border-radius:8px; padding:20px; max-height:80vh; display:flex; flex-direction:column;">
            <h3 style="margin-top:0;">📂 Manage Categories</h3>
            
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <input type="text" id="new-cat-name" placeholder="New Category Name" style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;">
                <button id="btn-add-cat" class="pos-btn" style="background:#2e7d32; color:white;">+</button>
            </div>

            <div id="cat-list" style="flex:1; overflow-y:auto; border:1px solid #eee; border-radius:4px; margin-bottom:15px;">
                ${renderList(cats)}
            </div>

            <button id="btn-close-cat" class="pos-btn" style="width:100%;">Done</button>
        </div>
    `;

    document.body.appendChild(modal);

    // 3. Logic
    const input = modal.querySelector('#new-cat-name');
    const list = modal.querySelector('#cat-list');

    // Add Category
    modal.querySelector('#btn-add-cat').onclick = async () => {
        const name = input.value.trim();
        if(!name) return;

        const { error } = await supabase.from('tweed_trading_categories').insert({ name });
        if(error) alert(error.message);
        else {
            input.value = '';
            refreshList();
        }
    };

    // Close
    modal.querySelector('#btn-close-cat').onclick = () => {
        document.body.removeChild(modal);
        if(onUpdate) onUpdate(); // Refresh the dropdown in the main form
    };

    // Refresh Helper
    async function refreshList() {
        const { data } = await supabase.from('tweed_trading_categories').select('*').order('name');
        list.innerHTML = renderList(data);
        bindDeleteButtons(data);
    }

    function renderList(items) {
        if(!items || items.length === 0) return '<div style="padding:10px; text-align:center; color:#999;">No categories</div>';
        return items.map(c => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                <span>${c.name}</span>
                <button class="del-cat-btn" data-id="${c.id}" style="color:red; background:none; border:none; cursor:pointer;">🗑️</button>
            </div>
        `).join('');
    }

    function bindDeleteButtons() {
        list.querySelectorAll('.del-cat-btn').forEach(btn => {
            btn.onclick = async (e) => {
                if(confirm('Delete this category?')) {
                    await supabase.from('tweed_trading_categories').delete().eq('id', e.target.dataset.id);
                    refreshList();
                }
            };
        });
    }

    bindDeleteButtons();
}