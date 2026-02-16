import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export async function renderLabel(container, config, data = {}, isEditing = false) {
    container.innerHTML = '';
    
    // 62mm Tape Simulation
    Object.assign(container.style, {
        position: 'relative',
        width: '220px', // ~58mm
        height: '300px',
        backgroundColor: 'white',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        // Grid Pattern
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
            border: isEditing ? '1px dashed transparent' : 'none',
            boxSizing: 'border-box'
        });

        // Content
        if (item.type === 'text') {
            // Replaces placeholders like {{price}} with actual data
            let content = item.html || '';
            if (!isEditing) {
                // Simple merge for printing
                if(item.id === 'title') content = data.name || content;
                if(item.id === 'price') content = `$${data.price}` || content;
                if(item.id === 'sku') content = data.sku || content;
            }
            
            el.innerHTML = content;
            el.style.fontSize = `${item.fontSize || 12}px`;
            el.style.fontFamily = item.fontFamily || 'Arial';
            el.style.color = item.color || 'black'; // Support Red/Black
            el.style.overflow = 'hidden';
            
            // Rich Text Editing Mode
            if (isEditing) {
                el.contentEditable = "false"; // Default to drag mode
                el.style.userSelect = "none"; 
            }
        } 
        else if (item.type === 'barcode') {
            const canvas = document.createElement('canvas');
            try {
                JsBarcode(canvas, data.sku || '123456', {
                    format: "CODE128", displayValue: false, margin:0,
                    height: item.height || 40, width: 2
                });
                el.appendChild(canvas);
            } catch(e) {}
        }
        else if (item.type === 'qr') {
            const img = document.createElement('img');
            const url = `https://www.tweedtrading.co.nz/?s=${data.sku}`;
            img.src = await QRCode.toDataURL(url, { margin: 0 });
            img.style.width = '100%';
            img.style.height = '100%';
            el.appendChild(img);
        }

        container.appendChild(el);
    }
}