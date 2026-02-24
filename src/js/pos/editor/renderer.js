import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

// Define Paper Sizes (Width in Pixels @ ~96DPI, 1mm = 3.78px)
const SIZES = {
    '62mm': { width: '220px', printable: '210px' }, // 58mm safe area
    '38mm': { width: '143px', printable: '135px' },
    '54mm': { width: '204px', printable: '195px' },
    '102mm': { width: '385px', printable: '375px' }
};

export async function renderLabel(container, config, data = {}, isEditing = false, paperSize = '62mm') {
    container.innerHTML = '';
    
    // 1. Apply Paper Size
    const sizeConfig = SIZES[paperSize] || SIZES['62mm'];
    
    Object.assign(container.style, {
        position: 'relative',
        width: sizeConfig.width,
        minHeight: '200px', // Allow it to grow
        height: isEditing ? '300px' : 'auto', // Fixed height for edit, auto for print
        backgroundColor: 'white',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        backgroundImage: isEditing ? 
            'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)' : 'none',
        backgroundSize: '10px 10px'
    });

    for (const item of config) {
        const el = document.createElement('div');
        el.dataset.id = item.id;
        el.className = 'label-element';

        // Base CSS
        Object.assign(el.style, {
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: item.width ? `${item.width}px` : 'auto',
            height: item.height ? `${item.height}px` : 'auto',
            zIndex: 10,
            cursor: isEditing ? 'move' : 'default',
            border: isEditing ? '1px dashed #ccc' : 'none',
            // 🛑 BARCODE FIX: Prevent overflowing the label width
            maxWidth: '100%', 
            whiteSpace: 'nowrap'
        });

        // Content Rendering
        if (item.type === 'text') {
            // ... (Keep existing text logic) ...
            el.innerHTML = item.html || 'Text';
            if(!isEditing) {
               if(item.id === 'title') el.innerHTML = data.name || item.html;
               if(item.id === 'price') el.innerHTML = `$${data.price}` || item.html;
               if(item.id === 'sku') el.innerHTML = data.sku || item.html;
            }
            el.style.fontSize = `${item.fontSize || 12}px`;
            el.style.fontFamily = item.fontFamily || 'Arial';
            el.style.color = item.color || 'black';
        } 


        else if (item.type === 'image') {
            // Priority: 1. Live Preview Blob (data.image_url) -> 2. Saved URL (item.src) -> 3. Placeholder
            const src = data.image_url || item.src;

            if (src) {
                const img = document.createElement('img');
                img.src = src;
                Object.assign(img.style, {
                    width: '100%', height: '100%',
                    objectFit: 'contain', display: 'block'
                });
                el.appendChild(img);
            } else {
                // Render Placeholder
                Object.assign(el.style, {
                    backgroundColor: '#eee',
                    border: '1px dashed #999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#666', fontSize: '10px', flexDirection: 'column'
                });
                el.innerHTML = '<span style="font-size:20px;">🖼️</span><span>Photo Area</span>';
            }
        }
        else if (item.type === 'barcode') {
            const canvas = document.createElement('canvas');
            // 🛑 BARCODE SCALING CSS
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            canvas.style.display = 'block';

            try {
                JsBarcode(canvas, data.sku || '123456', {
                    format: "CODE128", 
                    displayValue: false, 
                    margin: 0,
                    height: item.height || 40, 
                    width: 2 // Keep bars thick enough to scan
                });
                el.appendChild(canvas);
            } catch(e) {}
        }
        else if (item.type === 'qr') {
            // ... (Keep existing QR logic) ...
            const img = document.createElement('img');
            const url = `https://www.tweedtrading.co.nz/?s=${data.sku}`;
            img.src = await QRCode.toDataURL(url, { margin: 0 });
            img.style.width = '100%';
            img.style.height = 'auto'; // Fix aspect ratio
            el.appendChild(img);
        }

        container.appendChild(el);
    }
}