// ./src/js/shop/publicShop.js 

import { supabase } from '../db.js';

let categoryMap = {};

export async function initPublicShop() {
  const app = document.getElementById('app-container');

  app.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:300px; color:#666; font-size:1.2rem; flex-direction:column; gap:15px;">
            <div class="spinner"></div> 
            <div>Loading Stock...</div>
        </div>
        <style>.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2e7d32; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;

  const [configRes, catRes, prodRes] = await Promise.all([
  supabase.from('tweed_trading_config').select('value').eq('key', 'public_store_settings').single(),
  supabase.from('tweed_trading_categories').select('*').order('name'),
  supabase.from('tweed_trading_products').select('*').gt('stock_level', 0).order('created_at', { ascending: false })]
  );

  const settings = configRes.data?.value || { enabled: false, hidden_categories: [] };

  if (!settings.enabled) {
    app.innerHTML = `
            <div style="text-align:center; padding:100px 20px;">
                <h2 style="color:#666;">Store currently offline.</h2>
                <p>Please check back later or visit us in person.</p>
                <button onclick="location.reload()" style="padding:10px 20px; margin-top:20px; cursor:pointer;">Back Home</button>
            </div>`;
    return;
  }

  const allCats = catRes.data || [];

  allCats.forEach((c) => categoryMap[c.id] = c.name);

  const visibleCatIds = allCats.
  filter((c) => !settings.hidden_categories.includes(c.id.toString())).
  map((c) => c.id);

  const products = (prodRes.data || []).filter((p) => {

    return !p.category_id || visibleCatIds.includes(p.category_id);
  });

  renderShopUI(app, products, allCats.filter((c) => visibleCatIds.includes(c.id)));
}

function renderShopUI(container, products, categories) {

  const styles = `
        <style>
            .shop-header { background: #f9f9f9; padding: 20px; border-bottom: 1px solid #eee; display:flex; flex-wrap:wrap; gap:15px; align-items:center; justify-content:space-between; }
            .shop-controls { display:flex; gap:10px; flex:1; max-width:600px; }
            .shop-input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; flex: 1; }
            .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; padding: 20px; max-width: 1200px; margin: 0 auto; }
            .shop-card { background: white; border: 1px solid #eee; border-radius: 8px; overflow: hidden; transition: transform 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display:flex; flex-direction:column; }
            .shop-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .shop-img { width: 100%; height: 200px; object-fit: cover; background: #eee; }
            .shop-body { padding: 15px; flex:1; display:flex; flex-direction:column; }
            .shop-cat-tag { font-size: 0.75rem; color: #2e7d32; background: #e8f5e9; padding: 2px 6px; border-radius: 4px; align-self: flex-start; margin-bottom: 5px; }
            .shop-title { margin: 0 0 5px 0; font-size: 1.1rem; color: #333; }
            .shop-price { font-size: 1.25rem; font-weight: bold; color: #333; margin-top: auto; }
            .shop-btn { background: #2e7d32; color: white; border: none; padding: 10px; border-radius: 4px; margin-top: 10px; cursor: pointer; width: 100%; font-weight: bold; }
            .shop-btn:hover { background: #1b5e20; }
            .shop-sku { font-size: 0.8rem; color: #999; margin-bottom: 10px; }
        </style>
    `;

  container.innerHTML = styles + `
        <div class="shop-wrapper">
            <div class="shop-header">
                <h2 style="margin:0;">🛍️ Shop Stock</h2>
                <div class="shop-controls">
                    <input type="text" id="shop-search" class="shop-input" placeholder="Search items..." />
                    <select id="shop-filter" class="shop-input" style="flex:0 0 150px;">
                        <option value="all">All Categories</option>
                        ${categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div id="shop-grid" class="shop-grid">
                <!-- Products go here -->
            </div>
        </div>
    `;

  const grid = document.getElementById('shop-grid');
  const searchInput = document.getElementById('shop-search');
  const filterSelect = document.getElementById('shop-filter');

  const updateGrid = () => {
    const term = searchInput.value.toLowerCase();
    const catId = filterSelect.value;

    const filtered = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(term) || p.sku && p.sku.toLowerCase().includes(term);
      const matchesCat = catId === 'all' || p.category_id == catId;
      return matchesSearch && matchesCat;
    });

    renderGridItems(grid, filtered);
  };

  searchInput.addEventListener('input', updateGrid);
  filterSelect.addEventListener('change', updateGrid);

  renderGridItems(grid, products);

  window.shopEnquire = (name, sku) => {
    const modal = document.getElementById('email-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const textarea = modal.querySelector('textarea[name="message"]');
      if (textarea) {
        textarea.value = `Hi, I am interested in: \n${name} \n(SKU: ${sku})\n\nIs this still available?`;
      }
    } else {
      alert("Please use the Contact page to enquire about " + sku);
    }
  };
}

function renderGridItems(container, items) {
  if (items.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#999;">No items found.</div>`;
    return;
  }

  container.innerHTML = items.map((p) => `
        <div class="shop-card">
            <img class="shop-img" src="${p.image_url || '/assets/icon.svg'}" alt="${p.name}" loading="lazy" 
                 onerror="this.src='/assets/icon.svg'; this.style.opacity='0.3';">

            <div class="shop-body">
                <span class="shop-cat-tag">${categoryMap[p.category_id] || 'General'}</span>
                <h3 class="shop-title">${p.name}</h3>
                <div class="shop-sku">SKU: ${p.sku}</div>
                <div class="shop-price">$${p.price.toFixed(2)}</div>

                <button class="shop-btn" onclick="window.shopEnquire('${p.name.replace(/'/g, "\\'")}', '${p.sku}')">
                    Enquire / Buy
                </button>
            </div>
        </div>
    `).join('');
}