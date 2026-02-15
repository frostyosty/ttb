import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { TEMPLATES } from './labelTemplates.js';

export async function printLabel(product, templateName = 'standard') {
    
    // 1. Generate Barcode Image (Base64)
    const canvasBar = document.createElement('canvas');
    JsBarcode(canvasBar, product.sku, { format: "CODE128", displayValue: false });
    const barcodeUrl = canvasBar.toDataURL("image/png");

    // 2. Generate QR Code Image (Base64)
    // We make the QR code link to the product on your website!
    const productLink = `https://www.tweedtrading.co.nz/?sku=${product.sku}`;
    const qrUrl = await QRCode.toDataURL(productLink);

    // 3. Prepare Data
    const labelData = {
        name: product.name,
        price: product.price,
        sku: product.sku,
        barcodeUrl: barcodeUrl,
        qrUrl: qrUrl,
        productImg: product.image_url // From Supabase
    };

    // 4. Get HTML from Template Engine
    const templateFn = TEMPLATES[templateName] || TEMPLATES['standard'];
    const contentHtml = templateFn(labelData);

    // 5. Open Print Window (Sized for Brother QL-1110NWB 62mm Tape)
    const win = window.open('', '', 'width=400,height=600');
    
    win.document.write(`
        <html>
        <head>
            <style>
                /* BROTHER PRINTER SETUP */
                @page { 
                    size: 62mm 100mm; /* 62mm Width, Auto Height */
                    margin: 0; 
                }
                body { 
                    margin: 0; 
                    padding: 2mm; 
                    font-family: Arial, sans-serif; 
                    width: 58mm; /* Keep content inside the tape */
                }
                img { display:block; margin:0 auto; }
            </style>
        </head>
        <body>
            ${contentHtml}
            <script>
                // Auto-Print and Close
                window.onload = () => {
                    window.print();
                    setTimeout(() => window.close(), 500);
                };
            </script>
        </body>
        </html>
    `);
    win.document.close();
}