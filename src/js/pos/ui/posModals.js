export function showPosAlert(message) {
    return new Promise((resolve) => {
        const modal = createModalBase(message);
        
        const btn = document.createElement('button');
        btn.innerText = "OK";
        btn.className = "pos-btn";
        btn.style.background = "#2e7d32";
        btn.style.color = "white";
        btn.style.marginTop = "15px";
        btn.style.width = "100%";
        
        btn.onclick = () => {
            document.body.removeChild(modal);
            resolve();
        };
        
        modal.querySelector('.pos-modal-content').appendChild(btn);
        document.body.appendChild(modal);
        btn.focus();
    });
}

export function showPosConfirm(message) {
    return new Promise((resolve) => {
        const modal = createModalBase(message);
        
        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '10px';
        btnGroup.style.marginTop = '15px';

        const cancel = document.createElement('button');
        cancel.innerText = "Cancel";
        cancel.className = "pos-btn";
        cancel.style.flex = "1";
        cancel.onclick = () => {
            document.body.removeChild(modal);
            resolve(false);
        };

        const confirm = document.createElement('button');
        confirm.innerText = "Confirm";
        confirm.className = "pos-btn";
        confirm.style.flex = "1";
        confirm.style.background = "#2196f3";
        confirm.style.color = "white";
        confirm.onclick = () => {
            document.body.removeChild(modal);
            resolve(true);
        };

        btnGroup.appendChild(cancel);
        btnGroup.appendChild(confirm);
        modal.querySelector('.pos-modal-content').appendChild(btnGroup);
        document.body.appendChild(modal);
        confirm.focus();
    });
}

function createModalBase(msg) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)', zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    });

    const box = document.createElement('div');
    box.className = 'pos-modal-content';
    Object.assign(box.style, {
        background: 'white', padding: '25px', borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '300px', textAlign: 'center'
    });

    const text = document.createElement('div');
    text.innerText = msg;
    text.style.fontSize = '1.1rem';
    text.style.fontWeight = '500';

    box.appendChild(text);
    overlay.appendChild(box);
    return overlay;
}


// Add this to your imports or exports list
export function showPosInput(title, placeholder = "") {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: 10002,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        });

        const box = document.createElement('div');
        Object.assign(box.style, {
            background: 'white', padding: '25px', borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '300px', textAlign: 'center'
        });

        box.innerHTML = `<h3 style="margin-top:0;">${title}</h3>`;

        const input = document.createElement('input');
        input.type = "text";
        input.placeholder = placeholder;
        Object.assign(input.style, {
            width: '100%', padding: '10px', marginBottom: '15px',
            border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem'
        });
        
        // Handle Enter Key
        input.onkeydown = (e) => {
            if(e.key === 'Enter') confirmBtn.click();
        };

        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '10px';

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = "Cancel";
        cancelBtn.className = "pos-btn";
        cancelBtn.style.flex = "1";
        cancelBtn.onclick = () => { document.body.removeChild(overlay); resolve(null); };

        const confirmBtn = document.createElement('button');
        confirmBtn.innerText = "OK";
        confirmBtn.className = "pos-btn";
        Object.assign(confirmBtn.style, { flex:'1', background:'#2196f3', color:'white' });
        confirmBtn.onclick = () => {
            const val = input.value.trim();
            document.body.removeChild(overlay);
            resolve(val); // Return the text
        };

        btnGroup.appendChild(cancelBtn);
        btnGroup.appendChild(confirmBtn);
        box.appendChild(input);
        box.appendChild(btnGroup);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        
        setTimeout(() => input.focus(), 50); // Focus after render
    });
}