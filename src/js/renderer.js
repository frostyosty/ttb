/// src/js/renderer.js
import { state } from './state.js';
import { ask } from './modal.js';

const triggerRender = () => document.dispatchEvent(new Event('app-render-request'));
let dragSrcIndex = null;

// Helper for color picker (kept for text/bg color changes)
let activeColorCallback = null;
let globalColorInput = document.getElementById('global-color-picker');

if (!globalColorInput) {
    globalColorInput = document.createElement('input');
    globalColorInput.id = 'global-color-picker';
    globalColorInput.type = 'color';
    globalColorInput.style.display = 'none';
    document.body.appendChild(globalColorInput);
    
    globalColorInput.addEventListener('input', (e) => {
        if (activeColorCallback) activeColorCallback(e.target.value, false); 
    });

    globalColorInput.addEventListener('change', (e) => {
        if (activeColorCallback) {
            activeColorCallback(e.target.value, true); 
            activeColorCallback = null; 
        }
    });
}

export function render() {
    const container = document.getElementById('app-container');
    container.innerHTML = '';

    const pageItems = state.items.filter(item => {
        const itemPage = item.page || 'home'; 
        return itemPage === state.currentPage;
    });

    if (pageItems.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">No content on this page yet.</div>';
    }

    pageItems.forEach((item) => {
        const el = document.createElement('div');
        
        if (item.type === 'notepad') {
            el.className = 'content-block'; 
            renderNotepad(el);
        } else if (item.type === 'alert') {
            el.className = 'content-block alert-box'; 
            el.innerHTML = item.content || '';
        } else {
            el.className = 'content-block';
            el.innerHTML = item.content || '';
        }

        Object.assign(el.style, item.styles);

        // Find the REAL index in the main state array
        const originalIndex = state.items.indexOf(item);

        if (state.isDevMode) {
            setupDevFeatures(el, item, originalIndex);
        }
        container.appendChild(el);
    });
}

function setupDevFeatures(el, item, index) {
    // --- 1. OPTIMISTIC DELETE ---
    if (item.type === 'alert') {
        const delBtn = document.createElement('button');
        delBtn.className = 'quick-delete-btn';
        delBtn.innerHTML = '&times;';
        delBtn.title = "Delete Alert";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            state.items.splice(index, 1);
            triggerRender();
        };
        el.appendChild(delBtn);
    }

    // --- 2. EDITABILITY (TEXT SAVE FIX) ---
    if (item.type !== 'notepad') {
        el.classList.add('editable');
        el.setAttribute('contenteditable', 'true');
        
        // This triggers when you click OUT of the text box
        el.onblur = (e) => {
            // 1. Clean up Dev UI elements before saving content
            const clone = el.cloneNode(true);
            const btns = clone.querySelectorAll('.quick-delete-btn, .element-tools');
            btns.forEach(b => b.remove());
            
            const newVal = clone.innerHTML;
            
            // 2. CHECK: Did content change?
            if (state.items[index].content !== newVal) {
                console.log("📝 Text Change Detected on Item", index);
                
                // 3. UPDATE STATE
                state.items[index].content = newVal;
                
                // 4. TRIGGER SAVE
                triggerRender(); 
            }
        };
    } else {
        el.classList.add('editable');
        el.setAttribute('contenteditable', 'false'); 
    }

    // --- 3. ELEMENT TOOLBAR ---
    const tools = document.createElement('div');
    tools.className = 'element-tools';
    tools.contentEditable = "false";

    // Counter-Scale logic
    const currentScale = parseFloat((item.styles.transform || '').replace(/[^0-9.]/g, '')) || 1;
    if (currentScale !== 1) {
        tools.style.transform = `scale(${1 / currentScale})`;
        tools.style.transformOrigin = 'bottom right';
    }

    // Buttons
    const dragBtn = createBtn('fa-grip-vertical', 'tool-pos', () => {});
    dragBtn.style.cursor = 'grab';
    el.draggable = true;
    el.addEventListener('dragstart', (e) => { dragSrcIndex = index; e.dataTransfer.effectAllowed = 'move'; el.style.opacity = '0.4'; });
    el.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; el.style.borderTop = '3px solid #2e7d32'; });
    el.addEventListener('dragleave', () => el.style.borderTop = '');
    el.addEventListener('dragend', () => { el.style.opacity = '1'; document.querySelectorAll('.content-block').forEach(b => b.style.borderTop = ''); });
    el.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragSrcIndex !== index) {
            const movedItem = state.items[dragSrcIndex];
            state.items.splice(dragSrcIndex, 1);
            let targetIndex = index;
            if (dragSrcIndex < index) targetIndex--; 
            state.items.splice(targetIndex, 0, movedItem);
            state.items.forEach((itm, i) => itm.position = i);
            triggerRender();
        }
    });

    const sizeBtn = createBtn('fa-expand', 'tool-size', async () => {
        const current = item.styles.maxWidth || '1000px';
        const newVal = await ask("Max Width (e.g. 100%, 600px):", current);
        if(newVal) { item.styles.maxWidth = newVal; triggerRender(); }
    });

    const zoomOutBtn = createBtn('fa-search-minus', 'tool-scale', () => changeScale(item, -0.1));
    const zoomInBtn = createBtn('fa-search-plus', 'tool-scale', () => changeScale(item, 0.1));

    const colorBtn = createBtn('fa-font', 'tool-color', () => {
        const selection = window.getSelection();
        const hasSelection = selection.rangeCount > 0 && !selection.isCollapsed && selection.anchorNode.parentNode.closest('.content-block') === el;

        activeColorCallback = (val, save) => {
            if (hasSelection) {
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('foreColor', false, val);
            } else {
                el.style.color = val; 
                if (save) {
                    if (hasSelection) state.items[index].content = el.innerHTML;
                    else item.styles.color = val;
                    triggerRender();
                }
            }
        };
        globalColorInput.click();
    });

    const bgBtn = createBtn('fa-fill-drip', 'tool-color', () => {
        activeColorCallback = (val, save) => {
            el.style.backgroundColor = val; 
            if (save) {
                item.styles.background = val; 
                triggerRender();
            }
        };
        globalColorInput.click();
    });

    // NOTE: Removed Image Upload Button per your request

    tools.append(dragBtn, sizeBtn, zoomOutBtn, zoomInBtn, colorBtn, bgBtn);
    el.appendChild(tools);
}

function renderNotepad(el) {
    el.innerHTML = `
        <div class="notepad-container">
            <div class="notepad-tape"></div>
            <h3 class="notepad-title">My Measurements & Notes</h3>
            <textarea class="notepad-textarea" placeholder="Type here... (Auto-saved)"></textarea>
        </div>
    `;
    const textarea = el.querySelector('textarea');
    const savedNote = localStorage.getItem('tweed_notepad_data');
    if (savedNote) textarea.value = savedNote;
    textarea.addEventListener('input', (e) => { localStorage.setItem('tweed_notepad_data', e.target.value); });
}

function changeScale(item, amount) {
    const current = item.styles.transform || 'scale(1)';
    const num = parseFloat(current.replace(/[^0-9.]/g, '')) || 1.0;
    const newScale = Math.max(0.1, num + amount).toFixed(1);
    item.styles.transform = `scale(${newScale})`;
    triggerRender();
}

function createBtn(iconClass, colorClass, onClick) {
    const btn = document.createElement('button');
    btn.className = `tool-btn ${colorClass}`;
    btn.innerHTML = `<i class="fas ${iconClass}"></i>`;
    btn.onclick = (e) => { e.stopPropagation(); onClick(e); };
    return btn;
}