/// public/js/renderer.js
import { state } from './state.js';

export function render() {
    const container = document.getElementById('app-container');
    container.innerHTML = '';

    state.items.forEach((item, index) => {
        const el = document.createElement('div');
        
        // Content
        el.innerText = item.content || '';
        
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

    // Update state when text changes
    el.onblur = (e) => {
        state.items[index].content = e.target.innerText;
    };

    // Add Handles (Visual only for now)
    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '<i class="fas fa-arrows-alt"></i>';
    el.appendChild(handle);
}