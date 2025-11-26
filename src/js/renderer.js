/// src/js/renderer.js
import { state } from './state.js';

export function render() {
    const container = document.getElementById('app-container');
    container.innerHTML = '';

    // FILTER: Only show items for the current page
    const pageItems = state.items.filter(item => {
        // If item has no page assigned, default to 'home'
        const itemPage = item.page || 'home'; 
        return itemPage === state.currentPage;
    });

    if (pageItems.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">No content on this page yet.</div>';
    }

    pageItems.forEach((item, index) => {
        // ... (Existing render logic remains exactly the same) ...
        const el = document.createElement('div');
        el.innerHTML = item.content || '';
        el.className = 'content-block';
        Object.assign(el.style, item.styles);

        // Map the real index from main array so editing saves to correct row
        // We find the index in the original state.items array
        const originalIndex = state.items.indexOf(item);

        if (state.isDevMode) {
            setupDevFeatures(el, item, originalIndex); // Pass originalIndex
        }

        container.appendChild(el);
    });

    // NEW: If we are on Contact page, show the "Open Modal" button at the bottom
    if (state.currentPage === 'contact') {
        const btnDiv = document.createElement('div');
        btnDiv.style.textAlign = 'center';
        btnDiv.style.margin = '30px';
        btnDiv.innerHTML = `<button onclick="window.openContactModal()" style="background:#2e7d32; color:white; padding:15px 30px; border:none; font-size:1.2rem; border-radius:5px; cursor:pointer;">Send us a Message</button>`;
        container.appendChild(btnDiv);
    }
}

function setupDevFeatures(el, item, index) {
    el.classList.add('editable');
    el.setAttribute('contenteditable', 'true');

    // --- FIX 2: Save the HTML tags, not just the text ---
    el.onblur = (e) => {
        // We save innerHTML to keep your <b> and <ul> tags when you edit
        state.items[index].content = e.target.innerHTML;
    };

    // Add Handles (Visual only for now)
    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '<i class="fas fa-arrows-alt"></i>';
    el.appendChild(handle);
}