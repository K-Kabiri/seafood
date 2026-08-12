const USERS_KEY   = 'users';
const SESSION_KEY = 'session';

/* ----- Save data ----- */
function _getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
}
function _saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* session */
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
}
function _setSession(user) {
    if (!user) { localStorage.removeItem(SESSION_KEY); return; }
    const safe = { id: user.id, name: user.name, username: user.username, phone: user.phone };
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
}


function isLoggedIn() { return getCurrentUser() !== null; }

/**
 * ثبت‌نام
 * @param {{ username, name, phone, password }} data
 * @returns {{ success: boolean, message: string }}
 */
function registerUser({ username, name, phone, password }) {
    if (!username || !name || !phone || !password)
        return { success: false, message: 'همه فیلدها الزامی هستند.' };
    if (password.length < 6)
        return { success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' };
    if (!/^09\d{9}$/.test(phone))
        return { success: false, message: 'شماره تماس معتبر نیست. (مثال: ۰۹۱۱۲۳۴۵۶۷۸)' };

    const users = _getUsers();
    if (users.find(u => u.username.toLowerCase() === username.trim().toLowerCase()))
        return { success: false, message: 'این نام کاربری قبلاً ثبت شده است.' };
    if (users.find(u => u.phone === phone.trim()))
        return { success: false, message: 'این شماره تماس قبلاً ثبت شده است.' };

    const newUser = {
        id:        Date.now().toString(),
        username:  username.trim(),
        name:      name.trim(),
        phone:     phone.trim(),
        password,
        createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    _saveUsers(users);
    return { success: true, message: 'ثبت‌نام موفق!' };
}

/**
 * ورود
 * @param {{ username, password }} data
 * @returns {{ success: boolean, message: string }}
 */
function loginUser({ username, password }) {
    if (!username || !password)
        return { success: false, message: 'نام کاربری و رمز عبور الزامی هستند.' };

    const users = _getUsers();
    const user  = users.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase()
            && u.password === password
    );
    if (!user)
        return { success: false, message: 'نام کاربری یا رمز عبور اشتباه است.' };

    _setSession(user);
    return { success: true, message: 'خوش آمدید!' };
}

/**
 * خروج
 */
function logoutUser() {
    _setSession(null);
    window.location.href = 'index.html';
}

/* ----- Export ----- */
window.Auth = { isLoggedIn, getCurrentUser, registerUser, loginUser, logoutUser };


/* ----- Html codes for login page ----- */
(function initLoginPage() {
    if (document.body.dataset.page !== 'login') return;

    if (window.Auth.isLoggedIn()) { window.location.href = 'index.html'; return; }

    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const loginError    = document.getElementById('loginError');
    const loginBtn      = document.getElementById('loginBtn');
    const step1         = document.getElementById('step1');
    const step2         = document.getElementById('step2');

    function showFieldError(input, msgEl, msg) {
        input.classList.add('error');
        msgEl.textContent = msg;
        msgEl.classList.add('show');
    }
    function clearFieldError(input, msgEl) {
        input.classList.remove('error');
        msgEl.classList.remove('show');
        msgEl.textContent = '';
    }

    usernameInput.addEventListener('input', () => clearFieldError(usernameInput, usernameError));
    passwordInput.addEventListener('input', () => clearFieldError(passwordInput, passwordError));

    /* send form */
    loginBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        let valid = true;
        if (!username) { showFieldError(usernameInput, usernameError, 'نام کاربری الزامی است.'); valid = false; }
        if (!password) { showFieldError(passwordInput, passwordError, 'رمز عبور الزامی است.'); valid = false; }
        if (!valid) return;

        loginBtn.disabled   = true;
        loginBtn.textContent = 'در حال ورود...';
        if (loginError) { loginError.classList.remove('show'); loginError.textContent = ''; }

        setTimeout(() => {
            const result = window.Auth.loginUser({ username, password });
            if (result.success) {
                step1.classList.remove('active');
                step2.classList.add('active');
                const dots  = document.querySelectorAll('.step-dot');
                const lines = document.querySelectorAll('.step-line');
                dots.forEach(d  => { d.classList.remove('current'); d.classList.add('done'); });
                lines.forEach(l => l.classList.add('done'));

                setTimeout(() => {
                    const redirect = new URLSearchParams(window.location.search).get('redirect');
                    window.location.href = redirect || 'index.html';
                }, 1500);
            } else {
                if (loginError) {
                    loginError.textContent = result.message;
                    loginError.classList.add('show');
                }
                loginBtn.disabled    = false;
                loginBtn.textContent = 'ورود';
            }
        }, 400);
    });

    [usernameInput, passwordInput].forEach(el =>
        el.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); })
    );
})();


