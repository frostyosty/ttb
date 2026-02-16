import { supabase } from '../db.js';

export async function initCustomerFacing() {
    const container = document.getElementById('pos-content-area');
    container.innerHTML = '<div style="padding:20px;">Loading Settings...</div>';

    // 1. Fetch Config & Categories
    const [configRes, catRes] = await Promise.all([
        supabase.from('tweed_trading_config').select('*').eq('key', 'public_store_settings').single(),
        supabase.from('tweed_trading_categories').select('*').order('name')
    ]);

    const settings = configRes.data?.value || { enabled: false, hidden_categories: [] };
    const categories = catRes.data || [];

    // 2. Render UI
    container.innerHTML = `
        <div style="max-width:800px; margin:0 auto; padding:20px;">
            <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); margin-bottom:20px;">
                <h2 style="margin-top:0; color:#2e7d32;">🛍️ Customer Facing Inventory</h2>
                <p style="color:#666;">Control what visitors see on the public website.</p>
                
                <div style="display:flex; align-items:center; gap:15px; margin:20px 0; padding:15px; background:#f4f4f4; border-radius:6px;">
                    <label class="switch">
                        <input type="checkbox" id="public-toggle" ${settings.enabled ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                    <div>
                        <strong>Enable Public Inventory Page</strong><br>
                        <span style="font-size:0.9rem; color:#555;">When on, a "Shop Stock" tab appears on the main website.</span>
                    </div>
                </div>
            </div>

            <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <h3>Category Visibility</h3>
                <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">Check categories you want to <strong>HIDE</strong> from the public (e.g. 'Unsorted').</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                    ${categories.map(cat => `
                        <label style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid #eee; border-radius:4px; cursor:pointer;">
                            <input type="checkbox" class="cat-hide-check" value="${cat.id}" 
                                ${settings.hidden_categories.includes(cat.id.toString()) ? 'checked' : ''}>
                            ${cat.name}
                        </label>
                    `).join('')}
                </div>

                <div style="margin-top:20px; text-align:right;">
                    <button id="btn-save-settings" class="pos-btn" style="background:#2e7d32; color:white; padding:12px 25px;">
                        💾 Save Configuration
                    </button>
                </div>
            </div>
        </div>
        
        <!-- CSS for Toggle Switch -->
        <style>
            .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
            .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: #2e7d32; }
            input:checked + .slider:before { transform: translateX(24px); }
        </style>
    `;

    // 3. Save Logic
    document.getElementById('btn-save-settings').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const isEnabled = document.getElementById('public-toggle').checked;
        const hiddenCats = Array.from(document.querySelectorAll('.cat-hide-check:checked')).map(cb => cb.value);

        const newSettings = { enabled: isEnabled, hidden_categories: hiddenCats };

        const { error } = await supabase.from('tweed_trading_config')
            .upsert({ key: 'public_store_settings', value: newSettings });

        if (error) {
            alert("Error saving: " + error.message);
        } else {
            alert("Settings Saved!");
        }
        btn.innerText = "💾 Save Configuration";
        btn.disabled = false;
    });
}