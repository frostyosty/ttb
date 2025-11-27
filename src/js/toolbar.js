/// src/js/toolbar.js
import { state, setItems } from './state.js';
import { saveContent, fetchHistory, restoreSnapshot } from './db.js';
import { render } from './renderer.js';
import { ask } from './modal.js';

export function initToolbar() {
    
    // 1. ADD BUTTONS
    const actionsDiv = document.querySelector('.toolbar-actions');
    const oldSave = document.getElementById('btn-save');
    if (oldSave) oldSave.remove();

    if (!document.getElementById('btn-sections')) {
        const btn = document.createElement('button');
        btn.id = 'btn-sections';
        btn.innerHTML = '<i class="fas fa-list"></i> Sections';
        actionsDiv.insertBefore(btn, document.getElementById('btn-restore'));
        btn.addEventListener('click', openSectionsManager);
    }

    if (!document.getElementById('btn-emergency')) {
        const btn = document.createElement('button');
        btn.id = 'btn-emergency';
        btn.innerHTML = '<i class="fas fa-bullhorn"></i> Alert';
        btn.style.background = '#ff9800'; 
        actionsDiv.insertBefore(btn, document.getElementById('btn-restore'));
        btn.addEventListener('click', () => {
            document.getElementById('emergency-modal').classList.remove('hidden');
            document.getElementById('emergency-text').focus();
        });
    }

    document.getElementById('btn-mass').addEventListener('click', () => {
        document.getElementById('mass-panel').classList.toggle('hidden');
    });

    const padSlider = document.getElementById('global-padding');
    const radSlider = document.getElementById('global-radius');
    const textSlider = document.getElementById('global-text');

    const triggerUpdate = () => document.dispatchEvent(new Event('app-render-request'));
    const applyMass = () => {
        state.items.forEach(item => {
            if(!item.styles) item.styles = {};
            if(padSlider) item.styles.padding = `${padSlider.value}px`;
            if(radSlider) item.styles.borderRadius = `${radSlider.value}px`;
            if(textSlider) item.styles.fontSize = `${textSlider.value}%`;
        });
        render();
    };

    if(padSlider) { padSlider.addEventListener('change', triggerUpdate); padSlider.addEventListener('input', applyMass); }
    if(radSlider) { radSlider.addEventListener('change', triggerUpdate); radSlider.addEventListener('input', applyMass); }
    if(textSlider) { textSlider.addEventListener('change', triggerUpdate); textSlider.addEventListener('input', applyMass); }

    setupHistory();
    setupModals();
}

function setupModals() {
    document.getElementById('close-sections').addEventListener('click', () => document.getElementById('sections-modal').classList.add('hidden'));
    document.getElementById('btn-add-page').addEventListener('click', addNewPage);
    document.getElementById('btn-add-section').addEventListener('click', addNewSection);
    const noteBtn = document.getElementById('btn-add-notepad');
    if(noteBtn) noteBtn.addEventListener('click', addNewNotepad);

    document.getElementById('close-emergency').addEventListener('click', () => document.getElementById('emergency-modal').classList.add('hidden'));
    document.getElementById('post-emergency').addEventListener('click', postAnnouncement);
}

function postAnnouncement() {
    const text = document.getElementById('emergency-text').value;
    if(!text) return;
    const newItem = {
        type: 'alert', 
        page: state.currentPage || 'home',
        position: -10,
        content: `<h3><i class="fas fa-exclamation-triangle"></i> Important</h3><p>${text}</p>`,
        styles: { padding: "20px", maxWidth: "800px", margin: "20px auto" }
    };
    state.items.unshift(newItem); 
    triggerOptimisticUpdate();
    document.getElementById('emergency-text').value = '';
    document.getElementById('emergency-modal').classList.add('hidden');
}

function openSectionsManager() {
    renderSectionsTable();
    document.getElementById('sections-modal').classList.remove('hidden');
}

function renderSectionsTable() {
    const tbody = document.getElementById('sections-list');
    tbody.innerHTML = '';
    
    // Sort items logic
    const sortedItems = [...state.items].sort((a, b) => {
        if (a.page === b.page) return (a.position || 0) - (b.position || 0);
        return (a.page || '').localeCompare(b.page || '');
    });

    // 1. GATHER ALL UNIQUE PAGES
    const uniquePages = new Set(state.items.map(i => i.page || 'home'));
    // Ensure default pages always exist in the dropdown
    ['home', 'products', 'contact'].forEach(p => uniquePages.add(p));
    const pageOptions = Array.from(uniquePages).sort();

    sortedItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        const realIndex = state.items.indexOf(item);
        
        // Preview Text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content || '';
        let text = tempDiv.innerText.substring(0, 40) + '...';
        if (item.type === 'carousel') text = '<b>[Carousel]</b>';
        if (item.type === 'map') text = '<b>[Map]</b>';
        if (item.type === 'notepad') text = '<b>[Notepad]</b>';
        if (item.type === 'alert') text = '<b style="color:orange">[ALERT]</b> ' + text;
        
        // 2. BUILD SELECT DROPDOWN (Replacing the old Input)
        let optionsHtml = '';
        pageOptions.forEach(p => {
            const isSelected = (item.page || 'home') === p ? 'selected' : '';
            optionsHtml += `<option value="${p}" ${isSelected}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`;
        });
        
        const pageSelect = `
            <select class="page-select" data-idx="${realIndex}" style="padding:8px; width:100px; border-radius:4px; border:1px solid #ccc;">
                ${optionsHtml}
            </select>
        `;

        const posInput = `<input type="number" class="pos-input" data-idx="${realIndex}" value="${item.position || 0}" style="width:50px; padding:5px;">`;
        const actions = `<button class="del-btn" data-idx="${realIndex}" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>`;

        tr.innerHTML = `<td style="padding:10px; font-size:0.9rem;">${text}</td><td style="padding:10px;">${pageSelect}</td><td style="padding:10px;">${posInput}</td><td style="padding:10px;">${actions}</td>`;
        tbody.appendChild(tr);
    });

    attachTableListeners();
}

