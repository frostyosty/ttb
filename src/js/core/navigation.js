import { supabase } from '../db.js';
import { state, setPage } from '../state.js';
import { render } from '../renderer.js';
import { attachEmailListeners } from '../email.js';
import { initCarousel } from '../carousel.js';

export async function setupNavigation() {
    const navContainer = document.querySelector('.main-nav');
    if(!navContainer) return;
    
    // 1. Gather all unique pages (Standard + CMS created ones)
    const pages = new Set(['home', 'products', 'contact', 'about']);
    state.items.forEach(i => { if(i.page) pages.add(i.page); });
    
    // 2. Check for Public Store Setting in DB
    let shopEnabled = false;
    try {
        const { data } = await supabase.from('tweed_trading_config')
            .select('value')
            .eq('key', 'public_store_settings')
            .single();
        if (data && data.value && data.value.enabled) {
            shopEnabled = true;
        }
    } catch(e) { 
        // Silent fail if offline or table missing
        console.warn("Nav Config check skipped:", e.message); 
    }

    // 3. Render Buttons
    navContainer.innerHTML = '';

    // Render Standard & CMS Pages
    pages.forEach(pageName => {
        createNavBtn(pageName, navContainer);
    });

    // Render Shop Button (If enabled in POS settings)
    if (shopEnabled) {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.innerText = '🛍️ Shop Stock';
        btn.setAttribute('data-page', 'shop');
        btn.addEventListener('click', () => {
             import('../shop/publicShop.js').then(m => m.initPublicShop());
             document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
             btn.classList.add('active');
        });
        navContainer.appendChild(btn);
    }
}

function createNavBtn(pageName, container) {
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    
    // Set active class if current page
    if(pageName === (state.currentPage || 'home')) btn.classList.add('active');
    
    btn.setAttribute('data-page', pageName);
    // Capitalize first letter
    btn.innerText = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        setPage(pageName);
        render();
        attachEmailListeners();
        initCarousel();
    });
    container.appendChild(btn);
}