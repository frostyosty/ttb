// ./src/js/pos/editor/interactions.js 

import { EditorState } from './state.js';
import { renderPropertiesPanel } from './propertiesPanel.js';

let dragItem = null;
let startX, startY, origX, origY;
let currentContainer = null;

export function initInteractions(container, refreshFn) {
  currentContainer = container;

  container.addEventListener('mousedown', handleStart);

  container.addEventListener('touchstart', handleStart, { passive: false });

  container.addEventListener('dblclick', (e) => {
    const el = e.target.closest('.label-element');
    if (!el) return;

    const item = EditorState.getSelectedElement();
    if (item && item.type === 'text') {

      el.contentEditable = "true";
      el.focus();
      el.style.cursor = "text";
      el.style.userSelect = "text";
      el.style.border = "1px solid #2196f3";
      el.style.backgroundColor = "rgba(255,255,255,0.9)";

      el.onmousedown = (ev) => ev.stopPropagation();

      el.onblur = () => {
        el.contentEditable = "false";
        el.style.cursor = "move";
        el.style.userSelect = "none";
        el.style.border = "none";
        el.style.backgroundColor = "transparent";
        EditorState.updateElement(item.id, { html: el.innerHTML });
        refreshFn();
      };
    }
  });

  container.addEventListener('mousemove', (e) => handleMove(e, refreshFn));
  container.addEventListener('touchmove', (e) => handleMove(e, refreshFn));

  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchend', handleEnd);
}

function handleStart(e) {
  const el = e.target.closest('.label-element');
  if (!el) {

    EditorState.select(null);
    renderPropertiesPanel(null);
    return;
  }

  if (el && !el.isContentEditable) {
    e.preventDefault();

    const id = el.dataset.id;
    EditorState.select(id);

    renderPropertiesPanel(EditorState.getSelectedElement());

    document.querySelectorAll('.label-element').forEach((d) => d.style.border = 'none');
    el.style.border = '1px dashed #2196f3';

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

  let newX = Math.round((origX + deltaX) / 10) * 10;
  let newY = Math.round((origY + deltaY) / 10) * 10;

  const el = currentContainer.querySelector(`[data-id="${dragItem.id}"]`);
  if (el) {
    el.style.left = `${newX}px`;
    el.style.top = `${newY}px`;
  }

  dragItem.x = newX;
  dragItem.y = newY;
}

function handleEnd() {
  if (dragItem) {

    EditorState.updateElement(dragItem.id, { x: dragItem.x, y: dragItem.y });
    dragItem = null;
  }
}