// ./src/js/imageManager.js 


import { state } from './state.js';
import { supabase } from './db.js';
import { render } from './renderer.js';

let currentCarouselIndex = null;
let tempImageList = [];

export function openImageManager(index) {
  currentCarouselIndex = index;
  const item = state.items[index];

  tempImageList = item.metadata && item.metadata.images ? [...item.metadata.images] : [];

  const modal = document.getElementById('image-modal');
  if (!modal) {
    console.error("CRITICAL: #image-modal is missing from index.html");
    alert("Error: Image Manager modal HTML is missing. Check index.html");
    return;
  }

  const success = renderImageTable();
  if (!success) return;

  modal.classList.remove('hidden');

  const closeBtn = document.getElementById('close-images');
  if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

  const uploadBtn = document.getElementById('btn-upload-img');
  if (uploadBtn) {
    uploadBtn.onclick = () => {
      alert("SECURITY: Client-side uploads are disabled.\n\nPlease upload images to the Supabase 'assets' bucket manually, then add the URL to the database.");
    };
  }

  const fileInput = document.getElementById('img-upload-input');
  if (fileInput) fileInput.onchange = handleUpload;

  const saveBtn = document.getElementById('btn-save-images');
  if (saveBtn) {
    saveBtn.onclick = () => {
      if (!state.items[currentCarouselIndex].metadata) {
        state.items[currentCarouselIndex].metadata = {};
      }
      state.items[currentCarouselIndex].metadata.images = tempImageList;

      render();
      document.dispatchEvent(new Event('app-render-request'));
      modal.classList.add('hidden');
    };
  }
}

function renderImageTable() {
  const tbody = document.getElementById('images-list');

  if (!tbody) {
    console.error("CRITICAL: #images-list table body is missing from HTML");
    return false;
  }

  tbody.innerHTML = '';

  if (tempImageList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="padding:20px; text-align:center;">No images in metadata. Add via Database or Supabase Dashboard.</td></tr>';
    return true;
  }

  tempImageList.forEach((img, idx) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #eee';
    tr.className = 'image-row';
    tr.draggable = true;

    const thumb = `<img src="${img.url}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">`;

    const catSelect = `
            <select class="cat-select" data-idx="${idx}" style="padding:8px; width:100%;">
                <option value="doors" ${img.category === 'doors' ? 'selected' : ''}>Doors</option>
                <option value="windows" ${img.category === 'windows' ? 'selected' : ''}>Windows</option>
                <option value="handles" ${img.category === 'handles' ? 'selected' : ''}>Handles</option>
                <option value="electrical" ${img.category === 'electrical' ? 'selected' : ''}>Electrical</option>

            </select>
        `;

    const delBtn = `<button class="img-del-btn" data-idx="${idx}" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>`;

    tr.innerHTML = `
            <td style="padding:10px;">${thumb}</td>
            <td style="padding:10px;">${catSelect}</td>
            <td style="padding:10px;">${delBtn}</td>
        `;

    tr.addEventListener('dragstart', (e) => {e.dataTransfer.setData('text/plain', idx);});
    tr.addEventListener('dragover', (e) => {e.preventDefault();});
    tr.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
      const toIdx = idx;

      const item = tempImageList.splice(fromIdx, 1)[0];
      tempImageList.splice(toIdx, 0, item);
      renderImageTable();
    });

    tbody.appendChild(tr);
  });

  document.querySelectorAll('.cat-select').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      tempImageList[e.target.dataset.idx].category = e.target.value;
    });
  });

  document.querySelectorAll('.img-del-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.closest('button').dataset.idx;
      tempImageList.splice(idx, 1);
      renderImageTable();
    });
  });

  return true;
}

async function handleUpload(e) {
  alert("Uploads Disabled.");
  return;
}