/// public/js/toolbar.js
import { state, setItems } from './state.js';
import { saveContent, fetchHistory, restoreSnapshot } from './db.js';
import { render } from './renderer.js';

export function initToolbar() {
    // SAVE
    document.getElementById('btn-save').addEventListener('click', () => {
        saveContent(state.items);
    });

    // MASS EDIT TOGGLE
    document.getElementById('btn-mass').addEventListener('click', () => {
        document.getElementById('mass-panel').classList.toggle('hidden');
    });

    // MASS EDIT SLIDERS
    const padSlider = document.getElementById('global-padding');
    const radSlider = document.getElementById('global-radius');

    const applyMass = () => {
        state.items.forEach(item => {
            // Initialize styles object if missing
            if(!item.styles) item.styles = {};
            
            item.styles.padding = `${padSlider.value}px`;
            item.styles.borderRadius = `${radSlider.value}px`;
        });
        render();
    };

    padSlider.addEventListener('input', applyMass);
    radSlider.addEventListener('input', applyMass);

    // HISTORY
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