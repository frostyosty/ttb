// ./src/js/pos/ui/templates/index.js 

import { supabase } from '../../../db.js';
import { renderTemplateModal, renderTemplateList } from './render.js';
import { bindSortingEvents } from './sorting.js';
import { bindActionEvents } from './actions.js';

export async function openTemplateManager(onUpdate) {

  const modal = renderTemplateModal();
  document.body.appendChild(modal);
  const listContainer = modal.querySelector('#tpl-list');

  async function refresh() {

    const { data } = await supabase.
    from('tweed_trading_label_templates').
    select('*').
    order('position', { ascending: true });

    listContainer.innerHTML = renderTemplateList(data);

    bindSortingEvents(listContainer, refresh);
    bindActionEvents(listContainer, data, refresh);
  }

  await refresh();

  modal.querySelector('#btn-close-tpl').onclick = () => {
    document.body.removeChild(modal);
    if (onUpdate) onUpdate();
  };
}