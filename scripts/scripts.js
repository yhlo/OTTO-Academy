const select = document.getElementById('imageSelect');
const images = document.querySelectorAll('.image-container img');

/**
 * Handle select change. The option value may contain a single id
 * or a comma-separated list of ids (e.g. "img1,img2").
 */
if (select) {
    select.addEventListener('change', function () {
        // hide all images first
        images.forEach(img => {
            img.classList.remove('active');
            // also hide via inline style to be robust on devices/browsers
            img.style.display = 'none';
        });

        const selectedVal = (this.value || '').trim();
        if (!selectedVal) return; // nothing selected

        // split by comma and show matching images
        const ids = selectedVal.split(',').map(s => s.trim()).filter(Boolean);
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('active');
                // make visible via inline style as well (fallback when CSS not loaded)
                el.style.display = 'block';
            }
        });
    });
}