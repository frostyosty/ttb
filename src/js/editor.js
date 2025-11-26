/// src/js/editor.js
import { state, toggleDevMode } from './state.js';
import { render } from './renderer.js';

export function initEditor() {
    const header = document.getElementById('super-header');
    const toast = document.getElementById('toast');
    const toolbar = document.getElementById('dev-toolbar');

    let pressTimer;

    // --- ACTIVATION LOGIC ---
    const activate = () => {
        const isActive = toggleDevMode();
        
        // Visual Feedback
        toast.innerText = isActive ? "Dev Mode Activated" : "Dev Mode Deactivated";
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);

        // Show/Hide Toolbar
        if (isActive) toolbar.classList.remove('hidden');
        else toolbar.classList.add('hidden');

        render(); // Redraw with edit borders
        
        // Vibrating feedback for mobile (if supported)
        if (navigator.vibrate) navigator.vibrate(200);
    };

    // --- INPUT HANDLERS ---

    const startPress = (e) => {
        // Prevent default browser long-press menus (like "Copy Image")
        // e.preventDefault(); 
        
        pressTimer = setTimeout(() => {
            activate();
        }, 3000); // 3 Seconds
    };

    const cancelPress = () => {
        clearTimeout(pressTimer);
    };

    // 1. Mouse Events (Desktop)
    header.addEventListener('mousedown', startPress);
    header.addEventListener('mouseup', cancelPress);
    header.addEventListener('mouseleave', cancelPress);

    // 2. Touch Events (Mobile)
    header.addEventListener('touchstart', startPress, { passive: true });
    header.addEventListener('touchend', cancelPress);
    header.addEventListener('touchcancel', cancelPress);
}