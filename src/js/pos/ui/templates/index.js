import { supabase } from '../../../db.js';
import { renderTemplateModal, renderTemplateList } from './render.js';
import { bindSortingEvents } from './sorting.js';
import { bindActionEvents } from './actions.js';

export async function openTemplateManager(onUpdate) {
    
    // 1. Initial Render
    const modal = renderTemplateModal();
    document.body.appendChild(modal);
    const listContainer = modal.querySelector('#tpl-list');

    // 2. Refresh Logic
    async function refresh() {
        // Fetch sorted by position
        const { data } = await supabase
            .from('tweed_trading_label_templates')
            .select('*')
            .order('position', { ascending: true });
            
        // Render List
        listContainer.innerHTML = renderTemplateList(data);
        
        // Bind Interactions
        bindSortingEvents(listContainer, refresh); // Pass refresh to update UI after sort
        bindActionEvents(listContainer, data, refresh);
    }

    // 3. Initial Load
    await refresh();

    // 4. Close Handler
    modal.querySelector('#btn-close-tpl').onclick = () => {
        document.body.removeChild(modal);
        if(onUpdate) onUpdate(); // Callback to update the dropdowns in main app
    };
}