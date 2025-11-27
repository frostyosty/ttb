/// src/js/renderer.js
import { state } from './state.js';

const triggerRender = () => document.dispatchEvent(new Event('app-render-request'));
let dragSrcIndex = null;

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
        
        // --- TYPE HANDLING ---
        if (item.type === 'notepad') {
            el.className = 'content-block'; // Standard wrapper
            renderNotepad(el);
        } else if (item.type === 'alert') {
            el.className = 'content-block alert-box'; // Special Orange Style
            el.innerHTML = item.content || '';
        } else {
            el.className = 'content-block'; // Standard
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
    // --- 1. SPECIAL "QUICK DELETE" FOR ALERTS ---
    if (item.type === 'alert') {
        const delBtn = document.createElement('button');
        delBtn.className = 'quick-delete-btn';
        delBtn.innerHTML = '&times;';
        delBtn.title = "Delete Alert";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            if(confirm("Remove this announcement?")) {
                state.items.splice(index, 1);
                triggerRender();
            }
        };
        el.appendChild(delBtn);
    }

    // --- 2. EDITABILITY ---
    if (item.type !== 'notepad') {
        el.classList.add('editable');
        el.setAttribute('contenteditable', 'true');
        el.onblur = (e) => {
            // Fix: If it's an alert, we might accidentally overwrite the X button HTML
            // if we blindly save innerHTML. 
            // However, the X button is appended via JS after render, so e.target.innerHTML 
            // usually contains just the text content unless user messed with DOM.
            // Ideally, we strip the button out before saving.
            const clone = el.cloneNode(true);
            const btns = clone.querySelectorAll('.quick-delete-btn, .element-tools');
            btns.forEach(b => b.remove());
            
            const newVal = clone.innerHTML;
            if (state.items[index].content !== newVal) {
                state.items[index].content = newVal;
                triggerRender(); // Trigger auto-save
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

    // Resize & Scale
    const sizeBtn = createBtn('fa-expand', 'tool-size', () => {
        const current = item.styles.maxWidth || '1000px';
        const newVal = prompt("Max Width:", current);
        if(newVal) { item.styles.maxWidth = newVal; triggerRender(); }
    });
    const zoomOutBtn = createBtn('fa-search-minus', 'tool-scale', () => changeScale(item, -0.1));
    const zoomInBtn = createBtn('fa-search-plus', 'tool-scale', () => changeScale(item, 0.1));

    // Colors
    const colorInput = document.createElement('input'); colorInput.type = 'color'; colorInput.style.display = 'none';
    colorInput.onchange = (e) => { item.styles.color = e.target.value; triggerRender(); };
    const colorBtn = createBtn('fa-font', 'tool-color', () => colorInput.click());

    const bgInput = document.createElement('input'); bgInput.type = 'color'; bgInput.style.display = 'none';
    bgInput.onchange = (e) => { item.styles.background = e.target.value; triggerRender(); };
    const bgBtn = createBtn('fa-fill-drip', 'tool-color', () => bgInput.click());

    tools.append(dragBtn, sizeBtn, zoomOutBtn, zoomInBtn, colorBtn, bgBtn, colorInput, bgInput);
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