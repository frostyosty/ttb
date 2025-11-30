/// src/js/editor.js
import { state, toggleDevMode } from './state.js';
import { render } from './renderer.js';
import { DEV_TRIGGER } from './config.js'; 

export function initEditor() {
    const header = document.getElementById('super-header');
    const toast = document.getElementById('toast');
    const toolbar = document.getElementById('dev-toolbar');

    let pressTimer;
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    // --- ACTIVATION FUNCTION ---
    const activate = () => {
        const isActive = toggleDevMode();
        
        if (isActive) document.body.classList.add('dev-active');
        else document.body.classList.remove('dev-active');

        toast.innerText = isActive ? "Dev Mode Activated" : "Dev Mode Deactivated";
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);

        if (isActive) toolbar.classList.remove('hidden');
        else toolbar.classList.add('hidden');

        render(); 
        
        if (navigator.vibrate) navigator.vibrate(200);
    };

    // ==========================================
    // METHOD A: LONG PRESS (3 Seconds)
    // ==========================================
    if (DEV_TRIGGER === 'longpress') {
        // console.log("Security: Long Press Active");
        
        const startPress = () => {
            pressTimer = setTimeout(() => activate(), 3000); 
        };
        const cancelPress = () => clearTimeout(pressTimer);

        header.addEventListener('mousedown', startPress);
        header.addEventListener('mouseup', cancelPress);
        header.addEventListener('mouseleave', cancelPress);
        
        header.addEventListener('touchstart', startPress, { passive: true });
        header.addEventListener('touchend', cancelPress);
        header.addEventListener('touchcancel', cancelPress);
    }

    // ==========================================
    // METHOD B: SWIPE RIGHT (Slide Header)
    // ==========================================
    if (DEV_TRIGGER === 'swipe') {
        // console.log("Security: Swipe Gesture Active");

        // 1. DISABLE NATIVE DRAG (Fixes Desktop Issue)
        header.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });

        const handleStart = (x, y) => {
            isSwiping = true;
            startX = x;
            startY = y;
        };

        const handleEnd = (x, y) => {
            if (!isSwiping) return;
            isSwiping = false;

            const diffX = x - startX;
            const diffY = Math.abs(y - startY);

            // Logic: Positive X (Right), > 150px distance, Low vertical drift
            if (diffX > 150 && diffY < 100) {
                activate();
            }
        };

        // --- MOUSE EVENTS (Desktop) ---
        header.addEventListener('mousedown', (e) => {
            // Prevent text cursor
            e.preventDefault(); 
            handleStart(e.clientX, e.clientY);
        });

        // Listen on WINDOW so you can drag wildly off the header
        window.addEventListener('mouseup', (e) => {
            handleEnd(e.clientX, e.clientY);
        });

        // --- TOUCH EVENTS (Mobile) ---
        header.addEventListener('touchstart', (e) => {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        header.addEventListener('touchend', (e) => {
            handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        });
    }
}