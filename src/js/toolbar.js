/// src/js/toolbar.js
import { state, setItems } from './state.js';
import { saveContent, fetchHistory, restoreSnapshot } from './db.js';
import { render } from './renderer.js';



export function initToolbar() {
    
    // 1. ADD "SECTIONS" BUTTON
    const actionsDiv = document.querySelector('.toolbar-actions');
    
    // Remove the old Save button if it exists (Auto-save replaces it)
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

    // --- REMOVED MANUAL SAVE LISTENER ---

    document.getElementById('btn-mass').addEventListener('click', () => {
        document.getElementById('mass-panel').classList.toggle('hidden');
    });

    const padSlider = document.getElementById('global-padding');
    const radSlider = document.getElementById('global-radius');
    
    // For sliders, we trigger a global update request instead of manual save
    const triggerUpdate = () => document.dispatchEvent(new Event('app-render-request'));

    const applyMass = () => {
        state.items.forEach(item => {
            if(!item.styles) item.styles = {};
            item.styles.padding = `${padSlider.value}px`;
            item.styles.borderRadius = `${radSlider.value}px`;
        });
        render();
    };

    if(padSlider) { 
        padSlider.addEventListener('change', triggerUpdate); // Save on release
        padSlider.addEventListener('input', applyMass); 
    }
    if(radSlider) { 
        radSlider.addEventListener('change', triggerUpdate); 
        radSlider.addEventListener('input', applyMass); 
    }

    setupHistory();
    
    // Modals
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

    // Sort: Page A-Z, then Position 1-9
    const sortedItems = [...state.items].sort((a, b) => {
        if (a.page === b.page) return (a.position || 0) - (b.position || 0);
        return (a.page || '').localeCompare(b.page || '');
    });

    sortedItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        
        const realIndex = state.items.indexOf(item);

        // Preview Logic
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content || '';
        let text = tempDiv.innerText.substring(0, 40) + '...';
        if (item.type === 'carousel') text = '<b>[Carousel/Stock]</b>';
        if (item.type === 'map') text = '<b>[Google Map]</b>';
        if (item.content && item.content.includes('<img')) text += ' (Contains Image)';
        
        // Page Dropdown
        const pageSelect = `
            <input type="text" class="page-input" data-idx="${realIndex}" 
                   value="${item.page || 'home'}" 
                   style="padding:5px; width:80px;" list="page-options">
        `;

        // Position Input
        const posInput = `
            <input type="number" class="pos-input" data-idx="${realIndex}" 
                   value="${item.position || 0}" style="width:50px; padding:5px;">
        `;

        // Delete Button
        const actions = `
            <button class="del-btn" data-idx="${realIndex}" style="color:red; background:none; border:none; cursor:pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;

        tr.innerHTML = `
            <td style="padding:10px; font-size:0.9rem;">${text}</td>
            <td style="padding:10px;">${pageSelect}</td>
            <td style="padding:10px;">${posInput}</td>
            <td style="padding:10px;">${actions}</td>
        `;
        tbody.appendChild(tr);
    });

    // Add Datalist for Page Suggestions
    if(!document.getElementById('page-options')) {
        const dl = document.createElement('datalist');
        dl.id = 'page-options';
        const pages = [...new Set(state.items.map(i => i.page || 'home'))];
        pages.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            dl.appendChild(opt);
        });
        document.body.appendChild(dl);
    }

    attachTableListeners();
}

function attachTableListeners() {
    // Page Change
    document.querySelectorAll('.page-input').forEach(el => {
        el.addEventListener('change', (e) => {
            const index = e.target.getAttribute('data-idx');
            state.items[index].page = e.target.value.toLowerCase().replace(/\s/g, '-');
            triggerOptimisticUpdate();
        });
    });

    // Position Change
    document.querySelectorAll('.pos-input').forEach(el => {
        el.addEventListener('change', (e) => {
            const index = e.target.getAttribute('data-idx');
            state.items[index].position = parseInt(e.target.value);
            triggerOptimisticUpdate();
        });
    });

    // Delete
    document.querySelectorAll('.del-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            const btn = e.target.closest('.del-btn'); 
            const index = btn.getAttribute('data-idx');
            if(confirm('Delete this section permanently?')) {
                state.items.splice(index, 1);
                renderSectionsTable(); 
                triggerOptimisticUpdate();
            }
        });
    });
}

// --- NEW ADD FUNCTIONS ---

function addNewPage() {
    const name = prompt("Enter new Page Name (e.g., 'about', 'gallery'):");
    if (!name) return;
    
    const cleanName = name.toLowerCase().replace(/\s/g, '-');
    
    const newItem = {
        type: 'header',
        page: cleanName,
        position: 0,
        content: `<h3>${name.toUpperCase()}</h3><p>New page content...</p>`,
        styles: { 
            padding: "30px", 
            margin: "20px auto", 
            background: "white", 
            borderRadius: "8px",
            textAlign: "center"
        }
    };
    
    state.items.push(newItem);
    renderSectionsTable(); // Update Table
    triggerOptimisticUpdate(); // Save & Render background
    
    // Optional: Switch to that page so user sees it
    // But we need to update the Nav Bar buttons too! 
    alert(`Page '${cleanName}' added! Refresh the page to see it in the navigation menu.`);
}

function addNewSection() {
    const newItem = {
        type: 'section',
        page: state.currentPage || 'home', // Add to current view
        position: 99, // Put at bottom
        content: `<h4>New Section</h4><p>Edit this text...</p>`,
        styles: { 
            padding: "20px", 
            margin: "10px auto", 
            background: "white", 
            borderRadius: "5px",
            maxWidth: "800px"
        }
    };
    
    state.items.push(newItem);
    renderSectionsTable();
    triggerOptimisticUpdate();
}

function triggerOptimisticUpdate() {
    render(); 
    // Dispatch event so Auto-Save handles it instead of direct save
    document.dispatchEvent(new Event('app-render-request'));
}

function setupHistory() {
    document.getElementById('btn-restore').addEventListener('click', async () => {
        const history = await fetchHistory();
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        history.forEach(h => {
             // ... (Keep existing history logic) ...
            let preview = 'Empty';
            if (h.snapshot && h.snapshot.length > 0) {
                const types = h.snapshot.map(i => {
                    if (i.type === 'header' || i.type === 'section') return 'Text';
                    return i.type.charAt(0).toUpperCase() + i.type.slice(1);
                });
                preview = types.slice(0, 3).join(', ');
                if (types.length > 3) preview += '...';
            }

            const li = document.createElement('li');
            li.style.fontSize = '0.9rem';
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <strong>${new Date(h.created_at).toLocaleString()}</strong>
                    <span style="color:#666; font-size:0.8rem;">ID: ${h.id}</span>
                </div>
                <div style="color:#2e7d32; font-style:italic; margin-top:4px;">
                    Contains: ${preview}
                </div>
            `;
            li.onclick = async () => {
                if(confirm('Restore this version?')) {
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

    document.getElementById('btn-close-modal').addEventListener('click', () => {
        document.getElementById('history-modal').classList.add('hidden');
    });
}




function setupHistory() {
    document.getElementById('btn-restore').addEventListener('click', async () => {
        const history = await fetchHistory();
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        
        history.forEach(h => {
            // --- 1. GENERATE SUMMARY ---
            // Grab the first 3 item types to show as a preview
            let preview = 'Empty';
            if (h.snapshot && h.snapshot.length > 0) {
                const types = h.snapshot.map(i => {
                    // Use Content snippet if text, otherwise type
                    if (i.type === 'header' || i.type === 'section') return 'Text';
                    return i.type.charAt(0).toUpperCase() + i.type.slice(1);
                });
                preview = types.slice(0, 3).join(', ');
                if (types.length > 3) preview += '...';
            }

            const li = document.createElement('li');
            li.style.fontSize = '0.9rem';
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <strong>${new Date(h.created_at).toLocaleString()}</strong>
                    <span style="color:#666; font-size:0.8rem;">ID: ${h.id}</span>
                </div>
                <div style="color:#2e7d32; font-style:italic; margin-top:4px;">
                    Contains: ${preview}
                </div>
            `;
            
            li.onclick = async () => {
                if(confirm('Restore this version?')) {
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

    document.getElementById('btn-close-modal').addEventListener('click', () => {
        document.getElementById('history-modal').classList.add('hidden');
    });
}