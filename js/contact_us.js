/* ----- time slot selection ----- */
let selectedTime = null;

function selectTime(btn) {
    document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedTime = btn.textContent.trim();
}

/* ----- reservation form ----- */
function submitReserve() {
    const name   = document.getElementById('name').value.trim();
    const phone  = document.getElementById('phone').value.trim();
    const date   = document.getElementById('date').value;
    const guests = document.getElementById('guests').value;

    if (!name || !phone || !date || !guests || !selectedTime) {
        alert('لطفاً تمام فیلدهای ضروری را پر کنید و یک ساعت انتخاب کنید.');
        return;
    }

    document.getElementById('reserveForm').style.display = 'none';
    document.getElementById('successMsg').classList.add('show');
}

function resetForm() {
    document.getElementById('reserveForm').style.display = 'block';
    document.getElementById('successMsg').classList.remove('show');
    ['name', 'phone', 'date', 'guests', 'section', 'occasion', 'notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
    selectedTime = null;
}

/* ----- scroll to reserve on load ----- */
window.addEventListener('load', () => {
    if (window.location.hash === '#reserve') {
        document.getElementById('reserve').scrollIntoView({ behavior: 'smooth' });
    }
});

/* ----- min date = today ----- */
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);