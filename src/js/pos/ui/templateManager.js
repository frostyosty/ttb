import { supabase } from '../../db.js';
import { showPosConfirm, showPosInput, showPosToast } from './posModals.js';

export async function openTemplateManager(onUpdate) {
    // 1. Fetch Templates
    const { data: templates } = await supabase
        .from('tweed_trading_label_templates')
        .select('*')
        .order('name'); // Ordering by name for now

    // 2. Create Modal HTML
    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)', zIndex: 10005, display: 'flex', justifyContent: 'center', alignItems: 'center'
    });

    modal.innerHTML = `
        <div style="background:white; width:90%; max-width:500px; border-radius:8px; padding:20px; max-height:80vh; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0;">📂 Manage Templates</h3>
                <button id="btn-close-tpl" class="pos-btn" style="padding:5px 10px;">Close</button>
            </div>

            <div id="tpl-list" style="flex:1; overflow-y:auto; border:1px solid #eee; border-radius:4px; margin-bottom:15px; background:#fafafa;">
                ${renderList(templates)}
            </div>
            
            <small style="color:#666;">Note: Templates are sorted alphabetically.</small>
        </div>
    `;

    document.body.appendChild(modal);

    // 3. Bind Actions
    const list = modal.querySelector('#tpl-list');

    // Close
    modal.querySelector('#btn-close-tpl').onclick = () => {
        document.body.removeChild(modal);
        if(onUpdate) onUpdate(); // Refresh the main dropdown
    };

    // Helper: Refresh List
    async function refreshList() {
        const { data } = await supabase.from('tweed_trading_label_templates').select('*').order('name');
        list.innerHTML = renderList(data);
        bindRowActions(data);
    }

    function renderList(items) {
        if(!items || items.length === 0) return '<div style="padding:20px; text-align:center; color:#999;">No saved templates.</div>';
        return items.map(t => `
            <div style="display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid #eee; background:white;">
                <span style="flex:1; font-weight:500;">${t.name}</span>
                <button class="tpl-rename-btn pos-btn" data-id="${t.id}" data-name="${t.name}" style="font-size:0.8rem;">✏️ Rename</button>
                <button class="tpl-del-btn pos-btn" data-id="${t.id}" style="color:white; background:#d32f2f; font-size:0.8rem;">🗑️</button>
            </div>
        `).join('');
    }

    function bindRowActions(data) {
        // Delete Logic
        list.querySelectorAll('.tpl-del-btn').forEach(btn => {
            btn.onclick = async (e) => {
                if(await showPosConfirm('Delete this template permanently?')) {
                    await supabase.from('tweed_trading_label_templates').delete().eq('id', e.target.dataset.id);
                    refreshList();
                    showPosToast("Template Deleted");
                }
            };
        });

        // Rename Logic
        list.querySelectorAll('.tpl-rename-btn').forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.target.dataset.id;
                const oldName = e.target.dataset.name;
                const newName = await showPosInput("Rename Template", oldName);
                
                if(newName && newName !== oldName) {
                    const { error } = await supabase.from('tweed_trading_label_templates')
                        .update({ name: newName }).eq('id', id);
                    
                    if(!error) {
                        refreshList();
                        showPosToast("Renamed Successfully");
                    } else {
                        showPosToast(error.message, 'error');
                    }
                }
            };
        });
    }

    bindRowActions(templates);
}