function attachTableListeners() {
    // Dropdown Change Listener
    document.querySelectorAll('.page-select').forEach(el => { 
        el.addEventListener('change', (e) => { 
            const index = e.target.getAttribute('data-idx'); 
            state.items[index].page = e.target.value; // No regex needed for select
            triggerOptimisticUpdate(); 
            // Re-render table to sort the row into its new group
            renderSectionsTable();
        }); 
    });

    document.querySelectorAll('.pos-input').forEach(el => { el.addEventListener('change', (e) => { const index = e.target.getAttribute('data-idx'); state.items[index].position = parseInt(e.target.value); triggerOptimisticUpdate(); }); });
    
    // 3. DELETE (INSTANT - NO CONFIRM)
    document.querySelectorAll('.del-btn').forEach(el => { 
        el.addEventListener('click', (e) => { 
            const btn = e.target.closest('.del-btn'); 
            const index = btn.getAttribute('data-idx'); 
            // Removed Confirm() check
            state.items.splice(index, 1); 
            renderSectionsTable(); 
            triggerOptimisticUpdate(); 
        }); 
    });
}

async function addNewPage() {
    const name = await ask("Enter Page Name (e.g. Gallery):");
    if (!name) return;
    
    state.items.push({ 
        type: 'header', 
        page: name.toLowerCase().replace(/\s/g, '-'), 
        position: 0, 
        content: `<h3>${name.toUpperCase()}</h3>`, 
        styles: { padding: "30px", background: "white", borderRadius: "8px", textAlign: "center" } 
    });
    
    renderSectionsTable(); 
    triggerOptimisticUpdate();
}

function addNewSection() {
    state.items.push({ type: 'section', page: state.currentPage || 'home', position: 99, content: `<h4>New Section</h4><p>Edit me...</p>`, styles: { padding: "20px", background: "white", borderRadius: "5px", maxWidth: "800px" } });
    renderSectionsTable(); triggerOptimisticUpdate();
}

function addNewNotepad() {
    const newItem = { type: 'notepad', page: state.currentPage || 'home', position: 99, content: '', styles: { padding: "10px", margin: "20px auto", maxWidth: "600px", background: "transparent" } };
    state.items.push(newItem); renderSectionsTable(); triggerOptimisticUpdate();
}

function triggerOptimisticUpdate() { render(); document.dispatchEvent(new Event('app-render-request')); }

function setupHistory() {
    document.getElementById('btn-restore').addEventListener('click', async () => {
        const history = await fetchHistory();
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        history.forEach(h => {
            let preview = 'Empty';
            if (h.snapshot && h.snapshot.length > 0) {
                const types = h.snapshot.map(i => {
                    if (i.content) {
                        const div = document.createElement('div');
                        div.innerHTML = i.content;
                        const cleanText = div.innerText.substring(0, 15).trim();
                        if (cleanText) return cleanText;
                    }
                    return i.type.charAt(0).toUpperCase() + i.type.slice(1);
                });
                preview = types.slice(0, 5).join(', ') + (types.length > 5 ? '...' : '');
            }

            const li = document.createElement('li');
            li.style.fontSize = '0.9rem';
            li.innerHTML = `<div style="display:flex; justify-content:space-between;"><strong>${new Date(h.created_at).toLocaleTimeString()}</strong><span style="color:#666; font-size:0.8rem;">ID: ${h.id}</span></div><div style="color:#2e7d32; font-style:italic;">Contains: ${preview}</div>`;
            li.onclick = async () => { 
                if(confirm('Restore?')) { 
                    await restoreSnapshot(h.snapshot); 
                    setItems(h.snapshot); 
                    render(); 
                    document.getElementById('history-modal').classList.add('hidden'); 
                } 
            };
            list.appendChild(li);
        });
        document.getElementById('history-modal').classList.remove('hidden');
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => document.getElementById('history-modal').classList.add('hidden'));
}