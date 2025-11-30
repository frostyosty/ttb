/// src/js/imageManager.js
import { state } from './state.js';
import { supabase } from './db.js'; 
import { render } from './renderer.js';

let currentCarouselIndex = null;
let tempImageList = [];

export function openImageManager(index) {
    currentCarouselIndex = index;
    const item = state.items[index];
    
    // Load existing images from metadata
    tempImageList = item.metadata && item.metadata.images ? [...item.metadata.images] : [];
    
    renderImageTable();
    
    const modal = document.getElementById('image-modal');
    modal.classList.remove('hidden');

    // Attach Listeners
    document.getElementById('close-images').onclick = () => modal.classList.add('hidden');
    
    // --- 🔒 DISABLED UPLOAD BUTTON ---
    document.getElementById('btn-upload-img').onclick = () => {
        alert("SECURITY: Client-side uploads are disabled.\n\nPlease upload images to the Supabase 'assets' bucket manually, then add the URL to the database.");
        // document.getElementById('img-upload-input').click(); // <--- DISABLED
    };
    
    document.getElementById('img-upload-input').onchange = handleUpload;
    
    // SAVE (Still works for reordering/categorizing existing images)
    document.getElementById('btn-save-images').onclick = () => {
        if (!state.items[currentCarouselIndex].metadata) {
            state.items[currentCarouselIndex].metadata = {};
        }
        state.items[currentCarouselIndex].metadata.images = tempImageList;
        
        // Trigger Auto-Save
        render();
        document.dispatchEvent(new Event('app-render-request'));
        modal.classList.add('hidden');
    };
}

function renderImageTable() {
    const tbody = document.getElementById('images-list');
    tbody.innerHTML = '';

    if (tempImageList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="padding:20px; text-align:center;">No images in metadata. Add via Database.</td></tr>';
        return;
    }

    tempImageList.forEach((img, idx) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        tr.className = 'image-row';
        tr.draggable = true; // Drag to reorder

        // 1. Thumbnail
        const thumb = `<img src="${img.url}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">`;

        // 2. Category Select
        const catSelect = `
            <select class="cat-select" data-idx="${idx}" style="padding:8px; width:100%;">
                <option value="doors" ${img.category === 'doors' ? 'selected' : ''}>Doors</option>
                <option value="windows" ${img.category === 'windows' ? 'selected' : ''}>Windows</option>
                <option value="handles" ${img.category === 'handles' ? 'selected' : ''}>Handles</option>
                <option value="electrical" ${img.category === 'electrical' ? 'selected' : ''}>Electrical</option>
                <option value="tiles" ${img.category === 'tiles' ? 'selected' : ''}>Tiles</option>
            </select>
        `;

        // 3. Delete (Removes from list, not storage)
        const delBtn = `<button class="img-del-btn" data-idx="${idx}" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>`;

        tr.innerHTML = `
            <td style="padding:10px;">${thumb}</td>
            <td style="padding:10px;">${catSelect}</td>
            <td style="padding:10px;">${delBtn}</td>
        `;
        
        // Drag Logic
        tr.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', idx); });
        tr.addEventListener('dragover', e => { e.preventDefault(); }); // Allow drop
        tr.addEventListener('drop', e => {
            e.preventDefault();
            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
            const toIdx = idx;
            // Swap items
            const item = tempImageList.splice(fromIdx, 1)[0];
            tempImageList.splice(toIdx, 0, item);
            renderImageTable();
        });

        tbody.appendChild(tr);
    });

    // Listeners for inputs
    document.querySelectorAll('.cat-select').forEach(sel => {
        sel.addEventListener('change', e => {
            tempImageList[e.target.dataset.idx].category = e.target.value;
        });
    });

    document.querySelectorAll('.img-del-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = e.target.closest('button').dataset.idx;
            tempImageList.splice(idx, 1);
            renderImageTable();
        });
    });
}

// 🔒 DISABLED UPLOAD HANDLER
async function handleUpload(e) {
    alert("Uploads Disabled.");
    return;
    
    /* 
    // OLD UPLOAD LOGIC (Commented out for security)
    const files = e.target.files;
    if (!files.length) return;

    for (let file of files) {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { data, error } = await supabase.storage.from('assets').upload(fileName, file);

        if (!error) {
            const publicUrl = `${supabase.storageUrl}/object/public/assets/${fileName}`;
            tempImageList.push({ url: publicUrl, category: 'doors' });
        }
    }
    renderImageTable();
    */
}