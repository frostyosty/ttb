/// src/js/renderer.js
import { state } from './state.js';

export function render() {
    const container = document.getElementById('app-container');
    container.innerHTML = '';

    const pageItems = state.items.filter(item => {
        const itemPage = item.page || 'home'; 
        return itemPage === state.currentPage;
    });

    if (pageItems.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">No content on this page yet.</div>';
    }

    pageItems.forEach((item, index) => {
        const el = document.createElement('div');
        el.innerHTML = item.content || '';
        el.className = 'content-block';
        Object.assign(el.style, item.styles);

        const originalIndex = state.items.indexOf(item);

        if (state.isDevMode) {
            setupDevFeatures(el, item, originalIndex);
        }

        container.appendChild(el);
    });

    // --- BUTTON LOGIC DELETED HERE ---
}

function setupDevFeatures(el, item, index) {
    el.classList.add('editable');
    el.setAttribute('contenteditable', 'true');

    el.onblur = (e) => {
        state.items[index].content = e.target.innerHTML;
    };

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '<i class="fas fa-arrows-alt"></i>';
    el.appendChild(handle);
}