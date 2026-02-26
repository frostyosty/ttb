// ./src/js/pos/labelTemplates.js 


export const TEMPLATES = {

  'standard': (data) => `
        <div style="text-align:center; padding:5px;">
            <h2 style="margin:0; font-size:14pt; overflow:hidden; white-space:nowrap;">${data.name}</h2>
            <h1 style="margin:5px 0; font-size:24pt; font-weight:bold;">$${data.price}</h1>
            <img src="${data.barcodeUrl}" style="width:90%; height:auto;" />
            <div style="font-size:10px;">${data.sku}</div>
        </div>
    `,

  'smart_qr': (data) => `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:5px; align-items:center; height:100%;">
            <img src="${data.qrUrl}" style="width:100%;" />
            <div style="text-align:left;">
                <h3 style="margin:0; font-size:12pt;">${data.name.substring(0, 15)}</h3>
                <h2 style="margin:5px 0; font-size:20pt;">$${data.price}</h2>
                <div style="font-size:9px;">${data.sku}</div>
            </div>
        </div>
    `,

  'visual': (data) => `
        <div style="text-align:center;">
            ${data.productImg ? `<img src="${data.productImg}" style="height:30mm; width:auto; object-fit:contain;" />` : ''}
            <h3 style="margin:5px 0;">$${data.price}</h3>
            <img src="${data.barcodeUrl}" style="width:80%; height:15mm;" />
        </div>
    `
};