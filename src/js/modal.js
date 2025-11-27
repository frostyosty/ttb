/// src/js/modal.js

// A generic function to replace prompt()
// Returns a Promise that resolves with the value, or null if cancelled
export function ask(title, defaultValue = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('input-modal');
        const titleEl = document.getElementById('input-modal-title');
        const inputEl = document.getElementById('input-modal-field');
        const confirmBtn = document.getElementById('input-modal-confirm');
        const cancelBtn = document.getElementById('input-modal-cancel');

        // Setup UI
        titleEl.innerText = title;
        inputEl.value = defaultValue;
        modal.classList.remove('hidden');
        inputEl.focus();

        // Cleanup function to remove listeners after use
        const cleanup = () => {
            modal.classList.add('hidden');
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            inputEl.onkeydown = null;
        };

        // Handlers
        confirmBtn.onclick = () => {
            const val = inputEl.value;
            cleanup();
            resolve(val);
        };

        cancelBtn.onclick = () => {
            cleanup();
            resolve(null);
        };

        // Allow "Enter" key to confirm
        inputEl.onkeydown = (e) => {
            if (e.key === 'Enter') confirmBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        };
    });
}