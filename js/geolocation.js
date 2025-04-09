// Geolocation-based language detection

document.addEventListener('DOMContentLoaded', function() {
    // Check if cookies have been accepted
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    // Only try to detect location if:
    // 1. Cookies have been accepted
    // 2. User hasn't manually set a language preference
    // 3. Location hasn't been detected yet
    if (cookieConsent === 'accepted' && 
        !localStorage.getItem('languageManuallySet') && 
        !localStorage.getItem('languageDetected')) {
        detectUserLocation();
        localStorage.setItem('languageDetected', 'true');
    }
});

function detectUserLocation() {
    // Use a free geolocation API service
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            // Check if user is in Albania or Kosovo (where Albanian is spoken)
            const country = data.country_code;
            if (country === 'AL' || country === 'XK') {
                // Set Albanian as default
                setLanguage('sq');
            } else {
                // For all other countries, set English
                setLanguage('en');
            }
        })
        .catch(error => {
            console.error('Error detecting location:', error);
            // Fallback to browser language settings
            fallbackToBrowserLanguage();
        });
}

function fallbackToBrowserLanguage() {
    // Get browser language
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Check if browser language starts with 'sq' (Albanian)
    if (browserLang.startsWith('sq')) {
        setLanguage('sq');
    } else {
        // Default to English for all other languages
        setLanguage('en');
    }
}