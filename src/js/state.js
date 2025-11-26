/// public/js/state.js
export const state = {
    items: [],       // The array of website elements
    isDevMode: false,
    clickCount: 0
};

// Helper to update items
export function setItems(newItems) {
    state.items = newItems;
}

export function toggleDevMode() {
    state.isDevMode = !state.isDevMode;
    return state.isDevMode;
}