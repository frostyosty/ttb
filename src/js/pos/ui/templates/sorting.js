// ./src/js/pos/ui/templates/sorting.js 

import { supabase } from '../../../db.js';

let draggedItem = null;

export function bindSortingEvents(listContainer, refreshCallback) {
  const rows = listContainer.querySelectorAll('.tpl-row');

  listContainer.querySelectorAll('.tpl-up-btn').forEach((btn) => {
    btn.onclick = (e) => {
      const row = e.target.closest('.tpl-row');
      if (row.previousElementSibling) {
        row.parentNode.insertBefore(row, row.previousElementSibling);
        saveOrder(listContainer);
        refreshCallback();
      }
    };
  });

  listContainer.querySelectorAll('.tpl-down-btn').forEach((btn) => {
    btn.onclick = (e) => {
      const row = e.target.closest('.tpl-row');
      if (row.nextElementSibling) {
        row.parentNode.insertBefore(row.nextElementSibling, row);
        saveOrder(listContainer);
        refreshCallback();
      }
    };
  });

  rows.forEach((row) => {

    const handle = row.querySelector('.drag-handle');
    handle.addEventListener('mousedown', () => row.setAttribute('draggable', 'true'));

    row.addEventListener('dragstart', (e) => {
      draggedItem = row;
      e.dataTransfer.effectAllowed = 'move';
      row.style.opacity = '0.5';
    });

    row.addEventListener('dragend', () => {
      draggedItem = null;
      row.style.opacity = '1';
      saveOrder(listContainer);
      refreshCallback();
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (row === draggedItem) return;

      const bounding = row.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;

      if (e.clientY - offset > 0) {
        row.parentNode.insertBefore(draggedItem, row.nextSibling);
      } else {
        row.parentNode.insertBefore(draggedItem, row);
      }
    });
  });
}

async function saveOrder(listContainer) {
  const rows = Array.from(listContainer.querySelectorAll('.tpl-row'));
  const updates = rows.map((row, index) => ({
    id: row.dataset.id,
    position: index
  }));

  await supabase.from('tweed_trading_label_templates').upsert(updates);
}