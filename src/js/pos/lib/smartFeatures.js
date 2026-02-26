// ./src/js/pos/lib/smartFeatures.js 

import { supabase } from '../../db.js';

export function initSmartCategory(nameInputId, categorySelectId, categories) {
  const nameInput = document.getElementById(nameInputId);
  const catSelect = document.getElementById(categorySelectId);

  if (!nameInput || !catSelect) return;

  const keywords = {
    'handle': 'Hardware',
    'knob': 'Hardware',
    'sink': 'Kitchens',
    'tap': 'Bathroom',
    'switch': 'Electrical',
    'socket': 'Electrical'
  };

  nameInput.addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase();
    if (text.length < 3) return;

    let bestMatchId = null;

    for (const [key, catNameFragment] of Object.entries(keywords)) {
      if (text.includes(key)) {
        const match = categories.find((c) => c.name.includes(catNameFragment));
        if (match) bestMatchId = match.id;
      }
    }

    if (!bestMatchId) {

      const match = categories.find((c) => {
        const simpleName = c.name.toLowerCase().replace('-', ' ');
        return text.includes(simpleName) || simpleName.includes(text);
      });
      if (match) bestMatchId = match.id;
    }

    if (bestMatchId && catSelect.value != bestMatchId) {
      catSelect.value = bestMatchId;

      catSelect.dispatchEvent(new Event('change'));

      catSelect.style.transition = 'border-color 0.2s';
      catSelect.style.borderColor = '#2e7d32';
      setTimeout(() => catSelect.style.borderColor = '#ccc', 1000);
    }
  });
}

export function initSmartTemplate(categorySelectId, templateSelectId, categories) {
  const catSelect = document.getElementById(categorySelectId);
  const tplSelect = document.getElementById(templateSelectId);

  if (!catSelect || !tplSelect) return;

  catSelect.addEventListener('change', () => {
    const catId = catSelect.value;
    const selectedCat = categories.find((c) => c.id == catId);

    if (selectedCat && selectedCat.last_template_id) {

      const templateOption = tplSelect.querySelector(`option[value="${selectedCat.last_template_id}"]`);

      if (templateOption && tplSelect.value != selectedCat.last_template_id) {
        tplSelect.value = selectedCat.last_template_id;

        tplSelect.dispatchEvent(new Event('change'));

        console.log(`🧠 Smart Switch: Loaded template for ${selectedCat.name}`);
      }
    }
  });
}

export async function learnCategoryPreference(categoryId, templateId) {
  if (!categoryId || !templateId) return;

  await supabase.from('tweed_trading_categories').
  update({ last_template_id: templateId }).
  eq('id', categoryId);

  console.log("🧠 Learned preference.");
}