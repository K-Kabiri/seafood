/* ----- menu ----- */
let currentCategory = 'همه';
let currentSearch = '';

const menuGrid = document.getElementById('menuGrid');
const menuEmpty = document.getElementById('menuEmpty');
const tabs = document.querySelectorAll('.category-tabs .tab');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function cardTemplate(item) {
    return `
        <div class="menu-card" data-category="${item.category}" data-id="${item.id}">
            <div class="menu-card-img">
                <img src="${item.image}" alt="${item.name}" data-emoji="${item.emoji}" onerror="window.handleFoodImgError(this)">
            </div>
            <div class="menu-card-body">
                <div class="menu-card-category">${item.category}</div>
                <div class="menu-card-name">${item.name}</div>
                <div class="menu-card-desc">${item.shortDesc}</div>
                <div class="menu-card-footer">
                    <span class="menu-card-price">${item.price} تومان</span>
                    <button class="btn-details" data-food-id="${item.id}">جزئیات</button>
                </div>
            </div>
        </div>`;
}

function renderMenu() {
    let filtered = getMenuItemsByCategory(currentCategory);

    if (currentSearch.trim() !== '') {
        filtered = searchMenuItems(currentSearch);
        if (currentCategory !== 'همه') {
            filtered = filtered.filter(item => item.category === currentCategory);
        }
    }

    if (filtered.length === 0) {
        menuGrid.innerHTML = '';
        menuEmpty.style.display = 'block';
        menuEmpty.textContent = currentSearch.trim() !== ''
            ? 'نتیجه‌ای برای جستجوی شما یافت نشد :('
            : 'آیتمی در این دسته‌بندی وجود ندارد :(';
        return;
    }

    menuGrid.innerHTML = filtered.map(cardTemplate).join('');
    menuEmpty.style.display = 'none';
}

function setActiveTab(category) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.cat === category));
    currentCategory = category;
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const category = tab.dataset.cat;
        setActiveTab(category);
        renderMenu();
    });
});

function handleSearch() {
    if (searchInput) {
        currentSearch = searchInput.value.trim();
        renderMenu();
    }
}

if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
}

if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// load foods
async function initMenu() {
    await loadFoodData();
    renderMenu();
}
document.addEventListener('DOMContentLoaded', initMenu);