// ./src/js/pos/reports.js 

import { supabase } from '../db.js';

export async function initReports() {
  const container = document.getElementById('pos-content-area');
  container.innerHTML = 'Calculating Financials...';

  const { data: sales } = await supabase.from('tweed_trading_sales').select('*');

  let totalRevenue = 0;
  let cashTotal = 0;
  let cardTotal = 0;
  let todayTotal = 0;

  const today = new Date().toDateString();

  sales.forEach((s) => {
    totalRevenue += s.total_amount;
    if (s.payment_method === 'cash') cashTotal += s.total_amount;
    if (s.payment_method === 'card') cardTotal += s.total_amount;

    if (new Date(s.created_at).toDateString() === today) {
      todayTotal += s.total_amount;
    }
  });

  container.innerHTML = `
        <div style="padding:20px;">
            <h2>📈 Financial Performance</h2>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:30px;">
                ${card("Total Revenue", totalRevenue, "#2e7d32")}
                ${card("Today's Sales", todayTotal, "#ff9800")}
                ${card("Cash Taken", cashTotal, "#757575")}
                ${card("Card / EFTPOS", cardTotal, "#2196f3")}
            </div>

            <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <h3>Export Data</h3>
                <p>Download CSV for accounting.</p>
                <button class="pos-btn" style="background:#333; color:white;" onclick="alert('CSV Export Coming Soon')">📥 Download Report</button>
            </div>
        </div>
    `;
}

function card(title, value, color) {
  return `
        <div style="background:white; padding:20px; border-radius:8px; border-left:5px solid ${color}; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <div style="color:#666; font-size:0.9rem;">${title}</div>
            <div style="font-size:1.8rem; font-weight:bold;">$${value.toFixed(2)}</div>
        </div>
    `;
}