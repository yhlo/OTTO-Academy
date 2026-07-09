// OTTO Academy Interactive Scripts
// ---------------------------------------------------------------------
// 師資資料：要換老師、改科系、改介紹文字，改這裡就好，不用碰 HTML。
// subjects 可填：english / math / physics / chemistry / biology / earth
// highlights：具體可信的數字/資歷，例如「雅思 7 分」「教學年資 8 年」
//             （完整介紹海報圖片裡其實都有寫，可以直接照抄過來）
// ---------------------------------------------------------------------
const TUTORS = [
    {
        id: 'img1',
        name: 'Freddy',
        img: 'img/Freddy.png',
        major: '台大 生農學院碩士',
        subjects: ['math', 'physics', 'chemistry', 'biology', 'earth'],
        desc: '透過國際期刊研究與多元教材；幫助學生建立完整學習脈絡並加深理解。',
        highlights: ['雅思 7 分', '中研院經歷']
    },
    {
        id: 'img2',
        name: 'Henry',
        img: 'img/Henry.png',
        major: '台大 生農學院',
        subjects: ['math'],
        desc: '透過對話拆解觀念，提升臨機應變與整合能力。以基礎練習搭配難題挑戰，鞏固成績並持續進步。',
        highlights: ['數學專職家教','競賽數學']
    },
    {
        id: 'img3',
        name: 'Alice',
        img: 'img/Alice.png',
        major: 'University of Stirling - MSc Health Psychology',
        subjects: ['english'],
        desc: '透過有目的的學習找到樂趣並勇敢使用；累積單字與靈活運用文法，提升寫作與口說能力。',
        highlights: ['雅思 7 分','心理學碩士']
    },
    {
        id: 'img4',
        name: 'Tomo',
        img: 'img/Tomo.png',
        major: '台大 理學院',
        subjects: ['math', 'physics', 'chemistry', 'biology', 'earth'],
        desc: '從基礎概念循序漸進，激發思考並提升解題能力；整理筆記與應用知識，讓學習更有效率也更有趣。',
        highlights: ['台大雙主修']
    },
    {
        id: 'img5',
        name: 'Charlie',
        img: 'img/Charlie.png',
        major: '台大 醫學院碩士',
        subjects: ['math', 'physics', 'chemistry', 'biology', 'earth'],
        desc: '強調數理邏輯與脈絡連結，培養直覺思維；結合實驗與研究成果，讓科學知識具象化',
        highlights: ['實驗科學']
    },
    {
        id: 'img6',
        name: 'Ming',
        img: 'img/Ming.png',
        major: '台大 醫學院碩士',
        subjects: ['english', 'math', 'physics', 'chemistry', 'biology'],
        desc: '以理解取代死記，建立知識架構並提升效率；透過情境推理與課堂練習，強化記憶與應用能力。',
        highlights: []
    }
];

const SUBJECT_LABELS = {
    english: '英文',
    math: '數學',
    physics: '物理',
    chemistry: '化學',
    biology: '生物',
    earth: '地科'
};

// 每個科目一組顏色，標籤跟篩選高亮都用這份對照表，確保視覺一致
const SUBJECT_COLORS = {
    english:   { bg: '#e0f2fe', text: '#0369a1' },
    math:      { bg: '#ede9fe', text: '#6d28d9' },
    physics:   { bg: '#fef3c7', text: '#b45309' },
    chemistry: { bg: '#dcfce7', text: '#15803d' },
    biology:   { bg: '#fce7f3', text: '#be185d' },
    earth:     { bg: '#e7e5e4', text: '#57534e' }
};

