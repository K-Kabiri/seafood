/* ----- menu ----- */
let currentCategory = 'همه';

const menuGrid = document.getElementById('menuGrid');
const menuEmpty = document.getElementById('menuEmpty');
const tabs = document.querySelectorAll('.menu-preview .category-tabs .tab');

function cardTemplate(item) {
    return `
        <div class="menu-card" data-category="${item.category}" data-id="${item.id}">
            <div class="menu-card-img">
                <img src="${item.image}" alt="${item.name}" data-emoji="${item.emoji || '🍽️'}" onerror="window.handleFoodImgError(this)">
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

function renderLandingMenu() {
    let filtered = getMenuItemsByCategory(currentCategory);
    filtered = filtered.slice(0, 4);
    if (filtered.length === 0) {
        if (menuGrid) menuGrid.innerHTML = '';
        if (menuEmpty) menuEmpty.style.display = 'block';
        return;
    }

    if (menuGrid) {
        menuGrid.innerHTML = filtered.map(cardTemplate).join('');
    }
    if (menuEmpty) {
        menuEmpty.style.display = 'none';
    }
}

function setActiveTab(category) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.cat === category));
    currentCategory = category;
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const category = tab.dataset.cat || tab.textContent.trim();
        setActiveTab(category);
        renderLandingMenu();
    });
});


/* ----- Chef Special ----- */

function renderChefSpecial(items) {
    const track = document.getElementById('peekTrack');
    const dotsContainer = document.getElementById('peekDots');

    if (!track) {
        console.warn('⚠️ Not found!');
        return;
    }

    const chefItems = items.filter(item => item.chefPick === true);

    if (chefItems.length === 0) {
        track.innerHTML = '<p style="text-align:center;color:var(--ocean-deep-light);padding:2rem;">هیچ پیشنهاد ویژه‌ای وجود ندارد</p>';
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }

    const displayItems = chefItems.slice(0, 5);
    track.innerHTML = displayItems.map((item, index) => {
        let positionClass = 'far';
        if (index === 2) positionClass = 'active';
        else if (index === 1 || index === 3) positionClass = 'near';

        return `
            <div class="peek-item ${positionClass}" data-i="${index}">
                <div class="peek-circle">
                    <img src="${item.image}" alt="${item.name}" data-emoji="${item.emoji || '🍽️'}" onerror="this.parentElement.innerHTML = '<span style=\\'font-size:4rem;\\'>${item.emoji || '🍽️'}</span>'">
                </div>
                <div class="peek-info">
                    <div class="peek-name">${item.name}</div>
                    <div class="peek-desc">${item.shortDesc}</div>
                    <div class="peek-price">${item.price} تومان</div>
                    <button class="peek-order" data-food-id="${item.id}">جزئیات</button>
                </div>
            </div>
        `;
    }).join('');

    if (dotsContainer) {
        dotsContainer.innerHTML = displayItems.map((_, index) => {
            const activeClass = index === 2 ? 'active' : '';
            return `<div class="peek-dot ${activeClass}"></div>`;
        }).join('');
    }
    initPeekSlider();
}

function initPeekSlider() {
    const slider = document.querySelector('.peek-slider');
    const track = document.getElementById('peekTrack');
    const items = document.querySelectorAll('.peek-item');
    const dots = document.querySelectorAll('.peek-dot');

    if (!items.length || !track || !slider) return;

    let cur = 2;

    function centerActiveItem() {
        const activeItem = track.querySelector('.peek-item.active');
        if (!activeItem) return;

        const sliderRect = slider.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();

        const itemCenter = itemRect.left + itemRect.width / 2;
        const sliderCenter = sliderRect.left + sliderRect.width / 2;
        const diff = sliderCenter - itemCenter;

        const matrix = getComputedStyle(track).transform;
        let currentX = 0;
        if (matrix && matrix !== 'none') {
            const values = matrix.match(/matrix\(([^)]+)\)/);
            if (values) currentX = parseFloat(values[1].split(',')[4]) || 0;
        }
        track.style.transform = `translateX(${currentX + diff}px)`;
    }

    function updatePeek(newIdx) {
        items.forEach((item, i) => {
            const diff = i - newIdx;
            item.classList.remove('active', 'near', 'far');
            if (diff === 0) item.classList.add('active');
            else if (Math.abs(diff) === 1) item.classList.add('near');
            else item.classList.add('far');
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === newIdx));
        cur = newIdx;
        centerActiveItem();
    }

    const nextBtn = document.getElementById('peekNext');
    const prevBtn = document.getElementById('peekPrev');

    if (nextBtn) {
        nextBtn.replaceWith(nextBtn.cloneNode(true));
        document.getElementById('peekNext').addEventListener('click', () =>
            updatePeek(Math.min(cur + 1, items.length - 1))
        );
    }
    if (prevBtn) {
        prevBtn.replaceWith(prevBtn.cloneNode(true));
        document.getElementById('peekPrev').addEventListener('click', () =>
            updatePeek(Math.max(cur - 1, 0))
        );
    }

    dots.forEach((d, i) => {
        d.replaceWith(d.cloneNode(true));
        document.querySelectorAll('.peek-dot')[i].addEventListener('click', () => updatePeek(i));
    });

    items.forEach((item, i) => {
        const circle = item.querySelector('.peek-circle');
        if (circle) {
            circle.replaceWith(circle.cloneNode(true));
            item.querySelector('.peek-circle').addEventListener('click', () => updatePeek(i));
        }
    });

    document.querySelectorAll('.peek-order').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const foodId = this.dataset.foodId;
            if (foodId && typeof openFoodModal === 'function') {
                openFoodModal(foodId);
            }
        });
    });

    setTimeout(() => {
        track.style.transform = 'translateX(0px)';
        centerActiveItem();
    }, 100);

    window.addEventListener('resize', () => {
        track.style.transform = 'translateX(0px)';
        centerActiveItem();
    });
}
/* ----- gallery ----- */
(function() {
    const thumbs = document.querySelectorAll('.fan-thumb');
    if (!thumbs.length) return;

    const fanData = [
        { img: 'images/gallery-1.jpg', title: 'فضای داخلی',     sub: 'طراحی الهام‌گرفته از اعماق دریا — نور آبی، صدای امواج و عطر غذای تازه.',             num: '۱' },
        { img: 'images/gallery-2.jpg', title: 'تراس رو‌باز',    sub: 'غروب آفتاب، نسیم دریا و میزی با دیدی بی‌نظیر — تجربه‌ای که فراموش نمی‌شود.',         num: '۲' },
        { img: 'images/gallery-3.jpg', title: 'آشپزخانه باز',   sub: 'آشپزان ما با افتخار فرایند پخت را به نمایش می‌گذارند — تازگی تضمین‌شده.',             num: '۳' },
    ];

    function setFan(idx) {
        thumbs.forEach((t, i) => t.classList.toggle('active-t', i === idx));
        const frontImg = document.getElementById('fanFrontImg');
        if (frontImg) frontImg.src = fanData[idx].img;
        document.getElementById('fanTitle').textContent = fanData[idx].title;
        document.getElementById('fanSub').textContent   = fanData[idx].sub;
        document.getElementById('fanNum').textContent   = fanData[idx].num;
    }

    thumbs.forEach((t, i) => t.addEventListener('click', () => setFan(i)));
})();

// load foods
async function initLanding() {
    await loadFoodData();
    renderLandingMenu();
    renderChefSpecial(window.MENU_ITEMS);

}
document.addEventListener('DOMContentLoaded', initLanding);