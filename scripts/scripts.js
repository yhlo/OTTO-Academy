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
            try {
                img.style.display = 'none';
            } catch (e) {
                // ignore
            }
        });

        const selectedVal = (this.value || '').trim();
        console.log('[imageSelect] value=', selectedVal);
        if (!selectedVal) return; // nothing selected

        // split by comma and show matching images
        const ids = selectedVal.split(',').map(s => s.trim()).filter(Boolean);
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) {
                console.warn('[imageSelect] no element with id=', id);
                return;
            }
            el.classList.add('active');
            // First try to let CSS handle display by clearing inline display
            el.style.display = '';
            // If computed style still hides it, force it visible as fallback
            const cs = window.getComputedStyle ? getComputedStyle(el).display : null;
            if (!cs || cs === 'none') {
                el.style.display = 'block';
            }
            console.log('[imageSelect] show', id, 'computed display=', cs, 'inline=', el.style.display);
        });
    });
}