/// src/js/editor.js
import { state, toggleDevMode } from './state.js';
import { render } from './renderer.js';

export function initEditor() {
    const header = document.getElementById('super-header');
    const toast = document.getElementById('toast');
    const toolbar = document.getElementById('dev-toolbar');

    let pressTimer;

    const activate = () => {
        const isActive = toggleDevMode();
        
        // 1. Toggle Body Class (Fixes Footer overlapping issue)
        if (isActive) document.body.classList.add('dev-active');
        else document.body.classList.remove('dev-active');

        // Visual Feedback
        toast.innerText = isActive ? "Dev Mode Activated" : "Dev Mode Deactivated";
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);

        // Show/Hide Toolbar
        if (isActive) toolbar.classList.remove('hidden');
        else toolbar.classList.add('hidden');

        render(); 
        
        if (navigator.vibrate) navigator.vibrate(200);
    };

    const startPress = (e) => {
        pressTimer = setTimeout(() => {
            activate();
        }, 3000); 
    };

    const cancelPress = () => {
        clearTimeout(pressTimer);
    };

    header.addEventListener('mousedown', startPress);
    header.addEventListener('mouseup', cancelPress);
    header.addEventListener('mouseleave', cancelPress);

    header.addEventListener('touchstart', startPress, { passive: true });
    header.addEventListener('touchend', cancelPress);
    header.addEventListener('touchcancel', cancelPress);
}