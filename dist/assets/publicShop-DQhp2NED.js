import{s as g}from"./index-BqexESaP.js";let u={};async function v(){var o;const i=document.getElementById("app-container");i.innerHTML=`
        <div style="display:flex; justify-content:center; align-items:center; height:300px; color:#666; font-size:1.2rem; flex-direction:column; gap:15px;">
            <div class="spinner"></div> 
            <div>Loading Stock...</div>
        </div>
        <style>.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2e7d32; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;const[s,t,p]=await Promise.all([g.from("tweed_trading_config").select("value").eq("key","public_store_settings").single(),g.from("tweed_trading_categories").select("*").order("name"),g.from("tweed_trading_products").select("*").gt("stock_level",0).order("created_at",{ascending:!1})]),a=((o=s.data)==null?void 0:o.value)||{enabled:!1,hidden_categories:[]};if(!a.enabled){i.innerHTML=`
            <div style="text-align:center; padding:100px 20px;">
                <h2 style="color:#666;">Store currently offline.</h2>
                <p>Please check back later or visit us in person.</p>
                <button onclick="location.reload()" style="padding:10px 20px; margin-top:20px; cursor:pointer;">Back Home</button>
            </div>`;return}const r=t.data||[];r.forEach(e=>u[e.id]=e.name);const d=r.filter(e=>!a.hidden_categories.includes(e.id.toString())).map(e=>e.id),c=(p.data||[]).filter(e=>!e.category_id||d.includes(e.category_id));f(i,c,r.filter(e=>d.includes(e.id)))}function f(i,s,t){const p=`
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
    `;i.innerHTML=p+`
        <div class="shop-wrapper">
            <div class="shop-header">
                <h2 style="margin:0;">🛍️ Shop Stock</h2>
                <div class="shop-controls">
                    <input type="text" id="shop-search" class="shop-input" placeholder="Search items..." />
                    <select id="shop-filter" class="shop-input" style="flex:0 0 150px;">
                        <option value="all">All Categories</option>
                        ${t.map(o=>`<option value="${o.id}">${o.name}</option>`).join("")}
                    </select>
                </div>
            </div>

            <div id="shop-grid" class="shop-grid">
                <!-- Products go here -->
            </div>
        </div>
    `;const a=document.getElementById("shop-grid"),r=document.getElementById("shop-search"),d=document.getElementById("shop-filter"),c=()=>{const o=r.value.toLowerCase(),e=d.value,l=s.filter(n=>{const m=n.name.toLowerCase().includes(o)||n.sku&&n.sku.toLowerCase().includes(o),x=e==="all"||n.category_id==e;return m&&x});h(a,l)};r.addEventListener("input",c),d.addEventListener("change",c),h(a,s),window.shopEnquire=(o,e)=>{const l=document.getElementById("email-modal");if(l){l.classList.remove("hidden");const n=l.querySelector('textarea[name="message"]');n&&(n.value=`Hi, I am interested in: 
${o} 
(SKU: ${e})

Is this still available?`)}else alert("Please use the Contact page to enquire about "+e)}}function h(i,s){if(s.length===0){i.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#999;">No items found.</div>';return}i.innerHTML=s.map(t=>`
        <div class="shop-card">
            <img class="shop-img" src="${t.image_url||"/assets/icon.svg"}" alt="${t.name}" loading="lazy" 
                 onerror="this.src='/assets/icon.svg'; this.style.opacity='0.3';">

            <div class="shop-body">
                <span class="shop-cat-tag">${u[t.category_id]||"General"}</span>
                <h3 class="shop-title">${t.name}</h3>
                <div class="shop-sku">SKU: ${t.sku}</div>
                <div class="shop-price">$${t.price.toFixed(2)}</div>

                <button class="shop-btn" onclick="window.shopEnquire('${t.name.replace(/'/g,"\\'")}', '${t.sku}')">
                    Enquire / Buy
                </button>
            </div>
        </div>
    `).join("")}export{v as initPublicShop};
