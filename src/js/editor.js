// ./src/js/editor.js 


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

  const activate = () => {
    const isActive = toggleDevMode();

    if (isActive) {

      console.log("🔓 Dev Mode Unlocked via Gesture!");
      document.body.classList.add('dev-active');
      toolbar.classList.remove('hidden');

      localStorage.setItem('tweed_admin_logged_in', 'true');
      localStorage.setItem('tweed_is_admin_device', 'true');

      import('./pos/posMain.js').then((module) => {
        module.initPOS();
      });

      toast.innerText = "Admin Access Granted";
    } else {

      document.body.classList.remove('dev-active');
      toolbar.classList.add('hidden');

      localStorage.removeItem('tweed_admin_logged_in');

      toast.innerText = "Dev Mode Deactivated";

      setTimeout(() => location.reload(), 1000);
    }

    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
    render();

    if (navigator.vibrate) navigator.vibrate(200);
  };

  if (DEV_TRIGGER === 'longpress') {

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

  if (DEV_TRIGGER === 'swipe') {

    header.addEventListener('dragstart', (e) => {e.preventDefault();return false;});

    const handleStart = (x, y) => {isSwiping = true;startX = x;startY = y;};

    const handleEnd = (x, y) => {
      if (!isSwiping) return;
      isSwiping = false;

      const diffX = x - startX;
      const diffY = Math.abs(y - startY);

      if (diffX > 150 && diffY < 100) {
        activate();
      }
    };

    header.addEventListener('mousedown', (e) => {e.preventDefault();handleStart(e.clientX, e.clientY);});
    window.addEventListener('mouseup', (e) => {handleEnd(e.clientX, e.clientY);});

    header.addEventListener('touchstart', (e) => {handleStart(e.touches[0].clientX, e.touches[0].clientY);}, { passive: true });
    header.addEventListener('touchend', (e) => {handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);});
  }
}