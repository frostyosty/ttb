import { supabase } from '../../db.js';

/**
 * 1. SMART CATEGORY PREDICTOR
 * Listens to Name Input -> Changes Category Dropdown
 */
export function initSmartCategory(nameInputId, categorySelectId, categories) {
    const nameInput = document.getElementById(nameInputId);
    const catSelect = document.getElementById(categorySelectId);
    
    if (!nameInput || !catSelect) return;

    // specific keywords map to help the guesser (optional manual overrides)
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
        if (text.length < 3) return; // Wait for 3 chars

        let bestMatchId = null;

        // A. Check Manual Keywords first
        for (const [key, catNameFragment] of Object.entries(keywords)) {
            if (text.includes(key)) {
                const match = categories.find(c => c.name.includes(catNameFragment));
                if (match) bestMatchId = match.id;
            }
        }

        // B. Check Category Names directly (e.g. "Rimu" -> "Timber - Rimu")
        if (!bestMatchId) {
            // Find category where category name is inside the text OR text is inside category name
            const match = categories.find(c => {
                const simpleName = c.name.toLowerCase().replace('-', ' '); // Clean up
                return text.includes(simpleName) || simpleName.includes(text);
            });
            if (match) bestMatchId = match.id;
        }

        // Apply Logic (Only if found and different)
        if (bestMatchId && catSelect.value != bestMatchId) {
            catSelect.value = bestMatchId;
            // Trigger change event so the Smart Template logic (below) fires!
            catSelect.dispatchEvent(new Event('change'));
            
            // Visual feedback (flash the border)
            catSelect.style.transition = 'border-color 0.2s';
            catSelect.style.borderColor = '#2e7d32'; // Green
            setTimeout(() => catSelect.style.borderColor = '#ccc', 1000);
        }
    });
}

/**
 * 2. SMART TEMPLATE SWITCHER
 * Listens to Category Change -> Loads Last Used Template for that Category
 */
export function initSmartTemplate(categorySelectId, templateSelectId, categories) {
    const catSelect = document.getElementById(categorySelectId);
    const tplSelect = document.getElementById(templateSelectId);

    if (!catSelect || !tplSelect) return;

    catSelect.addEventListener('change', () => {
        const catId = catSelect.value;
        const selectedCat = categories.find(c => c.id == catId);

        // If this category has a 'last_template_id' saved in DB
        if (selectedCat && selectedCat.last_template_id) {
            
            // Only switch if the template actually exists in our list
            const templateOption = tplSelect.querySelector(`option[value="${selectedCat.last_template_id}"]`);
            
            if (templateOption && tplSelect.value != selectedCat.last_template_id) {
                tplSelect.value = selectedCat.last_template_id;
                // Trigger change to actually load the layout into the editor
                tplSelect.dispatchEvent(new Event('change'));
                
                console.log(`🧠 Smart Switch: Loaded template for ${selectedCat.name}`);
            }
        }
    });
}

/**
 * 3. LEARNING LOGIC
 * When user saves an item, record which template they used for this category.
 */
export async function learnCategoryPreference(categoryId, templateId) {
    if (!categoryId || !templateId) return;

    // Update the category in the DB to remember this template
    await supabase.from('tweed_trading_categories')
        .update({ last_template_id: templateId })
        .eq('id', categoryId);
        
    console.log("🧠 Learned preference.");
}