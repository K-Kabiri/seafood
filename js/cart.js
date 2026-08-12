/* Parse price of items */
function _parsePrice(raw) {
    if (typeof raw === 'number') return raw;
    const cleaned = String(raw)
        .replace(/[,،\s]/g, '')
        .replace(/تومان/g, '')
        .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    return parseInt(cleaned, 10) || 0;
}

/* Key for cart of current user  */
function _cartKey() {
    const user = window.Auth && window.Auth.getCurrentUser();
    return user ? `darya_cart_${user.id}` : null;
}

function getCartItems() {
    const key = _cartKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
}

function _saveCart(items) {
    const key = _cartKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(items));
    _updateBadge();
}

/* Badge counter on header */
function _updateBadge() {
    const total = getCartItems().reduce((s, i) => s + i.qty, 0);
    const toFa  = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    document.querySelectorAll('.cart-badge, .cart-badge-mobile').forEach(el => {
        el.textContent = toFa(total);
    });
}

document.addEventListener('DOMContentLoaded', _updateBadge);

/* Add item */
function addToCart(foodId) {
    if (!window.Auth || !window.Auth.isLoggedIn()) {
        showCartToast('ابتدا باید وارد حساب کاربری خود شوید و بعد سفارش به سبد خرید اضافه کنید.', 'red');
        return false;
    }

    const item = window.MENU_ITEMS && window.MENU_ITEMS.find(i => i.id === foodId);
    if (!item) return false;

    const cart   = getCartItems();
    const exists = cart.find(c => c.id === foodId);
    if (exists) {
        exists.qty += 1;
    } else {
        cart.push({
            id:        item.id,
            name:      item.name,
            category:  item.category,
            price:     _parsePrice(item.price),
            image:     item.image,
            emoji:     item.emoji || '🍽️',
            shortDesc: item.shortDesc || '',
            qty:       1,
        });
    }
    _saveCart(cart);
    showCartToast(`«${item.name}» به سبد خرید اضافه شد ✓`, 'green');
    return true;
}

/* Change number of items */
function changeQty(foodId, delta) {
    const cart = getCartItems();
    const idx  = cart.findIndex(c => c.id === foodId);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    _saveCart(cart);
    typeof renderCart === 'function' && renderCart();
}

/* Delete item */
function removeFromCart(foodId) {
    _saveCart(getCartItems().filter(c => c.id !== foodId));
    typeof renderCart === 'function' && renderCart();
}

