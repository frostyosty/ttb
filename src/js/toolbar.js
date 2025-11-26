/// src/js/toolbar.js
import { state, setItems } from './state.js';
import { saveContent, fetchHistory, restoreSnapshot } from './db.js';
import { render } from './renderer.js';

export function initToolbar() {
    
    // 1. ADD "SECTIONS" BUTTON TO TOOLBAR
    const actionsDiv = document.querySelector('.toolbar-actions');
    
    // Check if button already exists to prevent duplicates
    if (!document.getElementById('btn-sections')) {
        const btn = document.createElement('button');
        btn.id = 'btn-sections';
        btn.innerHTML = '<i class="fas fa-list"></i> Sections';
        // Insert before the "History" button
        const historyBtn = document.getElementById('btn-restore');
        actionsDiv.insertBefore(btn, historyBtn);
        
        btn.addEventListener('click', openSectionsManager);
    }

    // --- EXISTING LISTENERS ---
    document.getElementById('btn-save').addEventListener('click', () => {
        saveContent(state.items);
        // Optional: specific visual feedback for manual save if you want
        // but per request, we keep it silent or minimal
    });

    document.getElementById('btn-mass').addEventListener('click', () => {
        document.getElementById('mass-panel').classList.toggle('hidden');
    });

    // Mass sliders logic... (Keep existing code)
    const padSlider = document.getElementById('global-padding');
    const radSlider = document.getElementById('global-radius');
    const applyMass = () => {
        state.items.forEach(item => {
            if(!item.styles) item.styles = {};
            item.styles.padding = `${padSlider.value}px`;
            item.styles.borderRadius = `${radSlider.value}px`;
        });
        render(); // Optimistic render
    };
    if(padSlider) {
        padSlider.addEventListener('change', () => saveContent(state.items)); // Save on release
        padSlider.addEventListener('input', applyMass);
    }
    if(radSlider) {
        radSlider.addEventListener('change', () => saveContent(state.items));
        radSlider.addEventListener('input', applyMass);
    }

    // History Logic... (Keep existing code)
    setupHistory();
    
    // Sections Modal Close
    document.getElementById('close-sections').addEventListener('click', () => {
        document.getElementById('sections-modal').classList.add('hidden');
    });
}

// --- SECTIONS MANAGER LOGIC ---

function openSectionsManager() {
    const modal = document.getElementById('sections-modal');
    renderSectionsTable();
    modal.classList.remove('hidden');
}

function renderSectionsTable() {
    const tbody = document.getElementById('sections-list');
    tbody.innerHTML = '';

    // Sort items by Page, then by Position for the table
    const sortedItems = [...state.items].sort((a, b) => {
        if (a.page === b.page) return (a.position || 0) - (b.position || 0);
        return a.page.localeCompare(b.page);
    });

    sortedItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        
        // Find actual index in main state array (crucial for updates)
        const realIndex = state.items.indexOf(item);

        // 1. Preview Column (Strip HTML)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content;
        let text = tempDiv.innerText.substring(0, 40) + '...';
        if (item.type === 'image') text = '[Image/Carousel]';
        if (item.type === 'map') text = '[Google Map]';
        
        // 2. Page Dropdown
        const pageSelect = `
            <select class="page-select" data-idx="${realIndex}" style="padding:5px;">
                <option value="home" ${item.page === 'home' ? 'selected' : ''}>Home</option>
                <option value="products" ${item.page === 'products' ? 'selected' : ''}>Products</option>
                <option value="contact" ${item.page === 'contact' ? 'selected' : ''}>Contact</option>
            </select>
        `;

        // 3. Position Input
        const posInput = `
            <input type="number" class="pos-input" data-idx="${realIndex}" 
                   value="${item.position || 0}" style="width:50px; padding:5px;">
        `;

        // 4. Delete Button
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

    // Attach Listeners
    attachTableListeners();
}

function attachTableListeners() {
    // Page Change
    document.querySelectorAll('.page-select').forEach(el => {
        el.addEventListener('change', (e) => {
            const index = e.target.getAttribute('data-idx');
            state.items[index].page = e.target.value;
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
            // Find the button (handle icon click vs button click)
            const btn = e.target.closest('.del-btn'); 
            const index = btn.getAttribute('data-idx');
            
            if(confirm('Delete this section permanently?')) {
                state.items.splice(index, 1);
                renderSectionsTable(); // Re-render table row gone
                triggerOptimisticUpdate();
            }
        });
    });
}

function triggerOptimisticUpdate() {
    // 1. Update the Main Website View immediately
    render(); 
    
    // 2. Save to DB silently
    saveContent(state.items).catch(err => {
        console.error(err);
        // Toast is handled in db.js showErrorToast
    });
}

function setupHistory() {
    // ... (Paste your existing History button logic here from previous toolbar.js) ...
    document.getElementById('btn-restore').addEventListener('click', async () => {
        const history = await fetchHistory();
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        history.forEach(h => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${new Date(h.created_at).toLocaleTimeString()}</strong> - Ver ID: ${h.id}`;
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