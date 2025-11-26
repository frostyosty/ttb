/// src/js/state.js
export const state = {
    items: [],
    currentPage: 'home', // Default page
    isDevMode: false,
    clickCount: 0
};

export function setItems(newItems) {
    state.items = newItems;
}

export function setPage(pageName) {
    state.currentPage = pageName;
}

export function toggleDevMode() {
    state.isDevMode = !state.isDevMode;
    return state.isDevMode;
}