/* Toast */
function showCartToast(msg, type = 'green') {
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className   = `cart-toast show ${type}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

window.Cart = { addToCart, getCartItems, changeQty, removeFromCart, showCartToast };

/* Html code for cart page */
(function initCartPage() {
    if (!document.getElementById('cartList')) return;

    const COUPONS = { 'DARYA10': 10, 'WELCOME': 15, 'SEA20': 20 };
    let activeCoupon = null;
    let activeMethod = 'dine-in';

    const cartList     = document.getElementById('cartList');
    const cartEmpty    = document.getElementById('cartEmpty');
    const cartCount    = document.getElementById('cartCount');
    const subtotalEl   = document.getElementById('subtotalVal');
    const serviceFeeEl = document.getElementById('serviceFeeVal');
    const discountRow  = document.getElementById('discountRow');
    const discountEl   = document.getElementById('discountVal');
    const totalEl      = document.getElementById('totalVal');
    const checkoutBtn  = document.getElementById('checkoutBtn');
    const couponInput  = document.getElementById('couponInput');
    const couponBtn    = document.getElementById('couponBtn');
    const couponMsg    = document.getElementById('couponMsg');
    const cartSummary  = document.getElementById('cartSummary');
    const continueShopping= document.getElementById('continueShopping');

    /* If user is not login */
    if (!window.Auth || !window.Auth.isLoggedIn()) {
        if (cartList)   cartList.innerHTML = '';
        if (cartEmpty)  cartEmpty.classList.add('show');
        if (cartSummary) cartSummary.style.display = 'none';
        if (continueShopping)  continueShopping.style.display = 'none';
        if (cartCount)  cartCount.innerHTML =
            'برای مشاهده سبد خرید ابتدا <a href="../login.html" style="color:var(--ocean-deep);font-weight:700;">وارد شوید</a>';
        return;
    }

    const toFa  = n => String(Math.round(n)).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    const fmt   = n => toFa(n).replace(/\B(?=(\d{3})+(?!\d))/g, '٬');

    /* Cart rendering */
    window.renderCart = function () {
        const cart = getCartItems();

        if (cartCount) {
            cartCount.innerHTML = cart.length
                ? `<strong>${toFa(cart.length)}</strong> آیتم در سبد شما`
                : 'سبد خرید شما خالی است';
        }

        if (cart.length === 0) {
            cartList.innerHTML = '';
            cartEmpty.classList.add('show');
            if (continueShopping)  continueShopping.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            return;
        }

        cartEmpty.classList.remove('show');
        if (cartSummary) cartSummary.style.display = '';

        cartList.innerHTML = cart.map(item => {
            const price     = _parsePrice(item.price);
            const linePrice = price * item.qty;
            return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}"
                         onerror="this.parentElement.innerHTML='<span style=font-size:2rem>${item.emoji}</span>'"
                         style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-cat">${item.category}</div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-desc">${item.shortDesc}</div>
                </div>
                <div class="cart-item-ctrl">
                    <div class="cart-item-price">
                        ${fmt(linePrice)} <small>تومان</small>
                    </div>
                    <div class="qty-ctrl">
                        <button class="qty-btn remove-btn" data-action="dec" data-id="${item.id}">−</button>
                        <span class="qty-num">${toFa(item.qty)}</span>
                        <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item-delete" data-action="del" data-id="${item.id}" title="حذف">🗑</button>
                </div>
            </div>`;
        }).join('');

        updateSummary(cart);
    };

    function updateSummary(cart) {
        const subtotal   = cart.reduce((s, i) => s + _parsePrice(i.price) * i.qty, 0);
        const serviceFee = activeMethod === 'delivery' ? 25000 : 0;
        const discount   = activeCoupon ? Math.round(subtotal * COUPONS[activeCoupon] / 100) : 0;
        const total      = subtotal + serviceFee - discount;

        subtotalEl.textContent   = fmt(subtotal)   + ' تومان';
        serviceFeeEl.textContent = serviceFee > 0 ? fmt(serviceFee) + ' تومان' : 'رایگان';

        if (discount > 0) {
            discountRow.style.display = '';
            discountEl.textContent    = '- ' + fmt(discount) + ' تومان';
        } else {
            discountRow.style.display = 'none';
        }
        totalEl.textContent = fmt(total) + ' تومان';
    }

    /* ── event delegation ── */
    cartList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.action === 'inc') changeQty(id, +1);
        if (btn.dataset.action === 'dec') changeQty(id, -1);
        if (btn.dataset.action === 'del') {
            removeFromCart(id);
            showCartToast('آیتم از سبد خرید حذف شد.', 'red');
        }
    });

    /* Delivery method */
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeMethod = btn.dataset.method;
            updateSummary(getCartItems());
        });
    });

    /* Discount codes */
    couponBtn && couponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        couponMsg.className = 'coupon-msg';
        if (COUPONS[code]) {
            activeCoupon = code;
            couponInput.classList.replace('invalid','valid') || couponInput.classList.add('valid');
            couponMsg.textContent = `کد تخفیف ${COUPONS[code]}٪ اعمال شد ✓`;
            couponMsg.classList.add('ok');
        } else {
            activeCoupon = null;
            couponInput.classList.replace('valid','invalid') || couponInput.classList.add('invalid');
            couponMsg.textContent = 'کد تخفیف نامعتبر است.';
            couponMsg.classList.add('err');
        }
        updateSummary(getCartItems());
    });

    /* Payment */
    checkoutBtn && checkoutBtn.addEventListener('click', () => {
        const cart = getCartItems();
        if (!cart.length) { showCartToast('سبد خرید شما خالی است.', 'red'); return; }

        const subtotal   = cart.reduce((s, i) => s + _parsePrice(i.price) * i.qty, 0);
        const serviceFee = activeMethod === 'delivery' ? 25000 : 0;
        const discount   = activeCoupon ? Math.round(subtotal * COUPONS[activeCoupon] / 100) : 0;
        const total      = subtotal + serviceFee - discount;
        const methodNames = { 'dine-in': 'داخل رستوران', 'takeaway': 'بیرون‌بر', 'delivery': 'ارسال' };

        showOrderConfirm({ cart, method: methodNames[activeMethod], discount, coupon: activeCoupon, serviceFee, total });
    });

    /* Final verification  */
    function showOrderConfirm({ cart, method, discount, coupon, serviceFee, total }) {
        document.getElementById('orderConfirmOverlay')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'orderConfirmOverlay';
        overlay.style.cssText = `
            position:fixed;inset:0;z-index:2000;
            background:rgba(0,30,40,.6);backdrop-filter:blur(4px);
            -webkit-backdrop-filter:blur(4px);
            display:flex;align-items:center;justify-content:center;
            padding:5vw;font-family:var(--font);
        `;

        overlay.innerHTML = `
        <div style="
            background:var(--cream);border-radius:28px;
            max-width:520px;width:100%;
            max-height:88vh;
            display:flex;flex-direction:column;
            box-shadow:0 30px 80px rgba(0,0,0,.35);
            overflow:hidden;
            position:relative;
        ">
            <button id="confirmCloseBtn" style="
                position:absolute;top:16px;left:16px;
                width:38px;height:38px;border-radius:50%;border:none;
                background:rgba(255,255,255,.85);color:var(--ocean-deep);
                font-size:1.1rem;line-height:1;cursor:pointer;z-index:2;
                display:flex;align-items:center;justify-content:center;
                transition:background .2s,color .2s;
            ">✕</button>

            <div style="
                padding:1.6rem 1.8rem 1rem;
                border-bottom:1px solid rgba(66,90,97,.18);
                flex-shrink:0;text-align:center;
            ">
                <div style="font-size:2.5rem;margin-bottom:.5rem;">🧾</div>
                <h2 style="font-size:1.3rem;font-weight:900;color:var(--ocean-deep);margin:0 0 .2rem;">تأیید سفارش</h2>
                <p style="font-size:.85rem;color:var(--ocean-deep-light);margin:0;">خلاصه سفارش شما را مرور کنید</p>
            </div>

            <div style="
                flex:1;overflow-y:auto;
                padding:1.4rem 1.8rem;
                direction:ltr;
                scrollbar-width:thin;
            ">
                <div style="direction:rtl;">

                    <!-- items -->
                    <div style="background:var(--white);border-radius:14px;padding:1rem 1.2rem;margin-bottom:1rem;">
                        <div style="font-size:.8rem;color:var(--ocean-deep-light);margin-bottom:.75rem;font-weight:600;">آیتم‌های سفارش</div>
                        ${cart.map(i => `
                            <div style="display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--cream-dark);font-size:.85rem;">
                                <span style="color:var(--text-dark);">${i.name}
                                    <span style="color:var(--teal);">×${toFa(i.qty)}</span>
                                </span>
                                <span style="font-weight:700;color:var(--ocean-deep);">${fmt(_parsePrice(i.price)*i.qty)} تومان</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- total -->
                    <div style="background:var(--white);border-radius:14px;padding:1rem 1.2rem;margin-bottom:1rem;font-size:.85rem;">
                        <div style="display:flex;justify-content:space-between;padding:.35rem 0;color:var(--ocean-deep-light);">
                            <span>روش تحویل</span><span style="font-weight:600;">${method}</span>
                        </div>
                        ${coupon ? `<div style="display:flex;justify-content:space-between;padding:.35rem 0;color:#2ea87c;">
                            <span>تخفیف (${coupon})</span><span style="font-weight:600;">- ${fmt(discount)} تومان</span>
                        </div>` : ''}
                        ${serviceFee > 0 ? `<div style="display:flex;justify-content:space-between;padding:.35rem 0;color:var(--ocean-deep-light);">
                            <span>هزینه ارسال</span><span style="font-weight:600;">${fmt(serviceFee)} تومان</span>
                        </div>` : ''}
                        <div style="display:flex;justify-content:space-between;padding:.5rem 0 0;border-top:2px solid var(--cream-dark);margin-top:.35rem;font-weight:900;color:var(--ocean-deep);font-size:1rem;">
                            <span>مبلغ قابل پرداخت</span><span>${fmt(total)} تومان</span>
                        </div>
                    </div>

                    <div style="background:rgba(13,179,179,.08);border:1px solid rgba(13,179,179,.2);border-radius:12px;padding:.9rem 1rem;font-size:.82rem;color:var(--ocean-deep-light);text-align:center;">
                        🔒 اتصال به درگاه پرداخت به زودی فعال می‌شود
                    </div>

                </div>
            </div>

            <div style="
                padding:1.2rem 1.8rem;
                border-top:1px solid rgba(66,90,97,.18);
                display:flex;gap:.75rem;flex-shrink:0;
            ">
                <button id="confirmCancelBtn" style="
                    flex:1;padding:.85rem;border:2px solid var(--cream-dark);
                    background:transparent;border-radius:12px;
                    font-size:.9rem;font-weight:700;
                    color:var(--ocean-deep-light);cursor:pointer;
                ">انصراف</button>
                <button id="confirmPayBtn" style="
                    flex:2;padding:.85rem;background:var(--ocean-deep);color:var(--white);
                    border:none;border-radius:12px;
                    font-size:.9rem;font-weight:700;cursor:pointer;
                    transition:background .2s;
                ">تأیید و ادامه به پرداخت 🔒</button>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const close = () => {
            overlay.remove();
            document.body.style.overflow = '';
        };

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.getElementById('confirmCloseBtn').addEventListener('click', close);
        document.getElementById('confirmCancelBtn').addEventListener('click', close);
        document.getElementById('confirmPayBtn').addEventListener('click', () => {
            close();
            showCartToast('درگاه پرداخت به زودی متصل می‌شود 🔒', 'green');
        });
    }

    renderCart();
    _updateBadge();
})();