const select = document.getElementById('imageSelect');
const images = document.querySelectorAll('.image-container img');

// Contact email address: replace this with your real inbox address
const CONTACT_EMAIL = 'learnwithotto.tw@gmail.com';

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

/* Contact form handling: build mailto: link and open user's mail client */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const status = document.getElementById('cf_status');
    const copyBtn = document.getElementById('cf_copy');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('cf_name').value.trim();
        const from = document.getElementById('cf_email').value.trim();
        const subject = document.getElementById('cf_subject').value.trim();
        const message = document.getElementById('cf_message').value.trim();

        if (!from || !subject || !message) {
            status.textContent = '請填寫完整欄位。';
            return;
        }

        // prefilling the email body with name and message
        const bodyLines = [];
        if (name) bodyLines.push('姓名: ' + name);
        bodyLines.push('聯絡信箱: ' + from);
        bodyLines.push('');
        bodyLines.push(message);
        const body = encodeURIComponent(bodyLines.join('\n'));
        const mailto = `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${body}`;

        // Try to open the user's mail client in several ways for better compatibility
        let opened = false;
        try {
            // create temporary anchor and click it (works well in many browsers)
            const a = document.createElement('a');
            a.href = mailto;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            opened = true;
        } catch (e) {
            // ignore
        }

        if (!opened) {
            try {
                // fallback to window.open
                window.open(mailto);
                opened = true;
            } catch (e) {
                // ignore
            }
        }

        if (opened) {
            status.textContent = '已在你的郵件應用建立草稿（請在郵件應用內完成並寄出）。';
        } else {
            status.textContent = '無法直接開啟郵件應用，請使用「複製內容」按鈕，或手動建立郵件並貼上內容。';
        }
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            const name = document.getElementById('cf_name').value.trim();
            const from = document.getElementById('cf_email').value.trim();
            const subject = document.getElementById('cf_subject').value.trim();
            const message = document.getElementById('cf_message').value.trim();
            const text = `主旨: ${subject}\n姓名: ${name}\n聯絡信箱: ${from}\n\n${message}`;
            navigator.clipboard?.writeText(text).then(() => {
                status.textContent = '內容已複製到剪貼簿，你可以貼到郵件或其他地方。';
            }).catch(() => {
                status.textContent = '無法複製（可能是不支援剪貼簿），請手動複製。';
            });
        });
    }
}