// ./src/js/pos/lib/labelLogic.js 


import { initLabelEditor } from '../editor/index.js';
import { supabase } from '../../db.js';
import { showPosInput } from '../ui/posModals.js';
import { openTemplateManager } from '../ui/templates/index.js';

export async function setupLabelEditorController({
  previewId, inputMap, toggleId, toolbarId, templateSelectId, imageInputId
}) {

  if (!document.getElementById(previewId)) {
    console.warn(`Label Editor: Preview container '${previewId}' not found.`);
    return null;
  }

  const editor = await initLabelEditor(previewId, inputMap, imageInputId);

  const toggle = document.getElementById(toggleId);
  const toolbar = document.getElementById(toolbarId);

  if (toggle && toolbar) {

    toggle.addEventListener('change', (e) => {

      editor.toggleEdit(e.target.checked);

      if (e.target.checked) toolbar.classList.remove('hidden');else
      toolbar.classList.add('hidden');
    });
  }

  const select = document.getElementById(templateSelectId);
  if (select) {
    select.addEventListener('change', async (e) => {
      if (e.target.value) {
        await editor.loadTemplate(e.target.value);
        editor.refresh();
      }
    });
  }

  const btnManage = document.getElementById('btn-manage-tpl');
  if (btnManage) {
    btnManage.addEventListener('click', () => {
      openTemplateManager(async () => {

        const { data } = await supabase.from('tweed_trading_label_templates').select('*').order('name');
        const select = document.getElementById(templateSelectId);
        if (select && data) {
          const oldVal = select.value;
          select.innerHTML = '<option value="">-- Default Layout --</option>' +
          data.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
          select.value = oldVal;
        }
      });
    });
  }

  window.posAdd = (type) => editor.addItem(type);

  window.posSave = async () => {

    const name = await showPosInput("Name this Layout:", "e.g. 62mm Standard");

    if (name) {
      const newTpl = await editor.saveTemplate(name);
      if (newTpl && select) {
        const opt = document.createElement('option');
        opt.value = newTpl.id;
        opt.text = newTpl.name;
        select.insertBefore(opt, select.firstChild.nextSibling);
        select.value = newTpl.id;
      }
    }
  };

  return editor;
}