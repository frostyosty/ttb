import { EditorState } from './state.js';
import { renderPropertiesPanel } from './propertiesPanel.js';

let dragItem = null;
let startX, startY, origX, origY;
let currentContainer = null;

export function initInteractions(container, refreshFn) {
    currentContainer = container;


    
    // 1. Mouse Down (Select or Drag)
// 1. Mouse Down
container.addEventListener('mousedown', handleStart);

// 2. Touch Start (Explicitly non-passive so we can preventDefault)
container.addEventListener('touchstart', handleStart, { passive: false });

    // 2. Double Click (Enter Text Edit Mode)
    container.addEventListener('dblclick', (e) => {
        const el = e.target.closest('.label-element');
        if (!el) return;
        
        const item = EditorState.getSelectedElement();
        if (item && item.type === 'text') {
            // Enable Typing
            el.contentEditable = "true";
            el.focus();
            el.style.cursor = "text";
            el.style.userSelect = "text";
            el.style.border = "1px solid #2196f3";
            el.style.backgroundColor = "rgba(255,255,255,0.9)";
            
            // Stop Dragging while typing
            el.onmousedown = (ev) => ev.stopPropagation();
            
            // Save on Blur
            el.onblur = () => {
                el.contentEditable = "false";
                el.style.cursor = "move";
                el.style.userSelect = "none";
                el.style.border = "none";
                el.style.backgroundColor = "transparent";
                EditorState.updateElement(item.id, { html: el.innerHTML }); // Save HTML (Bold/Italic)
                refreshFn();
            };
        }
    });
    
    // 3. Move
    container.addEventListener('mousemove', (e) => handleMove(e, refreshFn));
    container.addEventListener('touchmove', (e) => handleMove(e, refreshFn));

    // 4. End
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
}

function handleStart(e) {
    const el = e.target.closest('.label-element');
    if (!el) {
        // Deselect if clicking background
        EditorState.select(null);
        renderPropertiesPanel(null); // Clear panel
        return;
    }



 const el = e.target.closest('.label-element');
    
    if (el && !el.isContentEditable) {
        e.preventDefault(); // Stop Scroll, Start Drag

    const id = el.dataset.id;
    EditorState.select(id);
    
    // Show Properties for this item
    renderPropertiesPanel(EditorState.getSelectedElement());

    // Highlight
    document.querySelectorAll('.label-element').forEach(d => d.style.border = 'none');
    el.style.border = '1px dashed #2196f3';

    // Start Drag
    dragItem = EditorState.getSelectedElement();
    const evt = e.touches ? e.touches[0] : e;
    startX = evt.clientX;
    startY = evt.clientY;
    origX = dragItem.x;
    origY = dragItem.y;

    }
}

function handleMove(e, refreshFn) {
    if (!dragItem) return;
    e.preventDefault();

    const evt = e.touches ? e.touches[0] : e;
    const deltaX = evt.clientX - startX;
    const deltaY = evt.clientY - startY;

    // Snap to Grid (10px)
    let newX = Math.round((origX + deltaX) / 10) * 10;
    let newY = Math.round((origY + deltaY) / 10) * 10;

    // Live update DOM (better performance than full re-render)
    const el = currentContainer.querySelector(`[data-id="${dragItem.id}"]`);
    if(el) {
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
    }

    // Update State silently
    dragItem.x = newX;
    dragItem.y = newY;
}

function handleEnd() {
    if (dragItem) {
        // Final save to state
        EditorState.updateElement(dragItem.id, { x: dragItem.x, y: dragItem.y });
        dragItem = null;
    }
}