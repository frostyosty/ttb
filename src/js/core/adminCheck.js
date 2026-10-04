// ./src/js/core/adminCheck.js 

import { state } from '../state.js';

export async function checkAdminAutoLogin() {

  if (localStorage.getItem('tweed_admin_logged_in') === 'true') {
    console.log("🔑 Admin Cookie Found. Launching POS...");

    const toolbar = document.getElementById('dev-toolbar');
    if (toolbar) toolbar.classList.remove('hidden');

    state.isDevMode = true;
    document.body.classList.add('dev-active');

    const module = await import('../pos/posMain.js');
    module.initPOS();

    return true;
  }
  return false;
}