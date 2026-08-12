/* ----- scroll header ----- */
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

/* ----- header tabs ----- */
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

/* ----- hamburger menu ----- */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav    = document.getElementById('mobileNav');
const navOverlay   = document.getElementById('navOverlay');

function openMobileNav() {
    hamburgerBtn.classList.add('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    navOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    hamburgerBtn.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    navOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
}

function setActiveNav(anchor) {
    document.querySelectorAll('.mobile-nav li').forEach(li => li.classList.remove('active-item'));
    anchor.closest('li').classList.add('active-item');
}

hamburgerBtn.addEventListener('click', () => {
    mobileNav.classList.contains('is-open') ? closeMobileNav() : openMobileNav();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileNav();
});

/* ----- Update account button on header ----- */

function updateAuthHeader() {
    if (typeof window.Auth === 'undefined') return;

    const user = window.Auth.getCurrentUser();

    /* Desktop */
    const accountBtn = document.querySelector('.header-icons .icon-btn[aria-label="حساب کاربری"]');
    if (accountBtn) {
        const oldWrap = document.getElementById('authBtnWrap');
        if (oldWrap) {
            oldWrap.parentElement.insertBefore(accountBtn, oldWrap);
            oldWrap.remove();
        }
        document.getElementById('authDropdown')?.remove();
        accountBtn.style.background   = '';
        accountBtn.style.borderRadius = '';

        if (!user) {
            accountBtn.setAttribute('href', 'login.html');
            accountBtn.querySelector('svg').innerHTML = `
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            `;
        } else {
            accountBtn.removeAttribute('href');
            accountBtn.style.background   = 'rgba(13,179,179,.3)';
            accountBtn.style.borderRadius = '50%';
            accountBtn.querySelector('svg').innerHTML = `
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <polyline points="9 11 11 13 15 9" stroke-width="2.2"/>
            `;

            const wrap = document.createElement('div');
            wrap.id = 'authBtnWrap';
            wrap.style.cssText = 'position:relative;display:inline-flex;';
            accountBtn.parentElement.insertBefore(wrap, accountBtn);
            wrap.appendChild(accountBtn);

            const dd = document.createElement('div');
            dd.id = 'authDropdown';
            dd.style.cssText = `
                display:none;position:absolute;top:calc(100% + 10px);left:0;
                min-width:180px;background:white;border-radius:12px;
                padding:.75rem 1rem;box-shadow:0 8px 24px rgba(0,0,0,.15);
                z-index:300;flex-direction:column;gap:.4rem;
            `;
            dd.innerHTML = `
                <strong style="display:block;font-size:.88rem;color:var(--ocean-deep);">${user.name}</strong>
                <span style="font-size:.75rem;color:var(--ocean-deep-light);">@${user.username}</span>
                <hr style="border:none;border-top:1px solid var(--cream-dark);margin:.5rem 0"/>
                <button id="headerLogoutBtn" style="
                    width:100%;background:var(--ocean-deep);color:var(--white);
                    border:none;border-radius:8px;padding:.45rem .8rem;
                    font-size:.82rem;font-family:inherit;cursor:pointer;font-weight:700;
                ">خروج از حساب</button>
            `;
            wrap.appendChild(dd);

            const openDD  = () => { dd.style.display = 'flex'; };
            const closeDD = () => { dd.style.display = 'none'; };
            const isOpen  = () => dd.style.display === 'flex';

            accountBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isOpen() ? closeDD() : openDD();
            });
            document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) closeDD(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDD(); });
            document.getElementById('headerLogoutBtn').addEventListener('click', (e) => {
                e.stopPropagation();
                window.Auth.logoutUser();
            });
        }
    }

    /* Mobile drawer */
    const mobileAccountLink = document.querySelector('.mobile-nav-icons .mobile-icon-item:last-child');
    if (!mobileAccountLink) return;

    document.getElementById('mobileUserInfo')?.remove();
    mobileAccountLink.style.color = '';

    const mobileIconWrap = mobileAccountLink.querySelector('.mobile-icon-wrap');
    const mobileIconSvg  = mobileAccountLink.querySelector('svg');
    const mobileLabelEl  = mobileAccountLink.querySelector('span:not(.cart-badge-mobile)');

    if (!user) {
        mobileAccountLink.setAttribute('href', 'login.html');
        mobileAccountLink.onclick = () => closeMobileNav();
        if (mobileIconSvg) mobileIconSvg.innerHTML = `
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        `;
        if (mobileIconWrap) mobileIconWrap.style.background = '';
        if (mobileLabelEl)  mobileLabelEl.textContent = 'حساب کاربری';
    } else {
        mobileAccountLink.removeAttribute('href');
        mobileAccountLink.style.color = 'var(--teal)';

        if (mobileIconSvg) mobileIconSvg.innerHTML = `
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
            <polyline points="9 11 11 13 15 9" stroke-width="2.2"/>
        `;
        if (mobileIconWrap) mobileIconWrap.style.background = 'rgba(13,179,179,.2)';
        if (mobileLabelEl)  mobileLabelEl.textContent = user.name;

        /* Information card & logout button */
        const mobileUserInfo = document.createElement('div');
        mobileUserInfo.id = 'mobileUserInfo';
        mobileUserInfo.style.cssText = `
            margin:0 1.5rem 1rem;
            background:rgba(13,179,179,.08);
            border:1px solid rgba(13,179,179,.2);
            border-radius:14px;padding:1rem;
            display:flex;flex-direction:column;gap:.5rem;
        `;
        mobileUserInfo.innerHTML = `
            <div style="display:flex;align-items:center;gap:.6rem;">
                <div style="
                    width:36px;height:36px;border-radius:50%;
                    background:rgba(13,179,179,.3);
                    display:flex;align-items:center;justify-content:center;
                    font-size:1rem;flex-shrink:0;
                ">👤</div>
                <div>
                    <strong style="display:block;font-size:.88rem;color:var(--white);">${user.name}</strong>
                    <span style="font-size:.75rem;color:rgba(255,255,255,.55);">@${user.username}</span>
                </div>
            </div>
            <button id="mobileLogoutBtn" style="
                width:100%;background:rgba(255,255,255,.08);
                color:rgba(255,255,255,.8);
                border:1px solid rgba(255,255,255,.15);
                border-radius:10px;padding:.55rem;
                font-size:.85rem;font-family:inherit;
                cursor:pointer;font-weight:700;
            ">خروج از حساب</button>
        `;

        const mobileNavIcons = document.querySelector('.mobile-nav-icons');
        if (mobileNavIcons) {
            mobileNavIcons.parentElement.insertBefore(mobileUserInfo, mobileNavIcons);
        }

        document.getElementById('mobileLogoutBtn').addEventListener('click', () => {
            window.Auth.logoutUser();
        });

        mobileAccountLink.onclick = (e) => {
            e.preventDefault();
            mobileUserInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
    }
}

document.addEventListener('DOMContentLoaded', updateAuthHeader);