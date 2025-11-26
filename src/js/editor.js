/// public/js/editor.js
import { state, toggleDevMode } from './state.js';
import { render } from './renderer.js';

export function initEditor() {
    const header = document.getElementById('super-header');
    const toast = document.getElementById('toast');
    const toolbar = document.getElementById('dev-toolbar');

    header.addEventListener('click', () => {
        state.clickCount++;
        
        if (state.clickCount === 10) {
            const isActive = toggleDevMode();
            state.clickCount = 0;

            // UI Updates
            toast.innerText = isActive ? "Dev Mode Activated" : "Dev Mode Deactivated";
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);

            if (isActive) toolbar.classList.remove('hidden');
            else toolbar.classList.add('hidden');

            render(); // Re-render to add/remove edit borders
        }
        
        // Reset counter if user clicks too slow
        setTimeout(() => state.clickCount = 0, 1000);
    });
}