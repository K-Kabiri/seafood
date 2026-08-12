let MENU_ITEMS = [];
let dataLoaded = false;

async function loadFoodData() {
    try {
        const response = await fetch('data/foods.json');
        if (!response.ok) throw Error(response.statusText);
        const data = await response.json();
        MENU_ITEMS = data.items || [];
        window.MENU_ITEMS = MENU_ITEMS;
        dataLoaded = true;
        return MENU_ITEMS;
    } catch (error) {
        MENU_ITEMS = [];
        window.MENU_ITEMS = MENU_ITEMS;
        dataLoaded = true;
        return MENU_ITEMS;
    }
}
function getMenuItem(id) {
    return MENU_ITEMS.find(item => item.id === id);
}

function getMenuItemsByCategory(category) {
    if (!category || category === "همه") return MENU_ITEMS.slice();
    return MENU_ITEMS.filter(item => item.category === category);
}

function searchMenuItems(query) {
    if (!query || query.trim() === '') return MENU_ITEMS.slice();
    const q = query.trim().toLowerCase();
    return MENU_ITEMS.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.fullDesc.toLowerCase().includes(q)
    );
}

function handleFoodImgError(imgEl) {
    const emoji = imgEl.getAttribute('data-emoji') || '🍽️';
    const wrap = imgEl.parentElement;
    if (wrap) {
        wrap.innerHTML = '<span class="menu-card-emoji">' + emoji + '</span>';
    }
}

window.MENU_ITEMS = MENU_ITEMS;
window.getMenuItem = getMenuItem;
window.getMenuItemsByCategory = getMenuItemsByCategory;
window.searchMenuItems = searchMenuItems;
window.loadFoodData = loadFoodData;
window.handleFoodImgError = handleFoodImgError;