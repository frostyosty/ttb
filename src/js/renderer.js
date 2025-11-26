/// src/js/renderer.js
import { state } from './state.js';

export function render() {
    const container = document.getElementById('app-container');
    container.innerHTML = '';

    state.items.forEach((item, index) => {
        const el = document.createElement('div');
        
        // --- FIX 1: Use innerHTML so <h3> becomes a Header, not text ---
        el.innerHTML = item.content || '';
        
        // Base Styling
        el.className = 'content-block';
        Object.assign(el.style, item.styles);

        // Developer Mode Features
        if (state.isDevMode) {
            setupDevFeatures(el, item, index);
        }

        container.appendChild(el);
    });
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