function renderTutors() {
    const container = document.getElementById('tutorContainer');
    if (!container) return;

    container.innerHTML = TUTORS.map(tutor => {
        const tags = tutor.subjects.map(s => {
            const color = SUBJECT_COLORS[s] || { bg: '#f1f5f9', text: '#475569' };
            return `<span class="tag" data-subject="${s}" style="background:${color.bg};color:${color.text};">${SUBJECT_LABELS[s] || s}</span>`;
        }).join('');

        const highlights = (tutor.highlights || [])
            .map(h => `<span class="highlight-badge">${h}</span>`)
            .join('');

        return `
            <div class="tutor-card" id="tutor-${tutor.id}" data-subjects="${tutor.subjects.join(',')}">
                <div class="tutor-image-wrapper" data-full-img="${tutor.img}">
                    <img id="${tutor.id}" src="${tutor.img}" alt="${tutor.name}" class="img_intro">
                    <div class="image-overlay">查看完整介紹 ↗</div>
                </div>
                <div class="tutor-info">
                    <h3 class="tutor-name">${tutor.name}</h3>
                    <p class="tutor-major">${tutor.major}</p>
                    <div class="tutor-tags">${tags}</div>
                    ${highlights ? `<div class="tutor-highlights">${highlights}</div>` : ''}
                    <p class="tutor-desc">${tutor.desc}</p>
                </div>
            </div>
        `;
    }).join('');

    // 圖片點擊 → 開啟完整介紹大圖（lightbox），海報裡本來就有完整學經歷
    container.querySelectorAll('.tutor-image-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            openLightbox(wrapper.dataset.fullImg);
        });
    });
}

// ---------------------------------------------------------------------
// Lightbox：點卡片圖片彈出完整介紹海報
// ---------------------------------------------------------------------
function ensureLightbox() {
    if (document.getElementById('tutorLightbox')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tutorLightbox';
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <span class="lightbox-close" aria-label="關閉">&times;</span>
        <div class="lightbox-content">
            <img src="" alt="完整師資介紹">
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function openLightbox(src) {
    ensureLightbox();
    const overlay = document.getElementById('tutorLightbox');
    overlay.querySelector('img').src = src;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const overlay = document.getElementById('tutorLightbox');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    renderTutors();

    // 1. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        if (header) {
            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                
                // Close all other FAQ items for a clean accordion effect
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('open');
                });
                
                // If it wasn't open, open it
                if (!isOpen) {
                    item.classList.add('open');
                }
            });
        }
    });

    // 2. Tutor Subject Filter (帶淡出動畫 + 對應標籤高亮)
    const select = document.getElementById('imageSelect');
    const selectWrapper = document.querySelector('.filter-select-wrapper');

    if (select) {
        select.addEventListener('change', function () {
            const selectedSubject = (this.value || '').trim();
            const tutorCards = document.querySelectorAll('.tutor-card');

            // 篩選器邊框跟著科目顏色亮起來
            if (selectWrapper) {
                if (selectedSubject === 'all' || !selectedSubject) {
                    selectWrapper.style.removeProperty('--active-color');
                    selectWrapper.classList.remove('active-filter');
                } else {
                    const color = SUBJECT_COLORS[selectedSubject];
                    if (color) selectWrapper.style.setProperty('--active-color', color.text);
                    selectWrapper.classList.add('active-filter');
                }
            }

            tutorCards.forEach(card => {
                const subjects = (card.dataset.subjects || '').split(',');
                const matches = selectedSubject === 'all' || subjects.includes(selectedSubject);

                // 對應的科目標籤加亮，其餘標籤變淡
                card.querySelectorAll('.tag').forEach(tag => {
                    const isActive = selectedSubject !== 'all' && tag.dataset.subject === selectedSubject;
                    tag.classList.toggle('tag-active', isActive);
                    tag.classList.toggle('tag-dim', selectedSubject !== 'all' && !isActive);
                });

                if (matches) {
                    card.classList.remove('hidden');
                    // 先讓瀏覽器套用 display，下一幀再移除 hiding 觸發淡入
                    requestAnimationFrame(() => card.classList.remove('hiding'));
                } else {
                    card.classList.add('hiding');
                    window.setTimeout(() => {
                        if (card.classList.contains('hiding')) {
                            card.classList.add('hidden');
                        }
                    }, 350);
                }
            });
        });
    }

    // 3. Smooth scrolling for internal anchor links (handles offset for sticky header)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70; // Matches var(--header-height)
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});