/// src/js/renderer.js
import { state } from './state.js';

const triggerRender = () => document.dispatchEvent(new Event('app-render-request'));

// Track what is being dragged
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
        el.innerHTML = item.content || '';
        el.className = 'content-block';
        Object.assign(el.style, item.styles);

        const originalIndex = state.items.indexOf(item);

        if (state.isDevMode) {
            setupDevFeatures(el, item, originalIndex);
        }

        container.appendChild(el);
    });
}

function setupDevFeatures(el, item, index) {
    el.classList.add('editable');
    el.setAttribute('contenteditable', 'true');

    // Save Text Logic
    el.onblur = (e) => {
        state.items[index].content = e.target.innerHTML;
    };

    // --- ELEMENT TOOLBAR ---
    const tools = document.createElement('div');
    tools.className = 'element-tools';
    tools.contentEditable = "false";

    // 1. DRAG HANDLE (Replaces Position Prompt)
    // We make the whole element draggable, but visually indicated here
    const dragBtn = createBtn('fa-grip-vertical', 'tool-pos', () => {});
    dragBtn.style.cursor = 'grab';
    dragBtn.title = "Drag to Move";
    
    // Enable Drag and Drop on the Parent Element
    el.draggable = true;
    el.addEventListener('dragstart', (e) => {
        dragSrcIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        el.style.opacity = '0.4'; // Visual feedback
    });
    el.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow Drop
        e.dataTransfer.dropEffect = 'move';
        el.style.borderTop = '3px solid #2e7d32'; // Show drop target line
    });
    el.addEventListener('dragleave', () => {
        el.style.borderTop = ''; // Remove line
    });
    el.addEventListener('dragend', () => {
        el.style.opacity = '1';
        document.querySelectorAll('.content-block').forEach(b => b.style.borderTop = '');
    });
    el.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragSrcIndex !== index) {
            // Reorder Array
            const movedItem = state.items[dragSrcIndex];
            state.items.splice(dragSrcIndex, 1); // Remove
            
            // Adjust index if we removed an item before this one
            let targetIndex = index;
            if (dragSrcIndex < index) targetIndex--; 
            
            state.items.splice(targetIndex, 0, movedItem); // Insert
            
            // Update position numbers for everyone to keep order persistent
            state.items.forEach((itm, i) => itm.position = i);
            
            triggerRender();
        }
    });

    // 2. RESIZE (Width)
    const sizeBtn = createBtn('fa-expand', 'tool-size', () => {
        const current = item.styles.maxWidth || '1000px';
        const newVal = prompt("Max Width (e.g. 100%, 600px):", current);
        if(newVal) { item.styles.maxWidth = newVal; triggerRender(); }
    });

    // 3. ZOOM OUT (-)
    const zoomOutBtn = createBtn('fa-search-minus', 'tool-scale', () => {
        changeScale(item, -0.1);
    });

    // 4. ZOOM IN (+)
    const zoomInBtn = createBtn('fa-search-plus', 'tool-scale', () => {
        changeScale(item, 0.1);
    });

    // 5. COLORS
    const colorInput = document.createElement('input');
    colorInput.type = 'color'; colorInput.style.display = 'none';
    colorInput.onchange = (e) => { item.styles.color = e.target.value; triggerRender(); };
    const colorBtn = createBtn('fa-font', 'tool-color', () => colorInput.click()); // Font Icon

    const bgInput = document.createElement('input');
    bgInput.type = 'color'; bgInput.style.display = 'none';
    bgInput.onchange = (e) => { item.styles.background = e.target.value; triggerRender(); };
    const bgBtn = createBtn('fa-fill-drip', 'tool-color', () => bgInput.click()); // Paint Bucket

    // Append All
    tools.appendChild(dragBtn); // Move
    tools.appendChild(sizeBtn); // Resize
    tools.appendChild(zoomOutBtn); // -
    tools.appendChild(zoomInBtn);  // +
    tools.appendChild(colorBtn);   // Text Color
    tools.appendChild(bgBtn);      // Bg Color
    tools.appendChild(colorInput);
    tools.appendChild(bgInput);

    el.appendChild(tools);
}

function changeScale(item, amount) {
    const current = item.styles.transform || 'scale(1)';
    const num = parseFloat(current.replace(/[^0-9.]/g, '')) || 1.0;
    
    // Calculate new scale (rounded to 1 decimal)
    const newScale = Math.max(0.1, num + amount).toFixed(1);
    
    item.styles.transform = `scale(${newScale})`;
    triggerRender();
}

function createBtn(iconClass, colorClass, onClick) {
    const btn = document.createElement('button');
    btn.className = `tool-btn ${colorClass}`;
    btn.innerHTML = `<i class="fas ${iconClass}"></i>`;
    btn.onclick = (e) => {
        e.stopPropagation(); 
        onClick(e);
    };
    return btn;
}