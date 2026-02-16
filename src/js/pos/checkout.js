import { supabase } from '../db.js';

let cart = [];

export async function initCheckout() {
    const container = document.getElementById('pos-content-area');
    container.innerHTML = `
        <div style="display:flex; height:100%;">
            
            <!-- LEFT: Item Search -->
            <div style="flex:1; padding:20px; border-right:1px solid #ddd; display:flex; flex-direction:column;">
                <input type="text" id="pos-scan-input" placeholder="🔫 Scan Barcode or Search..." autofocus
                    style="padding:15px; font-size:1.2rem; border:2px solid #2e7d32; border-radius:6px; margin-bottom:20px;">
                
                <div id="search-results" style="flex:1; overflow-y:auto;">
                    <div style="text-align:center; color:#999; margin-top:50px;">Scan item or type to search</div>
                </div>
            </div>

            <!-- RIGHT: Cart -->
            <div style="width:350px; background:white; display:flex; flex-direction:column;">
                <div style="padding:15px; background:#f4f4f4; font-weight:bold; border-bottom:1px solid #ddd;">
                    Current Sale
                </div>
                
                <div id="cart-items" style="flex:1; overflow-y:auto; padding:10px;">
                    <!-- Items go here -->
                </div>

                <div style="padding:20px; background:#f9f9f9; border-top:1px solid #ddd;">
                    <div style="display:flex; justify-content:space-between; font-size:1.5rem; font-weight:bold; margin-bottom:15px;">
                        <span>Total</span>
                        <span id="cart-total">$0.00</span>
                    </div>
                    
                    <button id="btn-pay-cash" class="submit-btn" style="width:100%; padding:15px; background:#2e7d32; color:white; border:none; border-radius:4px; font-size:1.2rem; cursor:pointer;">
                        💵 Pay Cash
                    </button>
                    <button id="btn-pay-card" class="submit-btn" style="width:100%; padding:15px; background:#2196f3; color:white; border:none; border-radius:4px; font-size:1.2rem; margin-top:10px; cursor:pointer;">
                        💳 Pay Card
                    </button>
                </div>
            </div>
        </div>
    `;

    // 1. Search Logic
    const input = document.getElementById('pos-scan-input');
    input.addEventListener('input', async (e) => {
        const val = e.target.value.trim();
        if(val.length < 2) return;

        const { data } = await supabase.from('tweed_trading_products')
            .select('*')
            .or(`sku.eq.${val},name.ilike.%${val}%`)
            .limit(10);
            
        renderSearchResults(data);
    });

    // 2. Checkout Logic
    document.getElementById('btn-pay-cash').addEventListener('click', () => processPayment('cash'));
    document.getElementById('btn-pay-card').addEventListener('click', () => processPayment('card'));
}

function renderSearchResults(items) {
    const box = document.getElementById('search-results');
    if(!items || items.length === 0) {
        box.innerHTML = '<div style="padding:10px; text-align:center;">No items found</div>';
        return;
    }

    box.innerHTML = items.map(item => `
        <div class="pos-btn" onclick="window.posAddToCart('${item.id}', '${item.name}', ${item.price})" 
             style="display:flex; justify-content:space-between; padding:15px; margin-bottom:5px; border:1px solid #eee;">
            <div>
                <strong>${item.name}</strong><br>
                <span style="font-size:0.8rem; color:#666;">${item.sku}</span>
            </div>
            <div style="font-weight:bold; color:#2e7d32;">$${item.price}</div>
        </div>
    `).join('');

    // Helper attached to window
    window.posAddToCart = (id, name, price) => {
        cart.push({ id, name, price });
        renderCart();
        document.getElementById('pos-scan-input').value = ''; // Clear search
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('pos-scan-input').focus();
    };
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    
    container.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
        <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px dashed #ccc;">
            <span>${item.name}</span>
            <div style="display:flex; gap:10px;">
                <strong>$${item.price}</strong>
                <span onclick="window.posRemoveFromCart(${index})" style="color:red; cursor:pointer;">×</span>
            </div>
        </div>`;
    }).join('');

    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;

    window.posRemoveFromCart = (idx) => {
        cart.splice(idx, 1);
        renderCart();
    };
}

async function processPayment(method) {
    if(cart.length === 0) return alert("Cart is empty!");
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    if(confirm(`Confirm ${method.toUpperCase()} payment of $${total.toFixed(2)}?`)) {
        // 1. Record Sale Header
        const { data: sale } = await supabase.from('tweed_trading_sales')
            .insert({ total_amount: total, payment_method: method })
            .select().single();

        if(sale) {
            // 2. Record Sale Items
            const items = cart.map(c => ({
                sale_id: sale.id,
                product_id: c.id,
                quantity: 1, // Simple 1qty for now
                price_at_sale: c.price
            }));
            
            await supabase.from('tweed_trading_sale_items').insert(items);

            // 3. Update Stock (Simple -1)
            for(let c of cart) {
                // This usually requires an RPC function for atomicity, but client-side logic for now:
                // We'll skip decrementing for this prototype to prevent complexity
            }
            
            alert("Sale Recorded!");
            cart = [];
            renderCart();
        }
    }
}