import { supabase } from '../db.js';
import { showPosAlert, showPosConfirm } from './ui/posModals.js'; // Import Modals

let cart = [];

export async function initCheckout() {
    const container = document.getElementById('pos-content-area');
    // ... (Keep existing HTML layout) ...
    container.innerHTML = `
        <div style="display:flex; height:100%; flex-direction:column; padding:10px;">
             <!-- Keep Search Bar & Results Area -->
             <div style="display:flex; gap:10px; margin-bottom:10px;">
                <input type="text" id="pos-scan-input" placeholder="🔫 Scan or Search..." 
                    style="flex:1; padding:15px; font-size:1.2rem; border:2px solid #2e7d32; border-radius:6px;">
             </div>
             
             <div style="display:flex; flex:1; overflow:hidden; gap:20px;">
                <!-- Results -->
                <div id="search-results" style="flex:1; background:white; overflow-y:auto; border-radius:8px; padding:10px;"></div>
                
                <!-- Cart -->
                <div style="width:350px; background:white; display:flex; flex-direction:column; border-radius:8px; border:1px solid #ddd;">
                    <div style="padding:15px; background:#f4f4f4; font-weight:bold; border-bottom:1px solid #ddd;">Current Sale</div>
                    <div id="cart-items" style="flex:1; overflow-y:auto; padding:10px;"></div>
                    
                    <div style="padding:20px; background:#f9f9f9; border-top:1px solid #ddd;">
                        <div style="display:flex; justify-content:space-between; font-size:1.5rem; font-weight:bold; margin-bottom:15px;">
                            <span>Total</span><span id="cart-total">$0.00</span>
                        </div>
                        <button id="btn-pay-cash" class="pos-btn" style="width:100%; padding:15px; background:#2e7d32; color:white; font-size:1.2rem; margin-bottom:10px;">💵 Pay Cash</button>
                        <button id="btn-pay-card" class="pos-btn" style="width:100%; padding:15px; background:#2196f3; color:white; font-size:1.2rem;">💳 Pay Card</button>
                    </div>
                </div>
             </div>
        </div>
    `;

    // Bind Listeners
    const input = document.getElementById('pos-scan-input');
    input.addEventListener('input', (e) => handleSearch(e.target.value));
    input.focus();

    document.getElementById('btn-pay-cash').addEventListener('click', () => processPayment('cash'));
    document.getElementById('btn-pay-card').addEventListener('click', () => processPayment('card'));

    // GLOBAL HELPERS
    window.posAddToCart = (id, name, price) => {
        cart.push({ id, name, price });
        renderCart();
        input.value = '';
        document.getElementById('search-results').innerHTML = '';
        input.focus();
    };

    window.posRemoveFromCart = (idx) => {
        cart.splice(idx, 1);
        renderCart();
    };
}

// ... handleSearch and renderCart logic stays similar ...
async function handleSearch(val) {
    if(val.length < 2) return;
    const { data } = await supabase.from('tweed_trading_products')
        .select('*').or(`sku.ilike.%${val}%,name.ilike.%${val}%`).limit(10);
    
    const box = document.getElementById('search-results');
    box.innerHTML = (data || []).map(item => `
        <div onclick="window.posAddToCart('${item.id}', '${item.name}', ${item.price})" 
             style="padding:15px; border-bottom:1px solid #eee; cursor:pointer; display:flex; justify-content:space-between;">
            <div><strong>${item.name}</strong><div style="font-size:0.8rem; color:#666;">${item.sku} | Stock: ${item.stock_level}</div></div>
            <div style="font-weight:bold;">$${item.price}</div>
        </div>
    `).join('');
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    container.innerHTML = cart.map((item, idx) => {
        total += item.price;
        return `<div style="display:flex; justify-content:space-between; padding:5px 0;">
            <span>${item.name}</span>
            <span>$${item.price} <b style="color:red; cursor:pointer; margin-left:5px;" onclick="window.posRemoveFromCart(${idx})">×</b></span>
        </div>`;
    }).join('');
    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
}

async function processPayment(method) {
    if(cart.length === 0) return showPosAlert("Cart is empty!");
    
    const total = cart.reduce((sum, i) => sum + i.price, 0);

    // 1. CONFIRMATION (Using New Modal)
    const confirmed = await showPosConfirm(`Confirm ${method.toUpperCase()} payment of $${total.toFixed(2)}?`);
    if(!confirmed) return;

    // 2. CREATE SALE RECORD
    const { data: sale, error } = await supabase.from('tweed_trading_sales')
        .insert({ total_amount: total, payment_method: method }).select().single();
    
    if(error || !sale) return showPosAlert("Transaction Failed: " + error.message);

    // 3. ADD ITEMS & DECREMENT STOCK
    const itemsPayload = cart.map(c => ({
        sale_id: sale.id, product_id: c.id, quantity: 1, price_at_sale: c.price
    }));
    
    await supabase.from('tweed_trading_sale_items').insert(itemsPayload);

    // 4. DECREMENT STOCK (Using SQL Function)
    for (const item of cart) {
        // Calls the SQL function 'decrement_stock'
        await supabase.rpc('decrement_stock', { p_id: item.id, q: 1 });
    }

    await showPosAlert("✅ Sale Complete!");
    cart = [];
    renderCart();
}