// ./src/js/pos/productManager.js 

import { supabase } from '../db.js';
import { renderAddItemForm } from './ui/addItemForm.js';
import { setupLabelEditorController } from './lib/labelLogic.js';
import { openCategoryManager } from './ui/categoryManager.js';

export async function initProductManager() {
  const container = document.getElementById('pos-content-area');
  if (!container) {
    console.error("POS Content Area missing");
    return;
  }

  container.innerHTML = '<div style="padding:20px;">Loading...</div>';

  const [catRes, tplRes] = await Promise.all([
  supabase.from('tweed_trading_categories').select('*').order('name'),
  supabase.from('tweed_trading_label_templates').select('*').order('created_at', { ascending: false })]
  );

  if (!document.getElementById('pos-content-area')) return;

  container.innerHTML = renderAddItemForm(catRes.data, tplRes.data);

  setupActionButtons();

  await new Promise((r) => setTimeout(r, 0));

  const editor = await setupLabelEditorController({
    previewId: 'preview-box',
    inputMap: { name: 'p-name', price: 'p-price' },
    toggleId: 'toggle-edit-mode',
    toolbarId: 'editor-toolbar',
    templateSelectId: 'p-template-loader'
  });

  if (!editor) {
    console.warn("Editor failed to initialize (DOM missing?)");
    return;
  }

  const btnManageCats = document.getElementById('btn-manage-cats');
  if (btnManageCats) {
    btnManageCats.addEventListener('click', () => {
      openCategoryManager(async () => {

        const { data } = await supabase.from('tweed_trading_categories').select('*').order('name');
        const sel = document.getElementById('p-cat');
        if (sel && data) {
          const oldVal = sel.value;
          sel.innerHTML = '<option value="">-- Unlinked --</option>' +
          data.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
          sel.value = oldVal;
        }
      });
    });
  }

  const sizeSelect = document.getElementById('p-paper-size');
  if (sizeSelect) {
    sizeSelect.addEventListener('change', () => {
      if (editor && editor.setPaperSize) {
        editor.setPaperSize(sizeSelect.value);
      }
    });
  }

  const form = document.getElementById('add-product-form');
  if (form) {
    form.addEventListener('submit', (e) => handleFormSubmit(e, true, editor));
  }

  const photoInput = document.getElementById('p-image');
  if (photoInput) {
    photoInput.addEventListener('change', () => {
      const file = photoInput.files[0];
      if (file) {

        const objectUrl = URL.createObjectURL(file);
        photoInput.dataset.previewUrl = objectUrl;

        const currentConfig = editor.getConfig();
        const hasImage = currentConfig.some((el) => el.type === 'image');

        if (!hasImage) {
          editor.addItem('image');

        }

        editor.refresh();
      }
    });
  }
}

function setupActionButtons() {
  const originalSubmitBtn = document.querySelector('#add-product-form .submit-btn');
  if (originalSubmitBtn && !originalSubmitBtn.dataset.processed) {
    originalSubmitBtn.dataset.processed = "true";
    originalSubmitBtn.innerText = "💾 Save & Print Label";
    originalSubmitBtn.style.flex = "1";
    originalSubmitBtn.style.marginTop = "0";

    const btnGroup = document.createElement('div');
    Object.assign(btnGroup.style, { display: 'flex', gap: '10px', marginTop: '10px' });

    const saveOnlyBtn = document.createElement('button');
    saveOnlyBtn.type = 'button';
    saveOnlyBtn.innerText = '💾 Save Only';
    saveOnlyBtn.className = 'pos-btn';
    Object.assign(saveOnlyBtn.style, { flex: '1', background: '#757575', color: 'white', justifyContent: 'center' });

    originalSubmitBtn.parentNode.insertBefore(btnGroup, originalSubmitBtn);
    btnGroup.appendChild(saveOnlyBtn);
    btnGroup.appendChild(originalSubmitBtn);

    saveOnlyBtn.addEventListener('click', () => {
      const form = document.getElementById('add-product-form');
      if (form) {
        form.dataset.print = "false";
        form.requestSubmit();
      }
    });

    originalSubmitBtn.addEventListener('click', () => {
      const form = document.getElementById('add-product-form');
      if (form) form.dataset.print = "true";
    });
  }
}

async function handleFormSubmit(e, defaultPrintState, editor) {
  e.preventDefault();
  const shouldPrint = e.target.dataset.print !== "false";
  const btns = document.querySelectorAll('button');
  btns.forEach((b) => b.disabled = true);

  try {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const catId = document.getElementById('p-cat').value || null;
    const stock = document.getElementById('p-stock').value;
    const file = document.getElementById('p-image').files[0];
    const sku = 'TWD-' + Math.floor(100000 + Math.random() * 900000);

    let imageUrl = null;
    if (file) {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
      const { data } = await supabase.storage.from('tweed_trading_assets').upload(fileName, file);
      if (data) imageUrl = `https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/tweed_trading_assets/${fileName}`;
    }

    const { error } = await supabase.from('tweed_trading_products').insert({
      name, price, category_id: catId, sku,
      image_url: imageUrl, stock_level: stock,
      is_printed: shouldPrint
    });

    if (error) throw error;

    if (shouldPrint && editor) {
      await editor.print({ name, price, sku, image_url: imageUrl });
    } else {
      alert("Saved to Inventory (Not Printed)");
    }

    e.target.reset();
    if (editor) editor.refresh();
    document.getElementById('p-name')?.focus();

  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    btns.forEach((b) => b.disabled = false);
  }
}