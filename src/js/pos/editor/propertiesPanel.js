// ./src/js/pos/editor/propertiesPanel.js 

import { EditorState } from './state.js';

let refreshCallback = null;

export function setPropertyRefresh(cb) {
  refreshCallback = cb;
}

export function renderPropertiesPanel(item) {
  const panel = document.getElementById('editor-properties-panel');
  if (!panel) return;

  panel.innerHTML = '';

  if (!item) {
    panel.innerHTML = `<div style="color:#999; text-align:center; padding:10px;">Select an element to edit styles</div>`;
    return;
  }

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '10px';
  controls.style.flexWrap = 'wrap';
  controls.style.alignItems = 'center';

  if (item.type === 'text') {

    controls.innerHTML += `
            <label>Size: <input type="number" value="${item.fontSize}" data-key="fontSize" style="width:50px; padding:5px;"></label>
        `;

    controls.innerHTML += `
            <select data-key="fontFamily" style="padding:5px;">
                <option value="Arial" ${item.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                <option value="Courier New" ${item.fontFamily === 'Courier New' ? 'selected' : ''}>Mono</option>
                <option value="Georgia" ${item.fontFamily === 'Georgia' ? 'selected' : ''}>Serif</option>
                <option value="Impact" ${item.fontFamily === 'Impact' ? 'selected' : ''}>Bold</option>
            </select>
        `;

    controls.innerHTML += `
            <select data-key="color" style="padding:5px;">
                <option value="black" ${item.color === 'black' ? 'selected' : ''}>Black</option>
                <option value="red" ${item.color === 'red' ? 'selected' : ''}>Red (Special Paper)</option>
            </select>
        `;

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '2px';

    ['bold', 'italic', 'underline'].forEach((cmd) => {
      const btn = document.createElement('button');
      btn.innerHTML = `<i class="fas fa-${cmd}"></i>`;
      btn.className = "pos-btn";
      btn.style.padding = "5px 10px";

      btn.onmousedown = (e) => {
        e.preventDefault();
        document.execCommand(cmd, false, null);

        const el = document.querySelector(`[data-id="${item.id}"]`);
        if (el) EditorState.updateElement(item.id, { html: el.innerHTML });
      };
      btnGroup.appendChild(btn);
    });
    controls.appendChild(btnGroup);
  }

  if (item.type === 'barcode' || item.type === 'qr') {
    controls.innerHTML += `
            <label>Width: <input type="number" value="${item.width}" data-key="width" style="width:60px; padding:5px;"></label>
            <label>Height: <input type="number" value="${item.height || item.width}" data-key="height" style="width:60px; padding:5px;"></label>
        `;
  }

  const delBtn = document.createElement('button');
  delBtn.innerText = '🗑️ Delete';
  delBtn.style.background = '#d32f2f';
  delBtn.style.color = 'white';
  delBtn.style.border = 'none';
  delBtn.style.padding = '5px 10px';
  delBtn.style.borderRadius = '4px';
  delBtn.style.marginLeft = 'auto';
  delBtn.onclick = () => {
    EditorState.removeElement(item.id);
    renderPropertiesPanel(null);
    refreshCallback();
  };
  controls.appendChild(delBtn);

  controls.querySelectorAll('input, select').forEach((inp) => {
    inp.addEventListener('change', (e) => {
      const key = e.target.dataset.key;
      const val = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
      EditorState.updateElement(item.id, { [key]: val });
      refreshCallback();
    });
  });

  panel.appendChild(controls);
}