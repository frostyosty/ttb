// ./src/js/pos/ui/templates/actions.js 

import { supabase } from '../../../db.js';
import { showPosConfirm, showPosInput, showPosToast } from '../posModals.js';

export function bindActionEvents(listContainer, allData, refreshCallback) {

  listContainer.querySelectorAll('.tpl-del-btn').forEach((btn) => {
    btn.onclick = async (e) => {
      if (await showPosConfirm('Delete this template permanently?')) {
        await supabase.from('tweed_trading_label_templates').delete().eq('id', e.target.dataset.id);
        showPosToast("Deleted");
        refreshCallback();
      }
    };
  });

  listContainer.querySelectorAll('.tpl-rename-btn').forEach((btn) => {
    btn.onclick = async (e) => {
      const id = e.target.dataset.id;
      const oldName = e.target.dataset.name;
      const newName = await showPosInput("Rename Template", oldName);

      if (newName && newName !== oldName) {
        const { error } = await supabase.from('tweed_trading_label_templates').
        update({ name: newName }).eq('id', id);

        if (!error) {
          showPosToast("Renamed");
          refreshCallback();
        } else {
          showPosToast("Error: " + error.message, 'error');
        }
      }
    };
  });

  listContainer.querySelectorAll('.tpl-copy-btn').forEach((btn) => {
    btn.onclick = async (e) => {
      const id = e.target.dataset.id;
      const original = allData.find((t) => t.id == id);
      if (!original) return;

      const newName = original.name + " (Copy)";

      const { error } = await supabase.from('tweed_trading_label_templates').insert({
        name: newName,
        config: original.config,
        position: 9999
      });

      if (!error) {
        showPosToast("Template Duplicated");
        refreshCallback();
      }
    };
  });
}