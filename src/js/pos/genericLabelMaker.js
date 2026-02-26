// ./src/js/pos/genericLabelMaker.js 

import { supabase } from '../db.js';
import { renderGenericLabelForm } from './ui/genericLabelForm.js';
import { setupLabelEditorController } from './lib/labelLogic.js';

export async function initGenericLabelMaker() {
  const container = document.getElementById('pos-content-area');
  container.innerHTML = 'Loading Templates...';

  const { data: templates } = await supabase.
  from('tweed_trading_label_templates').
  select('*').
  order('created_at', { ascending: false });

  container.innerHTML = renderGenericLabelForm(templates);

  const editor = await setupLabelEditorController({
    previewId: 'generic-preview-box',
    inputMap: { name: 'gl-title', price: 'gl-subtitle', sku: 'gl-code' },
    toggleId: 'toggle-generic-edit',
    toolbarId: 'generic-toolbar',
    templateSelectId: 'gl-template-loader',
    imageInputId: 'gl-image'
  });

  document.getElementById('gl-paper-size').addEventListener('change', (e) => {
    editor.setPaperSize(e.target.value);
  });

  const photoInput = document.getElementById('gl-image');
  if (photoInput) {
    photoInput.addEventListener('change', () => {
      if (photoInput.files[0]) {
        const config = editor.getConfig();
        const hasImage = config.some((el) => el.type === 'image');
        if (!hasImage) {
          editor.addItem('image');
        }

      }
    });
  }

  document.getElementById('btn-print-generic').addEventListener('click', async () => {
    const data = {
      name: document.getElementById('gl-title').value,
      price: document.getElementById('gl-subtitle').value,
      sku: document.getElementById('gl-code').value || '',

      image_url: photoInput.dataset.previewUrl
    };
    await editor.print(data);
  });
}