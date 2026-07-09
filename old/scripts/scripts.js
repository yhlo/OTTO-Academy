// OTTO Academy Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
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

    // 2. Tutor Subject Filter
    const select = document.getElementById('imageSelect');
    const tutorCards = document.querySelectorAll('.tutor-card');

    if (select) {
        select.addEventListener('change', function () {
            const selectedVal = (this.value || '').trim();
            console.log('[Tutor Filter] Selected value:', selectedVal);

            if (!selectedVal || selectedVal === 'all') {
                // Show all tutors
                tutorCards.forEach(card => {
                    card.classList.remove('hidden');
                });
                return;
            }

            // Split selected value by comma and clean up whitespace
            const activeIds = selectedVal.split(',').map(s => s.trim()).filter(Boolean);

            tutorCards.forEach(card => {
                const img = card.querySelector('img');
                if (img && activeIds.includes(img.id)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
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