/* ----- Html codes for register page ----- */
(function initRegisterPage() {
    if (document.body.dataset.page !== 'register') return;

    if (window.Auth.isLoggedIn()) { window.location.href = 'index.html'; return; }

    const fields = {
        username: { input: document.getElementById('usernameInput'),  error: document.getElementById('usernameError')  },
        name:     { input: document.getElementById('firstNameInput'), error: document.getElementById('firstNameError') },
        phone:    { input: document.getElementById('phoneInput'),     error: document.getElementById('phoneError')     },
        password: { input: document.getElementById('passwordInput'),  error: document.getElementById('passwordError')  },
        confirm:  { input: document.getElementById('confirmInput'),   error: document.getElementById('confirmError')   },
    };
    const loginError  = document.getElementById('loginError');   /* خطای کلی */
    const registerBtn = document.getElementById('registerBtn');
    const step1       = document.getElementById('step1');
    const step2       = document.getElementById('step2');

    /* helpers */
    function showErr(key, msg) {
        const { input, error } = fields[key];
        input.classList.add('error');
        error.textContent = msg;
        error.classList.add('show');
    }
    function clearErr(key) {
        const { input, error } = fields[key];
        input.classList.remove('error');
        error.classList.remove('show');
        error.textContent = '';
    }

    Object.keys(fields).forEach(key =>
        fields[key].input.addEventListener('input', () => clearErr(key))
    );

    /* Validation */
    function validate() {
        let valid = true;
        const v = {};
        Object.keys(fields).forEach(k => { v[k] = fields[k].input.value.trim(); });
        v.confirm = fields.confirm.input.value;   /* trim نکن رمز را */
        v.password = fields.password.input.value;

        if (!v.username) { showErr('username', 'نام کاربری الزامی است.'); valid = false; }
        else if (v.username.length < 3) { showErr('username', 'حداقل ۳ کاراکتر وارد کنید.'); valid = false; }
        else if (/\s/.test(v.username)) { showErr('username', 'نام کاربری نباید فاصله داشته باشد.'); valid = false; }

        if (!v.name) { showErr('name', 'نام و نام خانوادگی الزامی است.'); valid = false; }

        if (!v.phone) { showErr('phone', 'شماره تماس الزامی است.'); valid = false; }
        else if (!/^09\d{9}$/.test(v.phone)) { showErr('phone', 'شماره تماس معتبر نیست. (مثال: ۰۹۱۱۲۳۴۵۶۷۸)'); valid = false; }

        if (!v.password) { showErr('password', 'رمز عبور الزامی است.'); valid = false; }
        else if (v.password.length < 6) { showErr('password', 'حداقل ۶ کاراکتر وارد کنید.'); valid = false; }

        if (!v.confirm) { showErr('confirm', 'تکرار رمز عبور الزامی است.'); valid = false; }
        else if (v.password !== v.confirm) { showErr('confirm', 'رمز عبور و تکرار آن یکسان نیستند.'); valid = false; }

        return valid ? { username: v.username, name: v.name, phone: v.phone, password: v.password } : null;
    }

    /* Send form */
    registerBtn.addEventListener('click', () => {
        if (loginError) { loginError.classList.remove('show'); loginError.textContent = ''; }
        const data = validate();
        if (!data) return;

        registerBtn.disabled    = true;
        registerBtn.textContent  = 'در حال ثبت‌نام...';

        setTimeout(() => {
            const result = window.Auth.registerUser(data);
            if (result.success) {
                window.Auth.loginUser({ username: data.username, password: data.password });

                step1.classList.remove('active');
                step2.classList.add('active');
                const dots  = document.querySelectorAll('.step-dot');
                const lines = document.querySelectorAll('.step-line');
                dots.forEach(d  => { d.classList.remove('current'); d.classList.add('done'); });
                lines.forEach(l => l.classList.add('done'));

                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            } else {
                if (loginError) {
                    loginError.textContent = result.message;
                    loginError.classList.add('show');
                }
                registerBtn.disabled    = false;
                registerBtn.textContent = 'ثبت‌نام';
            }
        }, 400);
    });
})();