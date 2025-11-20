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

    const bodyLines = [];
    if (name) bodyLines.push('姓名: ' + name);
    bodyLines.push('聯絡信箱: ' + from);
    bodyLines.push('');
    bodyLines.push(message.replace(/\n/g, '\n')); // 保留使用者換行
    const body = encodeURIComponent(bodyLines.join('\n'));

    const mailtoLink = `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${body}`;

    // 連續三連擊，大幅提高開啟成功率
    location.href = mailtoLink;  // 最有效（尤其手機）

    setTimeout(() => {
        if (document.hasFocus()) {
            window.open(mailtoLink, '_blank');
        }
    }, 300);

    status.textContent = '正在開啟你的郵件應用程式…（若沒反應請點「複製」按鈕）';
    status.style.color = 'green';
});