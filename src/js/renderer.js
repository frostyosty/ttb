/// src/js/renderer.js
import { state } from './state.js';
import { ask } from './modal.js';

const triggerRender = () => document.dispatchEvent(new Event('app-render-request'));
let dragSrcIndex = null;

// Helper to handle color picker state so it doesn't get destroyed during editing
let activeColorCallback = null;
let globalColorInput = document.getElementById('global-color-picker');

// Ensure global picker exists in DOM (prevents re-render destruction)
if (!globalColorInput) {
    globalColorInput = document.createElement('input');
    globalColorInput.id = 'global-color-picker';
    globalColorInput.type = 'color';
    globalColorInput.style.display = 'none';
    document.body.appendChild(globalColorInput);
    
    // Live Preview
    globalColorInput.addEventListener('input', (e) => {
        if (activeColorCallback) activeColorCallback(e.target.value, false); // false = don't save yet
    });

    // Commit Change
    globalColorInput.addEventListener('change', (e) => {
        if (activeColorCallback) {
            activeColorCallback(e.target.value, true); // true = save now
            activeColorCallback = null; // Cleanup
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

    // --- 2. EDITABILITY ---
    if (item.type !== 'notepad') {
        el.classList.add('editable');
        el.setAttribute('contenteditable', 'true');
        el.onblur = (e) => {
            if (state.items[index] !== item) return;

            const clone = el.cloneNode(true);
            const btns = clone.querySelectorAll('.quick-delete-btn, .element-tools');
            btns.forEach(b => b.remove());
            
            const newVal = clone.innerHTML;
            if (item.content !== newVal) {
                state.items[index].content = newVal;
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

    // FIX FOR ISSUE 3: Counter-Scale
    // If the box is scaled to 0.5, we scale the tools to 2.0 so they look normal.
    const currentScale = parseFloat((item.styles.transform || '').replace(/[^0-9.]/g, '')) || 1;
    if (currentScale !== 1) {
        tools.style.transform = `scale(${1 / currentScale})`;
        tools.style.transformOrigin = 'bottom right'; // Pin to corner
    }

    // Drag
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

    // Resize
    const sizeBtn = createBtn('fa-expand', 'tool-size', async () => {
        const current = item.styles.maxWidth || '1000px';
        const newVal = await ask("Max Width (e.g. 100%, 600px):", current);
        if(newVal) { item.styles.maxWidth = newVal; triggerRender(); }
    });

    const zoomOutBtn = createBtn('fa-search-minus', 'tool-scale', () => changeScale(item, -0.1));
    const zoomInBtn = createBtn('fa-search-plus', 'tool-scale', () => changeScale(item, 0.1));

    // --- FIX FOR ISSUE 1 & 2: COLORS ---
    
    // Text Color
    const colorBtn = createBtn('fa-font', 'tool-color', () => {
        // Check if user has highlighted text
        const selection = window.getSelection();
        const hasSelection = selection.rangeCount > 0 && !selection.isCollapsed && selection.anchorNode.parentNode.closest('.content-block') === el;

        activeColorCallback = (val, save) => {
            if (hasSelection) {
                // If text selected, use execCommand (Old but reliable for CMS)
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('foreColor', false, val);
            } else {
                // Else, Block style
                el.style.color = val; // Preview
                if (save) {
                    // If we used execCommand, content changed. If block, style changed.
                    if (hasSelection) state.items[index].content = el.innerHTML;
                    else item.styles.color = val;
                    triggerRender();
                }
            }
        };
        globalColorInput.click();
    });

    // Background Color
    const bgBtn = createBtn('fa-fill-drip', 'tool-color', () => {
        activeColorCallback = (val, save) => {
            el.style.backgroundColor = val; // Preview
            if (save) {
                item.styles.background = val; // Save
                triggerRender();
            }
        };
        globalColorInput.click();
    });

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