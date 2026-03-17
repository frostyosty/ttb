import { supabase } from '../../../db.js';
import { learnCategoryPreference } from './smartFeatures.js';
import { saveToOfflineQueue } from './offlineQueue.js'; // 👈 Import new queue
import { showPosToast } from '../ui/posModals.js';

export async function handleInventorySubmit(e, editor) {
    e.preventDefault();
    const shouldPrint = e.target.dataset.print !== "false"; 
    const btns = document.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);

    try {
        const name = document.getElementById('p-name').value;
        const price = document.getElementById('p-price').value;
        const catId = document.getElementById('p-cat').value || null;
        const stock = document.getElementById('p-stock').value;
        const file = document.getElementById('p-image').files[0];
        const templateId = document.getElementById('p-template-loader').value;
        const sku = 'TWD-' + Math.floor(100000 + Math.random() * 900000);

        // 🌲 OFFLINE MODE INTERCEPTION
        if (!navigator.onLine) {
            showPosToast("Offline: Saving to local device...", "success");
            
            // Save to IndexedDB
            await saveToOfflineQueue({
                name, price, category_id: catId, sku, stock_level: stock, is_printed: shouldPrint
            }, file);

            // We still print! The blob URL is in the editor memory
            if (shouldPrint && editor) {
                // If a photo was taken, grab the local preview URL to print it
                const localImageUrl = file ? document.getElementById('p-image').dataset.previewUrl : null;
                await editor.print({ name, price, sku, image_url: localImageUrl });
            }

            e.target.reset();
            if(editor) editor.refresh();
            document.getElementById('p-name')?.focus();
            return; // Stop here. Do not attempt Supabase upload.
        }

        // --- ONLINE MODE (Proceed as normal) ---
        let imageUrl = null;
        if (file) {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
            const { error: uploadError } = await supabase.storage.from('tweed_trading_assets').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('tweed_trading_assets').getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        }

        const { error } = await supabase.from('tweed_trading_products').insert({
            name, price, category_id: catId, sku, 
            image_url: imageUrl, stock_level: stock, is_printed: shouldPrint
        });

        if (error) throw error;
        if (catId && templateId) learnCategoryPreference(catId, templateId);

        if (shouldPrint && editor) {
            await editor.print({ name, price, sku, image_url: imageUrl });
        } else {
            showPosToast("Saved to Inventory");
        }

        e.target.reset();
        if(editor) editor.refresh();
        document.getElementById('p-name')?.focus();

    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btns.forEach(b => b.disabled = false);
    }
}