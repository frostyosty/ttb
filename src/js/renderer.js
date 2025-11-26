/// src/js/renderer.js
import { state } from './state.js';
// We need to trigger render after updates, so we import main's trigger function or just re-render locally
// To keep circular deps low, we'll manually call render() logic or assume 'main' handles triggers.
// For simplicity, we'll just modify state and the user must click 'Save' or we force a re-render.
// Actually, let's use a CustomEvent so main.js can listen and re-render.
const triggerRender = () => document.dispatchEvent(new Event('app-render-request'));

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

    pageItems.forEach((item, index) => {
        const el = document.createElement('div');
        el.innerHTML = item.content || '';
        el.className = 'content-block';
        Object.assign(el.style, item.styles);

        // Map index to main array
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

    // Save Text on Edit
    el.onblur = (e) => {
        state.items[index].content = e.target.innerHTML;
    };

    // --- NEW ELEMENT TOOLBAR ---
    const tools = document.createElement('div');
    tools.className = 'element-tools';
    tools.contentEditable = "false"; // Prevent tools from being text-edited

    // 1. POSITION (Move)
    const posBtn = createBtn('fa-arrows-alt', 'tool-pos', () => {
        const newPos = prompt("Enter new position number (lower = higher up):", item.position || 0);
        if(newPos !== null) {
            state.items[index].position = parseInt(newPos);
            triggerRender();
        }
    });

    // 2. RESIZE (Width)
    const sizeBtn = createBtn('fa-expand', 'tool-size', () => {
        const current = item.styles.maxWidth || '1000px';
        const newVal = prompt("Enter Max Width (e.g. 500px, 100%):", current);
        if(newVal) {
            item.styles.maxWidth = newVal;
            triggerRender();
        }
    });

    // 3. SCALE (Zoom)
    const scaleBtn = createBtn('fa-search-plus', 'tool-scale', () => {
        const current = item.styles.transform || 'scale(1)';
        // Extract number if possible
        const num = current.replace(/[^0-9.]/g, '') || '1';
        const newVal = prompt("Enter Scale (0.5 = small, 1 = normal, 1.5 = big):", num);
        if(newVal) {
            item.styles.transform = `scale(${newVal})`;
            triggerRender();
        }
    });

    // 4. TEXT COLOR
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.display = 'none';
    colorInput.onchange = (e) => {
        item.styles.color = e.target.value;
        triggerRender();
    };
    const colorBtn = createBtn('fa-palette', 'tool-color', () => colorInput.click());

    // 5. BACKGROUND COLOR
    const bgInput = document.createElement('input');
    bgInput.type = 'color';
    bgInput.style.display = 'none';
    bgInput.onchange = (e) => {
        item.styles.background = e.target.value;
        triggerRender();
    };
    const bgBtn = createBtn('fa-fill-drip', 'tool-color', () => bgInput.click());

    // Append all
    tools.appendChild(posBtn);
    tools.appendChild(sizeBtn);
    tools.appendChild(scaleBtn);
    tools.appendChild(colorBtn);
    tools.appendChild(bgBtn);
    tools.appendChild(colorInput);
    tools.appendChild(bgInput);

    el.appendChild(tools);
}

// Helper to create buttons
function createBtn(iconClass, colorClass, onClick) {
    const btn = document.createElement('button');
    btn.className = `tool-btn ${colorClass}`;
    btn.innerHTML = `<i class="fas ${iconClass}"></i>`;
    btn.onclick = (e) => {
        e.stopPropagation(); // Don't trigger text edit
        onClick(e);
    };
    return btn;
}