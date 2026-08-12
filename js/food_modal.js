(function () {
    function buildModal() {
        if (document.getElementById("foodModalOverlay")) return;

        const overlay = document.createElement("div");
        overlay.className = "food-modal-overlay";
        overlay.id = "foodModalOverlay";
        overlay.innerHTML =
            '<div class="food-modal" role="dialog" aria-modal="true" aria-labelledby="foodModalName">' +
            '<button class="food-modal-close" id="foodModalClose" aria-label="بستن">&#x2715;</button>' +
            '<div class="food-modal-media" id="foodModalMedia"></div>' +
            '<div class="food-modal-body">' +
            '<div class="food-modal-top">' +
            '<span class="food-modal-category" id="foodModalCategory"></span>' +
            '<div class="food-modal-badges" id="foodModalBadges"></div>' +
            "</div>" +
            '<h3 class="food-modal-name" id="foodModalName"></h3>' +
            '<p class="food-modal-desc" id="foodModalDesc"></p>' +
            '<div class="food-modal-stats">' +
            '<div class="food-modal-stat"><span id="foodModalTime"></span><label>زمان آماده‌سازی</label></div>' +
            '<div class="food-modal-stat"><span id="foodModalCal"></span><label>وزن / حجم</label></div>' +
            "</div>" +
            '<div class="food-modal-ingredients" id="foodModalIngredients"></div>' +
            '<div class="food-modal-footer">' +
            '<span class="food-modal-price" id="foodModalPrice"></span>' +
            '<button class="btn-primary" id="foodModalOrder">افزودن به سبد خرید 🛒</button>' +
            "</div>" +
            "</div>" +
            "</div>";

        document.body.appendChild(overlay);

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) closeFoodModal();
        });
        document.getElementById("foodModalClose").addEventListener("click", closeFoodModal);
    }

    let _currentFoodId = null;

    function openFoodModal(id) {
        if (!window.MENU_ITEMS) return;
        const item = window.getMenuItem
            ? window.getMenuItem(id)
            : window.MENU_ITEMS.find(function (i) { return i.id === id; });
        if (!item) return;

        _currentFoodId = id;
        buildModal();

        const media = document.getElementById("foodModalMedia");
        media.innerHTML = "";
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        img.setAttribute("data-emoji", item.emoji || "🍽️");
        img.onerror = function () {
            media.innerHTML = '<div class="food-modal-emoji">' + (item.emoji || "🍽️") + "</div>";
        };
        media.appendChild(img);

        document.getElementById("foodModalCategory").textContent  = item.category;
        document.getElementById("foodModalName").textContent      = item.name;
        document.getElementById("foodModalDesc").textContent      = item.fullDesc || item.shortDesc || "";
        document.getElementById("foodModalTime").textContent      = item.prepTime || "—";
        document.getElementById("foodModalCal").textContent       = item.weight || item.volume || "—";
        document.getElementById("foodModalPrice").textContent     = item.price + " تومان";

        const badgesWrap = document.getElementById("foodModalBadges");
        badgesWrap.innerHTML = "";
        if (item.chefPick) badgesWrap.innerHTML += '<span class="food-modal-badge pick">⭐ پیشنهاد سرآشپز</span>';
        if (item.spicy)    badgesWrap.innerHTML += '<span class="food-modal-badge spicy">🌶 تند</span>';

        const ingWrap = document.getElementById("foodModalIngredients");
        ingWrap.innerHTML = (item.ingredients || [])
            .map(function (ing) { return '<span class="food-modal-chip">' + ing + "</span>"; })
            .join("");

        const orderBtn = document.getElementById("foodModalOrder");

        orderBtn.textContent = "افزودن به سبد خرید";
        orderBtn.disabled    = false;
        orderBtn.style.background = '';

        orderBtn.onclick = function () {
            if (!window.Cart) {
                alert('سبد خرید در دسترس نیست.');
                return;
            }
            const added = window.Cart.addToCart(_currentFoodId);
            if (added === false && (!window.Auth || !window.Auth.isLoggedIn())) {
                let toast = document.getElementById('cartToast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'cartToast';
                    toast.className = 'cart-toast';
                    document.body.appendChild(toast);
                }
                toast.textContent = 'ابتدا باید وارد حساب کاربری خود شوید.';
                toast.className = 'cart-toast show red';
                clearTimeout(toast._timer);
                toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
                return;
            }
            if (added) {
                orderBtn.textContent = "اضافه شد ✓";
                orderBtn.style.background = '#2ea87c';
                setTimeout(() => {
                    closeFoodModal();
                    orderBtn.textContent = "افزودن به سبد خرید";
                    orderBtn.style.background = '';
                }, 900);
            }
        };

        document.getElementById("foodModalOverlay").classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeFoodModal() {
        const overlay = document.getElementById("foodModalOverlay");
        if (overlay) overlay.classList.remove("open");
        document.body.style.overflow = "";
        _currentFoodId = null;
    }

    document.addEventListener("click", function (e) {
        const trigger = e.target.closest && e.target.closest("[data-food-id]");
        if (trigger) {
            e.preventDefault();
            openFoodModal(trigger.getAttribute("data-food-id"));
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeFoodModal();
    });

    window.openFoodModal  = openFoodModal;
    window.closeFoodModal = closeFoodModal;
})();

/*  fullscreen image  */
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function (e) {
        const img = e.target.closest(".food-modal-media img");
        if (img) { e.stopPropagation(); openFullscreenImage(img.src, img.alt); }
    });
});

function openFullscreenImage(src, alt) {
    const existing = document.getElementById("fullscreenImageOverlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "fullscreenImageOverlay";
    overlay.className = "fullscreen-image-overlay";
    overlay.innerHTML = `
        <button class="fullscreen-close" id="fullscreenClose" aria-label="بستن">✕</button>
        <img src="${src}" alt="${alt || 'تصویر غذا'}" class="fullscreen-image" />
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay || e.target.id === "fullscreenClose") closeFullscreenImage();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeFullscreenImage();
    });
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => overlay.classList.add("open"));
}

function closeFullscreenImage() {
    const overlay = document.getElementById("fullscreenImageOverlay");
    if (overlay) {
        overlay.classList.remove("open");
        setTimeout(() => { overlay.remove(); document.body.style.overflow = ""; }, 300);
    }
}

window.openFullscreenImage  = openFullscreenImage;
window.closeFullscreenImage = closeFullscreenImage;