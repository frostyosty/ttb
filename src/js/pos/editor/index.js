// ./src/js/pos/editor/index.js 

import { EditorState } from './state.js';
import { renderLabel } from './renderer.js';
import { initInteractions } from './interactions.js';
import { setPropertyRefresh } from './propertiesPanel.js';
import { supabase } from '../../db.js';

let activeContainer = null;
let activeData = {};
let isEditing = false;
let currentPaperSize = '62mm';

export async function initLabelEditor(containerId, inputIds, imageInputId = null) {
  activeContainer = document.getElementById(containerId);

  const refresh = () => {
    renderLabel(activeContainer, EditorState.get(), activeData, isEditing, currentPaperSize);
  };

  initInteractions(activeContainer, refresh);
  setPropertyRefresh(refresh);

  const updateData = () => {

    activeData = {
      name: document.getElementById(inputIds.name)?.value || 'Product Name',
      price: document.getElementById(inputIds.price)?.value || '0.00',
      sku: 'PREVIEW'
    };

    if (imageInputId) {
      const fileInput = document.getElementById(imageInputId);
      if (fileInput && fileInput.files && fileInput.files[0]) {

        if (!fileInput.dataset.previewUrl) {
          fileInput.dataset.previewUrl = URL.createObjectURL(fileInput.files[0]);
        }
        activeData.image_url = fileInput.dataset.previewUrl;
      }
    }

    refresh();
  };

  Object.values(inputIds).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateData);
  });

  if (imageInputId) {
    const imgInput = document.getElementById(imageInputId);
    if (imgInput) imgInput.addEventListener('change', updateData);
  }

  EditorState.reset();
  updateData();

  return {
    getConfig: () => EditorState.get(),
    toggleEdit: (enabled) => {isEditing = enabled;refresh();},
    setPaperSize: (size) => {currentPaperSize = size;refresh();},
    addItem: (type) => {EditorState.addElement(type);refresh();},
    loadTemplate: async (id) => {
      const { data } = await supabase.from('tweed_trading_label_templates').select('*').eq('id', id).single();
      if (data) {EditorState.set(data.config);refresh();}
    },
    saveTemplate: async (name) => {
      const { data, error } = await supabase.from('tweed_trading_label_templates').
      insert({ name, config: EditorState.get() }).select().single();
      return error ? null : data;
    },
    refresh: updateData,
    print: async (realData) => {
      const win = window.open('', '', 'width=400,height=600');
      win.document.write('<html><head><style>@page { size: 62mm auto; margin: 0; } body { margin: 0; }</style></head><body><div id="print-area"></div></body></html>');
      const container = win.document.getElementById('print-area');
      await renderLabel(container, EditorState.get(), realData, false, currentPaperSize);
      setTimeout(() => {win.print();setTimeout(() => win.close(), 1000);}, 500);
    }
  };
}

export async function printLabelData(data, config = null) {

  const layout = config || EditorState.get();

  const win = window.open('', '', 'width=400,height=600');
  win.document.write('<html><head><style>@page { size: 62mm auto; margin: 0; } body { margin: 0; }</style></head><body><div id="print-area"></div></body></html>');

  const container = win.document.getElementById('print-area');

  await renderLabel(container, layout, data, false);

  setTimeout(() => {
    win.print();
    setTimeout(() => win.close(), 1000);
  }, 500);
}