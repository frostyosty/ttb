/// src/js/editor.js
import { state, toggleDevMode } from './state.js';
import { render } from './renderer.js';
import { DEV_TRIGGER } from './config.js'; // Import the switch

export function initEditor() {
    const header = document.getElementById('super-header');
    const toast = document.getElementById('toast');
    const toolbar = document.getElementById('dev-toolbar');

    let pressTimer;
    let startX = 0;
    let startY = 0;

    // --- ACTIVATION FUNCTION ---
    const activate = () => {
        const isActive = toggleDevMode();
        
        // Toggle Body Class
        if (isActive) document.body.classList.add('dev-active');
        else document.body.classList.remove('dev-active');

        // Visual Feedback
        toast.innerText = isActive ? "Dev Mode Activated" : "Dev Mode Deactivated";
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);

        // Show/Hide Toolbar
        if (isActive) toolbar.classList.remove('hidden');
        else toolbar.classList.add('hidden');

        render(); 
        
        if (navigator.vibrate) navigator.vibrate(200);
    };

    // ==========================================
    // METHOD A: LONG PRESS (3 Seconds)
    // ==========================================
    if (DEV_TRIGGER === 'longpress') {
        console.log("Security: Long Press Active");
        
        const startPress = () => {
            pressTimer = setTimeout(() => activate(), 3000); 
        };
        const cancelPress = () => clearTimeout(pressTimer);

        // Mouse
        header.addEventListener('mousedown', startPress);
        header.addEventListener('mouseup', cancelPress);
        header.addEventListener('mouseleave', cancelPress);
        // Touch
        header.addEventListener('touchstart', startPress, { passive: true });
        header.addEventListener('touchend', cancelPress);
        header.addEventListener('touchcancel', cancelPress);
    }

    // ==========================================
    // METHOD B: SWIPE RIGHT (Slide Header)
    // ==========================================
    if (DEV_TRIGGER === 'swipe') {
        console.log("Security: Swipe Gesture Active");

        const handleStart = (x, y) => {
            startX = x;
            startY = y;
        };

        const handleEnd = (x, y) => {
            const diffX = x - startX;
            const diffY = Math.abs(y - startY);

            // Logic:
            // 1. Must swipe Right (Positive X)
            // 2. Must be at least 150px distance
            // 3. Must not vary vertically too much (to distinguish from scrolling)
            if (diffX > 150 && diffY < 50) {
                activate();
            }
        };

        // Mouse Events (Click and Drag Right)
        header.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
        header.addEventListener('mouseup', (e) => handleEnd(e.clientX, e.clientY));

        // Touch Events (Swipe Finger Right)
        header.addEventListener('touchstart', (e) => {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        header.addEventListener('touchend', (e) => {
            handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        });
    }
}