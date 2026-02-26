/**
 * Injects the "Save Only" button next to the main submit button.
 */
export function setupActionButtons() {
    const originalSubmitBtn = document.querySelector('#add-product-form .submit-btn');
    
    // Safety check to prevent duplicate buttons if re-rendered
    if(originalSubmitBtn && !originalSubmitBtn.dataset.processed) {
        originalSubmitBtn.dataset.processed = "true";
        originalSubmitBtn.innerText = "💾 Save & Print Label";
        originalSubmitBtn.style.flex = "1";
        originalSubmitBtn.style.marginTop = "0"; 

        const btnGroup = document.createElement('div');
        Object.assign(btnGroup.style, { display:'flex', gap:'10px', marginTop:'10px' });

        const saveOnlyBtn = document.createElement('button');
        saveOnlyBtn.type = 'button';
        saveOnlyBtn.innerText = '💾 Save Only';
        saveOnlyBtn.className = 'pos-btn';
        Object.assign(saveOnlyBtn.style, { flex:'1', background:'#757575', color:'white', justifyContent:'center' });

        originalSubmitBtn.parentNode.insertBefore(btnGroup, originalSubmitBtn);
        btnGroup.appendChild(saveOnlyBtn);
        btnGroup.appendChild(originalSubmitBtn);

        // Logic: We set a data attribute on the form to tell the submit handler what to do
        saveOnlyBtn.addEventListener('click', () => {
             const form = document.getElementById('add-product-form');
             if(form) {
                 form.dataset.print = "false"; 
                 form.requestSubmit(); // Programmatically trigger submit
             }
        });

        originalSubmitBtn.addEventListener('click', () => {
             const form = document.getElementById('add-product-form');
             if(form) form.dataset.print = "true";
        });
    }
}