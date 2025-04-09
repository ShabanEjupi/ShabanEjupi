// Add descriptive alt text to all images
document.addEventListener('DOMContentLoaded', function() {
    // Add alt text for project screenshots
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const title = card.querySelector('.project-title')?.textContent || '';
        const img = card.querySelector('.project-image img');
        if (img && title) {
            img.setAttribute('alt', `${title} - Project Screenshot by Shaban Ejupi`);
            
            // Add loading="lazy" for images
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        }
    });

    // Update language attributes when language changes
    document.addEventListener('languageChanged', function() {
        updateLanguageAttributes();
    });
    
    // Set initial language attributes
    updateLanguageAttributes();
});

// Update HTML lang attribute based on selected language
function updateLanguageAttributes() {
    const currentLang = localStorage.getItem('language') || 'en';
    document.documentElement.setAttribute('lang', currentLang);
    
    // Update hreflang URLs
    document.querySelectorAll('link[rel="alternate"]').forEach(link => {
        if (link.getAttribute('hreflang') === currentLang) {
            document.querySelector('link[rel="canonical"]').setAttribute('href', link.getAttribute('href'));
        }
    });
    
    // Update meta title and description based on language
    const currentTitle = document.querySelector('title').getAttribute('data-i18n');
    const titleText = translations[currentLang][currentTitle] || document.querySelector('title').textContent;
    
    // Set dynamic meta descriptions based on language
    const descriptions = {
        'en': 'Shaban Ejupi - Software Developer & IT Professional specializing in Flutter, JavaScript, and Java. View my portfolio of web and mobile development projects.',
        'sq': 'Shaban Ejupi - Zhvillues Softueri & Profesionist IT i specializuar në Flutter, JavaScript dhe Java. Shiko portofolin tim të projekteve për zhvillim web dhe mobile.'
    };
    
    document.querySelector('meta[name="description"]').setAttribute('content', descriptions[currentLang]);
    document.querySelector('meta[property="og:title"]').setAttribute('content', titleText);
    document.querySelector('meta[property="og:description"]').setAttribute('content', descriptions[currentLang]);
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', titleText);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', descriptions[currentLang]);
}