import { supabase } from '../../db.js';
import { learnCategoryPreference } from './smartFeatures.js'; // 👈 Smart Feature

export async function handleInventorySubmit(e, editor) {
    e.preventDefault();
    
    // Check if we should print based on which button was clicked
    const shouldPrint = e.target.dataset.print !== "false"; 
    
    const btns = document.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);

    try {
        const name = document.getElementById('p-name').value;
        const price = document.getElementById('p-price').value;
        const catId = document.getElementById('p-cat').value || null;
        const stock = document.getElementById('p-stock').value;
        const file = document.getElementById('p-image').files[0];
        const templateId = document.getElementById('p-template-loader').value; // For smart learning
        
        const sku = 'TWD-' + Math.floor(100000 + Math.random() * 900000);

        // 1. Upload Image
        let imageUrl = null;
        if (file) {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const { data } = await supabase.storage.from('tweed_trading_assets').upload(fileName, file);
            if (data) imageUrl = `https://oannlpewujcnmbzzvklu.supabase.co/storage/v1/object/public/tweed_trading_assets/${fileName}`;
        }

        // 2. Insert into DB
        const { error } = await supabase.from('tweed_trading_products').insert({
            name, price, category_id: catId, sku, 
            image_url: imageUrl, stock_level: stock,
            is_printed: shouldPrint
        });

        if (error) throw error;

        // 3. 🧠 SMART LEARN: Remember that this category likes this template
        if (catId && templateId) {
            learnCategoryPreference(catId, templateId);
        }

        // 4. Print Logic
        if (shouldPrint && editor) {
            // Pass the data to the editor to print exactly what is seen
            await editor.print({ name, price, sku, image_url: imageUrl });
        } else {
            alert("Saved to Inventory (Not Printed)");
        }

        // 5. Reset UI
        e.target.reset();
        if(editor) editor.refresh();
        document.getElementById('p-name')?.focus();

    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btns.forEach(b => b.disabled = false);
    }
}