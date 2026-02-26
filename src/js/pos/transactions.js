// ./src/js/pos/transactions.js 

import { supabase } from '../db.js';

export async function initTransactions() {
  const container = document.getElementById('pos-content-area');
  container.innerHTML = 'Loading History...';

  const { data: sales } = await supabase.
  from('tweed_trading_sales').
  select(`*, items:tweed_trading_sale_items(count)`).
  order('created_at', { ascending: false }).
  limit(50);

  container.innerHTML = `
        <div style="padding:20px;">
            <h2>📜 Transaction History</h2>
            <div style="background:white; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <table style="width:100%; border-collapse:collapse;">
                    <thead style="background:#f4f4f4;">
                        <tr style="text-align:left;">
                            <th style="padding:15px;">Date</th>
                            <th style="padding:15px;">ID</th>
                            <th style="padding:15px;">Method</th>
                            <th style="padding:15px;">Items</th>
                            <th style="padding:15px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map((s) => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:15px;">${new Date(s.created_at).toLocaleString()}</td>
                                <td style="padding:15px; font-family:monospace;">#${s.id}</td>
                                <td style="padding:15px; text-transform:capitalize;">${s.payment_method}</td>
                                <td style="padding:15px;">${s.items ? s.items.length : 1}</td>
                                <td style="padding:15px; font-weight:bold;">$${s.total_amount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}