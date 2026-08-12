/* ----- Gallery filter ----- */
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        galleryItems.forEach(item => {
            if (item.dataset.loadHidden === 'true') return;

            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

/* ----- Load more gallery ----- */
const hiddenItems = document.querySelectorAll('.gallery-item.hidden');
hiddenItems.forEach(item => { item.dataset.loadHidden = 'true'; });

function loadMore() {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;

    hiddenItems.forEach(item => {
        item.classList.remove('hidden');
        item.dataset.loadHidden = 'false';

        if (activeFilter === 'all' || item.dataset.category === activeFilter) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    document.getElementById('loadMoreBtn').style.display = 'none';
}

/* ----- Light box ----- */
function openLightbox(el) {
    const src = el.querySelector('img:not(.gallery-picture)').src;
    const lightboxContent = document.getElementById('lightboxContent');
    lightboxContent.innerHTML = `<img src="${src}" alt="">`;
    document.getElementById('lightbox').classList.add('open');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
}

document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) closeLightbox();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
});

window.addEventListener('load', () => {
    if (window.location.hash === '#gallery') {
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    }
});