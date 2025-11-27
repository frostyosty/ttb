/// src/js/toolbar.js
import { state, setItems } from './state.js';
import { saveContent, fetchHistory, restoreSnapshot } from './db.js';
import { render } from './renderer.js';



export function initToolbar() {
    
    // 1. ADD "SECTIONS" BUTTON
    const actionsDiv = document.querySelector('.toolbar-actions');
    
    // Remove old Save button if exists
    const oldSave = document.getElementById('btn-save');
    if (oldSave) oldSave.remove();

    if (!document.getElementById('btn-sections')) {
        const btn = document.createElement('button');
        btn.id = 'btn-sections';
        btn.innerHTML = '<i class="fas fa-list"></i> Sections';
        const historyBtn = document.getElementById('btn-restore');
        actionsDiv.insertBefore(btn, historyBtn);
        btn.addEventListener('click', openSectionsManager);
    }

    // 2. TOGGLE MASS PANEL
    document.getElementById('btn-mass').addEventListener('click', () => {
        document.getElementById('mass-panel').classList.toggle('hidden');
    });

    // 3. MASS EDIT LOGIC
    const padSlider = document.getElementById('global-padding');
    const radSlider = document.getElementById('global-radius');
    const textSlider = document.getElementById('global-text'); // <--- NEW

    const triggerUpdate = () => document.dispatchEvent(new Event('app-render-request'));

    const applyMass = () => {
        state.items.forEach(item => {
            if(!item.styles) item.styles = {};
            
            // Apply Sliders
            if(padSlider) item.styles.padding = `${padSlider.value}px`;
            if(radSlider) item.styles.borderRadius = `${radSlider.value}px`;
            if(textSlider) item.styles.fontSize = `${textSlider.value}%`; // <--- NEW
        });
        render();
    };

    // Attach Listeners
    if(padSlider) { 
        padSlider.addEventListener('change', triggerUpdate); 
        padSlider.addEventListener('input', applyMass); 
    }
    if(radSlider) { 
        radSlider.addEventListener('change', triggerUpdate); 
        radSlider.addEventListener('input', applyMass); 
    }
    if(textSlider) { // <--- NEW LISTENERS
        textSlider.addEventListener('change', triggerUpdate); 
        textSlider.addEventListener('input', applyMass); 
    }

    setupHistory();
    
    // Modal Listeners
    document.getElementById('close-sections').addEventListener('click', () => document.getElementById('sections-modal').classList.add('hidden'));
    document.getElementById('btn-add-page').addEventListener('click', addNewPage);
    document.getElementById('btn-add-section').addEventListener('click', addNewSection);
}

// --- SECTIONS MANAGER LOGIC ---

function openSectionsManager() {
    renderSectionsTable();
    document.getElementById('sections-modal').classList.remove('hidden');
}

function renderSectionsTable() {
    const tbody = document.getElementById('sections-list');
    tbody.innerHTML = '';
    const sortedItems = [...state.items].sort((a, b) => {
        if (a.page === b.page) return (a.position || 0) - (b.position || 0);
        return (a.page || '').localeCompare(b.page || '');
    });

    sortedItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        const realIndex = state.items.indexOf(item);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content || '';
        let text = tempDiv.innerText.substring(0, 40) + '...';
        if (item.type === 'carousel') text = '<b>[Carousel]</b>';
        if (item.type === 'map') text = '<b>[Map]</b>';
        
        const pageSelect = `<input type="text" class="page-input" data-idx="${realIndex}" value="${item.page || 'home'}" style="padding:5px; width:80px;" list="page-options">`;
        const posInput = `<input type="number" class="pos-input" data-idx="${realIndex}" value="${item.position || 0}" style="width:50px; padding:5px;">`;
        const actions = `<button class="del-btn" data-idx="${realIndex}" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>`;

        tr.innerHTML = `<td style="padding:10px; font-size:0.9rem;">${text}</td><td style="padding:10px;">${pageSelect}</td><td style="padding:10px;">${posInput}</td><td style="padding:10px;">${actions}</td>`;
        tbody.appendChild(tr);
    });

    if(!document.getElementById('page-options')) {
        const dl = document.createElement('datalist');
        dl.id = 'page-options';
        const pages = [...new Set(state.items.map(i => i.page || 'home'))];
        pages.forEach(p => { const opt = document.createElement('option'); opt.value = p; dl.appendChild(opt); });
        document.body.appendChild(dl);
    }
    attachTableListeners();
}

function attachTableListeners() {
    document.querySelectorAll('.page-input').forEach(el => { el.addEventListener('change', (e) => { const index = e.target.getAttribute('data-idx'); state.items[index].page = e.target.value.toLowerCase().replace(/\s/g, '-'); triggerOptimisticUpdate(); }); });
    document.querySelectorAll('.pos-input').forEach(el => { el.addEventListener('change', (e) => { const index = e.target.getAttribute('data-idx'); state.items[index].position = parseInt(e.target.value); triggerOptimisticUpdate(); }); });
    document.querySelectorAll('.del-btn').forEach(el => { el.addEventListener('click', (e) => { const btn = e.target.closest('.del-btn'); const index = btn.getAttribute('data-idx'); if(confirm('Delete?')) { state.items.splice(index, 1); renderSectionsTable(); triggerOptimisticUpdate(); } }); });
}

function addNewPage() {
    const name = prompt("Page Name:"); if (!name) return;
    state.items.push({ type: 'header', page: name.toLowerCase().replace(/\s/g, '-'), position: 0, content: `<h3>${name.toUpperCase()}</h3>`, styles: { padding: "30px", background: "white", borderRadius: "8px", textAlign: "center" } });
    renderSectionsTable(); triggerOptimisticUpdate();
}

function addNewSection() {
    state.items.push({ type: 'section', page: state.currentPage || 'home', position: 99, content: `<h4>New Section</h4><p>Edit me...</p>`, styles: { padding: "20px", background: "white", borderRadius: "5px", maxWidth: "800px" } });
    renderSectionsTable(); triggerOptimisticUpdate();
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
                const types = h.snapshot.map(i => (i.type === 'header' || i.type === 'section') ? 'Text' : i.type.charAt(0).toUpperCase() + i.type.slice(1));
                preview = types.slice(0, 3).join(', ') + (types.length > 3 ? '...' : '');
            }
            const li = document.createElement('li');
            li.style.fontSize = '0.9rem';
            li.innerHTML = `<div style="display:flex; justify-content:space-between;"><strong>${new Date(h.created_at).toLocaleTimeString()}</strong><span style="color:#666; font-size:0.8rem;">ID: ${h.id}</span></div><div style="color:#2e7d32; font-style:italic;">Contains: ${preview}</div>`;
            li.onclick = async () => { if(confirm('Restore?')) { await restoreSnapshot(h.snapshot); setItems(h.snapshot); render(); document.getElementById('history-modal').classList.add('hidden'); } };
            list.appendChild(li);
        });
        document.getElementById('history-modal').classList.remove('hidden');
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => document.getElementById('history-modal').classList.add('hidden'));
}

