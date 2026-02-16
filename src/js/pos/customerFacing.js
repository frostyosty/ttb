import { supabase } from '../db.js';

export async function initCustomerFacing() {
    const container = document.getElementById('pos-content-area');
    container.innerHTML = '<div style="padding:20px;">Loading Settings...</div>';

    // 1. Fetch
    const [configRes, catRes] = await Promise.all([
        supabase.from('tweed_trading_config').select('*').eq('key', 'public_store_settings').single(),
        supabase.from('tweed_trading_categories').select('*').order('name')
    ]);

    const settings = configRes.data?.value || { enabled: false, hidden_categories: [] };
    const categories = catRes.data || [];

    // 2. Render UI (No Save Button)
    container.innerHTML = `
        <div style="max-width:800px; margin:0 auto; padding:20px;">
            <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); margin-bottom:20px;">
                <h2 style="margin-top:0; color:#2e7d32;">🛍️ Public Store Settings</h2>
                
                <div style="display:flex; align-items:center; gap:15px; margin-top:20px; padding:15px; background:#e8f5e9; border-radius:6px; border:1px solid #c8e6c9;">
                    <label class="switch">
                        <input type="checkbox" id="public-toggle" ${settings.enabled ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                    <div>
                        <strong>Public Inventory Page</strong><br>
                        <span style="font-size:0.9rem; color:#555;">Toggle to show/hide the "Shop" tab on the main website.</span>
                    </div>
                    <div id="save-status" style="margin-left:auto; font-size:0.8rem; color:#2e7d32; font-weight:bold; opacity:0; transition:opacity 0.5s;">Saved!</div>
                </div>
            </div>

            <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <h3>Category Visibility</h3>
                <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">Uncheck categories to <strong>HIDE</strong> them from the public.</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                    ${categories.map(cat => `
                        <label style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid #eee; border-radius:4px; cursor:pointer;">
                            <input type="checkbox" class="cat-visible-check" value="${cat.id}" 
                                ${!settings.hidden_categories.includes(cat.id.toString()) ? 'checked' : ''}>
                            ${cat.name}
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
        <style>
            .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
            .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: #2e7d32; }
            input:checked + .slider:before { transform: translateX(24px); }
        </style>
    `;

    // 3. Logic (Optimistic Updates)
    const toggle = document.getElementById('public-toggle');
    const checkboxes = document.querySelectorAll('.cat-visible-check');
    const status = document.getElementById('save-status');

    async function saveSettings() {
        // Gather State
        const isEnabled = toggle.checked;
        // Logic inversion: UI shows "Visible", logic saves "Hidden"
        const hiddenCats = Array.from(checkboxes)
            .filter(cb => !cb.checked) // If NOT checked, it is hidden
            .map(cb => cb.value);

        // Save
        const { error } = await supabase.from('tweed_trading_config')
            .upsert({ key: 'public_store_settings', value: { enabled: isEnabled, hidden_categories: hiddenCats } });

        if (!error) {
            status.style.opacity = '1';
            setTimeout(() => status.style.opacity = '0', 2000);
        }
    }

    // Bind Listeners
    toggle.addEventListener('change', saveSettings);
    checkboxes.forEach(cb => cb.addEventListener('change', saveSettings));
}