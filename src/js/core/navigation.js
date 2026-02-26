// ./src/js/core/navigation.js 

import { supabase } from '../db.js';
import { state, setPage } from '../state.js';
import { render } from '../renderer.js';
import { attachEmailListeners } from '../email.js';
import { initCarousel } from '../carousel.js';

export async function setupNavigation() {
  const navContainer = document.querySelector('.main-nav');
  if (!navContainer) return;

  const pages = new Set(['home', 'products', 'contact', 'about']);
  state.items.forEach((i) => {if (i.page) pages.add(i.page);});

  let shopEnabled = false;
  try {
    const { data } = await supabase.from('tweed_trading_config').
    select('value').
    eq('key', 'public_store_settings').
    single();
    if (data && data.value && data.value.enabled) {
      shopEnabled = true;
    }
  } catch (e) {

    console.warn("Nav Config check skipped:", e.message);
  }

  navContainer.innerHTML = '';

  pages.forEach((pageName) => {
    createNavBtn(pageName, navContainer);
  });

  if (shopEnabled) {
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.innerText = '🛍️ Shop Stock';
    btn.setAttribute('data-page', 'shop');
    btn.addEventListener('click', () => {

      import('../shop/publicShop.js').then((m) => m.initPublicShop());
      document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    navContainer.appendChild(btn);
  }
}

function createNavBtn(pageName, container) {
  const btn = document.createElement('button');
  btn.className = 'nav-btn';

  if (pageName === (state.currentPage || 'home')) btn.classList.add('active');

  btn.setAttribute('data-page', pageName);

  btn.innerText = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    setPage(pageName);
    render();
    attachEmailListeners();
    initCarousel();
  });
  container.appendChild(btn);
}